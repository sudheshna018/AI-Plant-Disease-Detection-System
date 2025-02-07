const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const axios = require("axios");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dh13ovagy",
  api_key: process.env.CLOUDINARY_API_KEY || "263981214276339",
  api_secret: process.env.CLOUDINARY_API_SECRET || "_PrZi_o4GksmSYnp9tlMZMNsjIA",
});

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || `mongodb+srv://rajasri:rajasri@cluster0.irmyw.mongodb.net/users?retryWrites=true&w=majority&appName=Cluster0`;
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model("User", userSchema);

// Diagnosis Schema
const diagnosisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  disease: {
    label: { type: String, required: true },
    score: { type: Number, required: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Diagnosis = mongoose.model("Diagnosis", diagnosisSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Signup Route
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(403).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Image Upload Route
app.post("/api/upload", authenticateToken, async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    const image = req.files.image;
    const buffer = image.data;

    const HUGGING_FACE_API_KEY = `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`;
    const IMAGE_CAPTION_MODEL_URL = process.env.IMAGE_CAPTION_MODEL_URL || `https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large`;
    const PLANT_DISEASE_MODEL_URL = process.env.PLANT_DISEASE_MODEL_URL || `https://api-inference.huggingface.co/models/ozair23/mobilenet_v2_1.0_224-finetuned-plantdisease`;

    // Step 1: Generate Caption
    const captionResponse = await axios.post(
      IMAGE_CAPTION_MODEL_URL,
      { inputs: buffer.toString("base64") }, // Base64 encode for caption model
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const caption = captionResponse.data?.[0]?.generated_text?.toLowerCase();
    if (!caption || !caption.includes("leaf")) {
      return res.status(400).json({ message: "Please upload an appropriate leaf image" });
    }

    // Step 2: Compress and Prepare for Disease Detection
    const compressedBuffer = await sharp(buffer).resize(224, 224).jpeg({ quality: 80 }).toBuffer();

    // Step 3: Upload to Cloudinary
    const cloudinaryResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "plant-disease-diagnoses",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(compressedBuffer);
    });

    // Step 4: Send to Plant Disease Detection Model
    const huggingFaceResponse = await axios.post(
      PLANT_DISEASE_MODEL_URL,
      compressedBuffer,
      {
        headers: {
          Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    // Extract the highest-confidence disease
    const predictions = huggingFaceResponse.data;
    const highestConfidenceDisease = predictions.reduce((best, current) =>
      current.score > best.score ? current : best
    );

    if (!highestConfidenceDisease) {
      return res.status(500).json({ message: "No disease detected" });
    }

    // Save Diagnosis to Database
    const newDiagnosis = new Diagnosis({
      userId: req.user.id,
      imageUrl: cloudinaryResponse.secure_url,
      disease: highestConfidenceDisease,
    });
    await newDiagnosis.save();

    res.json({
      diagnosis: highestConfidenceDisease,
      imageUrl: cloudinaryResponse.secure_url,
    });
  } catch (error) {
    console.error("Error processing image:", error.message);
    res.status(500).send({ message: "Error processing image", error: error.message });
  }
});

// Diagnosis history route for API
app.get("/diagnosis-history", authenticateToken, async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(diagnoses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Diagnosis history route for rendering a page
app.get("/history", authenticateToken, async (req, res) => {
  try {
    const diagnoses = await Diagnosis.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.render("history", { diagnoses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// document.getElementById("logoutButton").addEventListener("click", async () => {
//   const token = localStorage.getItem("token");

//   try {
//     // Send logout request to the backend
//     await fetch("/logout", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//   } catch (err) {
//     console.error("Logout failed:", err);
//   }

//   // Clear token and redirect
//   localStorage.removeItem("token");
//   window.location.href = "/";
// });
const FeedbackSchema = new mongoose.Schema({
  name: String,
  message: String,
  date: { type: Date, default: Date.now },
});
const Feedback = mongoose.model('Feedback', FeedbackSchema);
app.post('/api/feedback', async (req, res) => {
  const { name, message } = req.body;

  // Validate input
  if (!name || !message) {
    return res.status(400).json({ message: 'Name and message are required.' });
  }

  try {
    const feedback = new Feedback({ name, message });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ date: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
const plantDiseases = [
  {
    diseaseName: "Apple___Apple_scab",
    details: {
      disease_symptoms: "Dark, olive-green spots appear on leaves and fruits...",
      organic_treatment: "Remove infected leaves and fruit...",
      inorganic_treatment: "Use fungicides like captan...",
      preventive_measure: "Plant resistant apple varieties...",
      conclusion: "Timely removal of infected parts..."
    }
  },
  {
    diseaseName: "Apple___Black_rot",
    details: {
      disease_symptoms: "Dark, sunken spots on fruits...",
      organic_treatment: "Prune infected branches...",
      inorganic_treatment: "Apply fungicides like thiophanate...",
      preventive_measure: "Clean up fallen leaves...",
      conclusion: "Maintaining orchard hygiene..."
    }
  },
  {
    diseaseName: "Apple___Cedar_apple_rust",
    details: {
      disease_symptoms: "Bright orange or rust-colored spots on leaves and fruits. Can cause leaf drop and fruit deformation.",
      organic_treatment: "Remove nearby cedar trees or prune galls from them. Spray apple trees with sulfur-based fungicides.",
      inorganic_treatment: "Use fungicides like myclobutanil or propiconazole during early leaf development.",
      preventive_measure: "Avoid planting apples near junipers or cedar trees. Plant resistant apple varieties.",
      conclusion: "Early action and maintaining a safe distance from cedar trees can control this disease."
    }
  },
  {
    diseaseName: "Apple___healthy",
    details: {
      disease_symptoms: "Healthy apple trees have green leaves, firm fruits, and show no signs of spots or discoloration.",
      organic_treatment: "Maintain soil fertility with compost. Water trees regularly and ensure proper pruning for air circulation.",
      inorganic_treatment: "Use balanced fertilizers for optimal growth if necessary.",
      preventive_measure: "Regularly inspect for pests or diseases and act quickly. Avoid overcrowding of trees.",
      conclusion: "Healthy practices lead to strong and productive apple trees."
    }
  },
  {
    diseaseName: "Blueberry___healthy",
    details: {
      disease_symptoms: "Healthy blueberry bushes have vibrant green leaves, firm berries, and no signs of wilting or discoloration.",
      organic_treatment: "Apply mulch to retain soil moisture and keep roots cool. Use compost or organic fertilizers to nourish plants.",
      inorganic_treatment: "Apply slow-release fertilizers if needed for better yield.",
      preventive_measure: "Ensure proper drainage and plant in acidic soil. Regularly check for pests or diseases.",
      conclusion: "Proper care and maintenance result in a productive and healthy blueberry crop."
    }
  },
  {
    diseaseName: "Cherry_(including_sour)___Powdery_mildew",
    details: {
      disease_symptoms: "A white powdery coating appears on leaves, buds, and young fruits. Leaves may curl, and growth can be stunted.",
      organic_treatment: "Spray a solution of baking soda (1 teaspoon) and water (1 liter) on the affected areas. Use neem oil for early treatment.",
      inorganic_treatment: "Apply sulfur-based or potassium bicarbonate fungicides during early infection.",
      preventive_measure: "Ensure proper air circulation by pruning. Avoid excessive use of nitrogen fertilizers.",
      conclusion: "With early detection and proper sprays, powdery mildew can be controlled effectively."
    }
  },
  {
    diseaseName: "Cherry_(including_sour)___healthy",
    details: {
      disease_symptoms: "Healthy cherry trees have lush green leaves, healthy fruit, and no visible signs of disease such as spots, wilting, or deformities.",
      organic_treatment: "Maintain good soil health with organic compost, and use neem oil or insecticidal soap to prevent pest infestations.",
      inorganic_treatment: "Apply balanced fertilizers to support strong growth, and treat with fungicides like copper-based products if any disease signs appear.",
      preventive_measure: "Ensure proper spacing between trees for air circulation, regularly prune to remove any dead or diseased wood, and monitor for pests.",
      conclusion: "Healthy cherry trees thrive with proper care, regular monitoring for pests, and good cultural practices, ensuring high-quality fruit production."
    }
  },

{
  diseaseName:"Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot",
  details:{
    disease_symptoms: "Small, rectangular gray or tan spots form on leaves, eventually merging and causing leaf death.",
    organic_treatment: "Remove infected leaves and crop debris. Use compost tea as a preventive spray.",
    inorganic_treatment: "Apply fungicides like azoxystrobin or pyraclostrobin early in the season.",
    preventive_measure: "Rotate crops yearly and avoid planting corn in the same field. Use resistant corn varieties.",
    conclusion: "Timely removal of infected material and fungicide application protect the crop."
  }
}
,
{
  diseaseName: "Corn_(maize)_Common_rust",
  details: {
  disease_symptoms: "Reddish-brown pustules appear on both sides of leaves and sometimes on stalks, weakening the plant.",
  organic_treatment: "Encourage good airflow by spacing plants properly. Apply sprays like neem oil early.",
  inorganic_treatment: "Use fungicides such as tebuconazole or azoxystrobin for control.",
  preventive_measure: "Plant resistant corn varieties and maintain good crop rotation practices.",
  conclusion: "Managing rust early and maintaining good farming practices can ensure a healthy yield." }
}
,
{
  diseaseName: "Corn_(maize)_Northern_Leaf_Blight",
  details: {
  disease_symptoms: "Large, grayish-brown, cigar-shaped lesions appear on leaves, reducing photosynthesis and yield.",
  organic_treatment: "Remove infected leaves and crop debris. Use natural sprays like garlic or onion extract.",
  inorganic_treatment: "Apply fungicides such as mancozeb or chlorothalonil as soon as symptoms appear.",
  preventive_measure: "Plant resistant hybrids and rotate crops. Avoid overwatering the plants.",
  conclusion: "Early treatment and resistant varieties are key to controlling Northern Leaf Blight." }
},

{
  diseaseName: "Corn_(maize)_healthy",
  details: {
  disease_symptoms: "Healthy corn plants have green, upright leaves with no discoloration or lesions. Stalks are strong, and ears are well-formed.",
  organic_treatment: "Use organic compost to enrich the soil. Water the plants evenly and avoid waterlogging.",
  inorganic_treatment: "Use balanced fertilizers with appropriate nitrogen levels for better growth.",
  preventive_measure: "Inspect plants regularly for pests or diseases and act quickly if problems arise. Practice crop rotation.",
  conclusion: "Proper care, balanced nutrients, and timely observation keep corn plants healthy."   }

},

{
  diseaseName: "Grape___Black_rot",
  details: {
  disease_symptoms: "Brown circular spots appear on leaves with black fruiting bodies in the center. Fruits develop dark, shriveled areas, turning black and mummified.",
  organic_treatment: "Prune and remove infected leaves and fruits. Spray with neem oil or compost tea to prevent spread.",
  inorganic_treatment: "Apply fungicides like myclobutanil or captan at the first sign of disease.",
  preventive_measure: "Plant resistant grape varieties and maintain good air circulation by spacing vines properly.",
  conclusion: "Early pruning and regular sprays can protect your vineyard from severe losses." }

},

{
  diseaseName: "Grape__Esca(Black_Measles)",
  details: {
  disease_symptoms: "Dark streaks appear on leaves, and fruits show sunken, discolored spots. Over time, plants may show stunted growth.",
  organic_treatment: "Remove and destroy infected plant parts. Apply compost or organic fertilizers to strengthen the plant.",
  inorganic_treatment: "Use systemic fungicides such as tebuconazole for managing the disease.",
  preventive_measure: "Avoid wounding the vines during pruning. Ensure proper drainage and air circulation.",
  conclusion: "Regular care and avoiding vine injury are essential to prevent Esca."   }

},

{
  diseaseName: "Grape__Leaf_blight(Isariopsis_Leaf_Spot)",
  details: {
  disease_symptoms: "Brown or black spots form on the leaves, often surrounded by a yellow halo. Severe cases may lead to leaf drop.",
  organic_treatment: "Remove and destroy infected leaves. Use a garlic spray or neem oil to reduce spread.",
  inorganic_treatment: "Apply fungicides like mancozeb or captan to protect healthy leaves.",
  preventive_measure: "Keep vineyards well-pruned and remove fallen leaves to reduce infection sources.",
  conclusion: "Timely removal of infected leaves and preventive fungicide application are key."  }
  
},

{
  diseaseName:  "Grape___healthy",
  details: {
  disease_symptoms: "Healthy grapevines have green, vibrant leaves with no spots or discoloration. Fruits are firm and well-formed.",
  organic_treatment: "Provide compost to enrich the soil. Water the vines regularly but avoid waterlogging.",
  inorganic_treatment: "Use balanced fertilizers with micronutrients like potassium for better growth.",
  preventive_measure: "Prune the vines for better airflow and regularly check for early signs of pests or diseases.",
  conclusion: "Good vineyard management practices ensure healthy growth and high yield."   }
 
},

{
  diseaseName:  "Orange__Haunglongbing(Citrus_greening)",
  details: {
  disease_symptoms: "Yellowing of leaves, misshapen fruits, and stunted growth. Fruits often taste bitter and remain green.",
  organic_treatment: "Use neem oil or organic insecticides to control the psyllid population that spreads the disease.",
  inorganic_treatment: "Apply systemic insecticides like imidacloprid to control psyllids effectively.",
  preventive_measure: "Plant disease-free saplings and regularly inspect for psyllids. Remove infected trees to prevent spread.",
  conclusion: "Early detection and psyllid control are crucial to managing Citrus Greening."   }

},

{
  diseaseName:  "Peach___Bacterial_spot",
  details: {
  disease_symptoms: "Small, dark spots on leaves that enlarge and turn into irregular, greasy lesions. Fruits may develop sunken, scabby spots.",
  organic_treatment: "Apply copper-based sprays or organic bactericides like Serenade. Remove and destroy infected plant material.",
  inorganic_treatment: "Use copper fungicides like copper hydroxide during early stages of the disease.",
  preventive_measure: "Plant resistant varieties and avoid overhead irrigation. Ensure good airflow by proper pruning.",
  conclusion: "Managing bacterial spot involves early treatment and maintaining hygienic orchard practices."   }
 
},

{
  diseaseName:  "Peach___healthy",
  details: {
  disease_symptoms: "Healthy peach trees have vibrant green leaves without any spots or lesions. Fruits develop uniformly without blemishes.",
  organic_treatment: "Use compost or organic fertilizers to promote healthy growth. Ensure the soil is well-drained.",
  inorganic_treatment: "Apply balanced NPK fertilizers as needed for optimal growth and fruiting.",
  preventive_measure: "Inspect trees regularly and prune to maintain good air circulation. Remove weeds and debris around the base.",
  conclusion: "Good soil management and timely pruning keep peach trees healthy and productive."   }
},

{
  diseaseName:  "Pepper,bell__Bacterial_spot",
  details: {
  disease_symptoms: "Small, water-soaked spots appear on leaves and fruits, enlarging into dark, irregular lesions. Leaves may drop prematurely.",
  organic_treatment: "Spray neem oil or garlic extract early to control bacterial spread. Remove infected leaves.",
  inorganic_treatment: "Apply copper-based bactericides or antibiotics like streptomycin for effective control.",
  preventive_measure: "Use disease-free seeds and avoid overhead irrigation. Practice crop rotation.",
  conclusion: "Early control of bacterial spots ensures healthy pepper plants and a good yield."    }
  
},

{
  diseaseName:  "Pepper,bell__healthy",
  details: {
  disease_symptoms: "Healthy pepper plants have green, smooth leaves and firm fruits without blemishes.",
  organic_treatment: "Enrich soil with organic compost and provide consistent watering.",
  inorganic_treatment: "Use balanced fertilizers with adequate potassium and phosphorus.",
  preventive_measure: "Inspect plants regularly for early signs of pests or diseases. Provide adequate spacing for air circulation.",
  conclusion: "With proper care, bell pepper plants stay healthy and yield high-quality fruits."  }
 
},

{
  diseaseName:  "Potato___Early_blight",
  details: {
  disease_symptoms: "Dark brown spots with concentric rings appear on older leaves. Leaves may yellow and die, reducing tuber size.",
  organic_treatment: "Apply neem oil or a solution of baking soda and water to infected plants.",
  inorganic_treatment: "Use fungicides like chlorothalonil or mancozeb as soon as symptoms appear.",
  preventive_measure: "Practice crop rotation and avoid planting potatoes in the same soil consecutively. Remove infected plant debris.",
  conclusion: "Early detection and proper fungicide application help in managing early blight effectively."  }

},

{
  diseaseName: "Potato___Late_blight",
  details: {
  disease_symptoms: "Large, irregular dark brown spots with pale green borders appear on leaves. Plants may wilt, and tubers can rot.",
  organic_treatment: "Use copper-based fungicides or homemade sprays with baking soda and water. Remove infected plant material immediately.",
  inorganic_treatment: "Apply systemic fungicides like metalaxyl or mefenoxam during early stages of disease.",
  preventive_measure: "Ensure good air circulation around plants, avoid overhead watering, and remove infected plant debris.",
  conclusion: "Late blight can devastate a potato crop, but early detection and regular fungicide application can minimize damage."     }

},

{
  diseaseName:"Potato___healthy",
  details:{
  disease_symptoms: "Healthy potato plants have vibrant green leaves, strong stems, and smooth, firm tubers.",
  organic_treatment: "Provide well-drained soil, enrich it with compost, and water regularly to promote strong growth.",
  inorganic_treatment: "Use balanced fertilizers with adequate nitrogen, phosphorus, and potassium to support healthy growth.",
  preventive_measure: "Inspect plants regularly, control pests, and maintain proper soil conditions.",
  conclusion: "Healthy potato plants require good soil management, pest control, and proper irrigation to thrive."   }

},
{
  diseaseName:"Raspberry___healthy",
  details:{
  disease_symptoms: "Healthy raspberry plants have green, vibrant leaves with no signs of wilting or discoloration. The fruits are firm and ripe.",
  organic_treatment: "Use organic compost and mulch to enrich the soil. Water consistently but avoid over-watering.",
  inorganic_treatment: "Fertilize with a balanced, slow-release fertilizer for continuous nutrient supply.",
  preventive_measure: "Prune regularly to improve air circulation and remove dead wood.",
  conclusion: "Healthy raspberry plants benefit from proper care, including regular pruning and appropriate watering practices."  }

},
{  
  diseaseName:"Soybean___healthy",
  details:{
  disease_symptoms: "Healthy soybean plants show lush, green leaves and strong stems. There are no yellowing or wilting signs.",
  organic_treatment: "Add organic compost to the soil to enhance fertility. Ensure proper soil drainage to avoid waterlogging.",
  inorganic_treatment: "Use a balanced fertilizer with adequate nitrogen, phosphorus, and potassium to support growth.",
  preventive_measure: "Rotate crops and maintain proper spacing to avoid pests and disease buildup.",
  conclusion: "Soybean plants thrive with balanced nutrition, proper spacing, and consistent watering."   }

},
{
   diseaseName:"Squash___Powdery_mildew",
   details: {
  disease_symptoms: "White, powdery fungal growth appears on the leaves, followed by yellowing and leaf drop. Affects plant growth.",
  organic_treatment: "Spray with a mixture of baking soda and water or neem oil to control the spread of the fungus.",
  inorganic_treatment: "Use fungicides containing sulfur or potassium bicarbonate to control the fungus.",
  preventive_measure: "Provide good air circulation by spacing plants properly and remove infected leaves immediately.",
  conclusion: "Preventive measures and early treatment can control powdery mildew and prevent damage to squash crops."    }

},
{
  diseaseName:"Strawberry___Leaf_scorch",
  details:{
  disease_symptoms: "Yellow or brown spots appear along the edges of leaves, which may then curl or dry out. Severe cases lead to leaf drop.",
  organic_treatment: "Use compost teas or neem oil to help control the spread of the disease. Remove infected leaves regularly.",
  inorganic_treatment: "Apply fungicides containing copper or sulfur to treat the infected plants.",
  preventive_measure: "Ensure good air circulation around the plants and avoid overhead watering to reduce humidity around the leaves.",
  conclusion: "Leaf scorch can be managed by maintaining proper plant care, including timely removal of affected leaves and preventing water stress."}

},
{
  diseaseName:"Strawberry___healthy",
  details:{
  disease_symptoms: "Healthy strawberry plants have vibrant green leaves with no discoloration. The fruit develops evenly and remains firm.",
  organic_treatment: "Use organic fertilizers like compost and mulch to maintain soil moisture and fertility.",
  inorganic_treatment: "Use a balanced fertilizer rich in potassium to encourage strong growth and fruiting.",
  preventive_measure: "Mulch around the plants to keep the roots cool and prevent weed growth. Prune regularly to allow good air circulation.",
  conclusion: "Healthy strawberries require well-drained soil, consistent watering, and regular maintenance to prevent pests and diseases."    }

},
{
   diseaseName:"Tomato___Bacterial_spot",
   details: {
  disease_symptoms: "Small, water-soaked spots with a yellow halo appear on the leaves. Spots may merge, causing extensive leaf damage.",
  organic_treatment: "Spray with copper-based fungicides or use homemade garlic or neem oil sprays for control.",
  inorganic_treatment: "Apply copper sulfate or other copper-based bactericides to control the bacterial spread.",
  preventive_measure: "Avoid overhead watering, use disease-resistant varieties, and remove infected plant material immediately.",
  conclusion: "Bacterial spot can be controlled by using proper treatments and preventing the spread through hygiene and careful management."   }

},
{
  diseaseName:"Tomato___Early_blight",
  details:{
  disease_symptoms: "Dark, concentric rings appear on older leaves, which turn yellow and die. Early blight leads to defoliation, affecting fruit production.",
  organic_treatment: "Use neem oil or a mixture of baking soda and water to prevent fungal spread. Remove infected leaves promptly.",
  inorganic_treatment: "Apply fungicides containing chlorothalonil or mancozeb to control the infection.",
  preventive_measure: "Ensure proper spacing between plants, remove plant debris, and practice crop rotation to avoid recurrence.",
  conclusion: "Early blight can significantly reduce yields, but early intervention and good crop management practices help prevent damage."    }
},
{
  diseaseName:"Tomato___Late_blight",
   details: {
  disease_symptoms: "Dark, irregular lesions appear on leaves and stems, with a white, fuzzy growth on the underside. Fruits may rot and turn mushy.",
  organic_treatment: "Use copper-based fungicides or neem oil to manage late blight. Remove and destroy infected plant material.",
  inorganic_treatment: "Apply systemic fungicides like metalaxyl or mefenoxam for more effective control of the disease.",
  preventive_measure: "Avoid waterlogging and practice crop rotation to prevent the buildup of the disease. Remove any infected plants promptly.",
  conclusion: "Late blight is a serious disease that requires quick action to protect tomato crops, including timely fungicide use and proper plant care."    }

},
{
  diseaseName:"Tomato___Leaf_Mold",
  details: {
  disease_symptoms: "Yellowish patches appear on the upper leaf surfaces, with a white, fuzzy mold on the underside. Leaves eventually turn brown and fall off.",
  organic_treatment: "Spray with neem oil or a mixture of water and baking soda to control fungal growth.",
  inorganic_treatment: "Use copper-based fungicides to treat affected plants and prevent further spread of the disease.",
  preventive_measure: "Provide adequate spacing between plants for good air circulation, and avoid overhead watering to reduce humidity.",
  conclusion: "Leaf mold can severely damage tomato plants, but early detection and effective treatment can minimize crop loss."   }

},
{
  diseaseName:"Tomato___Septoria_leaf_spot",
  details: {
  disease_symptoms: "Small, dark brown to black spots with concentric rings appear on the leaves. The leaves turn yellow and may drop prematurely.",
  organic_treatment: "Use a solution of neem oil or baking soda with water to reduce the spread of fungal spores.",
  inorganic_treatment: "Apply copper-based fungicides to control the disease and protect healthy plant tissue.",
  preventive_measure: "Practice crop rotation, remove infected leaves immediately, and avoid working with plants when wet to reduce fungal spread.",
  conclusion: "Septoria leaf spot can reduce tomato yields, but proper care and timely fungicide treatments can help manage the disease."    }

},
{
  diseaseName:"Tomato___Spider_mites_Two-spotted_spider_mite",
  details:{
  disease_symptoms:"Leaves show stippling (small white or yellow spots), and webbing may appear on plants. Leaves eventually turn yellow and may fall off.",
  organic_treatment: "Use insecticidal soap or neem oil to control spider mites. Introduce predatory mites as natural pest control.",
  inorganic_treatment: "Apply miticides containing chemicals like abamectin or chlorfenapyr to target the mites.",
  preventive_measure: "Maintain good plant hygiene, control dust, and avoid over-watering to minimize mite populations.",
  conclusion: "Spider mites can cause significant damage to tomato plants if not controlled, but early action can prevent widespread infestation."   }

},
{
   diseaseName:"Tomato___Target_Spot",
   details: {
  disease_symptoms: "Round, dark brown spots with concentric rings appear on the leaves. Infected leaves turn yellow and eventually fall off.",
  organic_treatment: "Use neem oil or sulfur-based fungicides to reduce the spread of the fungus.",
  inorganic_treatment: "Apply fungicides containing chlorothalonil or mancozeb to control the disease.",
  preventive_measure: "Provide proper spacing for plants, remove infected leaves, and avoid wetting the leaves during watering.",
  
  conclusion: "Target spot can damage tomato plants, but with good cultural practices and timely fungicide treatments, it can be controlled."    }

},
{
   diseaseName:"Tomato___Yellow_Leaf_Curl_Virus",
   details: {
  disease_symptoms: "Yellowing of the leaves, stunted growth, and curling of the leaves. Affected plants may also show reduced fruit production.",
  organic_treatment: "There are no effective organic treatments for this virus. Remove and destroy infected plants to prevent spread.",
  inorganic_treatment: "There are no chemical treatments for the virus. Control is best through management of vector pests like whiteflies.",
  preventive_measure: "Use insect nets to protect plants from insect vectors, and remove any infected plants promptly.",
  conclusion: "Yellow leaf curl virus is challenging to manage, but preventing vector insects and early removal of infected plants can help control its spread."
}
},
{
   diseaseName:"Tomato___Mosaic_virus",
   details: {
  disease_symptoms: "Mosaic patterns of light and dark green appear on the leaves, and plants may exhibit stunted growth and reduced fruit quality.",
  organic_treatment: "There are no effective organic treatments for this virus. Control is primarily through managing insect vectors and removing infected plants.",
  inorganic_treatment: "There are no chemical treatments for the virus. Control relies on removing infected plants and controlling aphid populations.",
  preventive_measure: "Use virus-resistant varieties, avoid handling infected plants, and control aphid populations to reduce virus spread.",
  conclusion: "Mosaic virus can severely affect tomato crops, but by removing infected plants and controlling aphids, the spread of the virus can be minimized."}
},
{
 diseaseName:"Tomato___healthy",
   details:{
  disease_symptoms: "Healthy tomato plants have bright green leaves, sturdy stems, and the fruit ripens uniformly with no discoloration or blemishes.",
  organic_treatment: "Feed plants with compost and organic fertilizers to ensure healthy growth. Water regularly and provide good drainage.",
  inorganic_treatment: "Use balanced fertilizers and ensure plants receive adequate nutrients for strong growth and fruiting.",
  preventive_measure: "Practice crop rotation, ensure proper spacing for air circulation, and monitor for pests and diseases regularly.",
  conclusion: "Healthy tomato plants require good care, including proper soil management, regular watering, and pest control to produce high-quality fruits." }
}

// Add more diseases from your dataset
];
  // Add more diseases from your dataset

// Endpoint to retrieve the disease details
app.get("/api/diseases", (req, res) => {
  try {
    res.json(plantDiseases);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve disease data" });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

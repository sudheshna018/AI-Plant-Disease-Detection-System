import React from "react";
import './Blog.css';

// Blog data array
const blogPosts = [
  {
    image: "disease7.jpg",
    alt: "Blog 1 Image",
    title: "Leaf Spots",
    description: `
      Symptoms: Circular dark spots on leaves, often with a yellow halo, leading to premature leaf drop.
      Management:
      Remove and destroy infected leaves. Avoid overhead watering and keep leaves dry.
      Use fungicides like chlorothalonil or copper sprays if needed.
    `,
    link: "https://extension.umn.edu/plant-diseases/leaf-spot-diseases-trees-and-shrubs",
  },
  {
    image: "disease2.jpg",
    alt: "Blog 2 Image",
    title: "Powdery Mildew",
    description: `
      Symptoms: White or gray powdery spots on leaves, stems, and flowers. It can stunt growth and reduce yields.
      Management:
      Improve air circulation by spacing plants adequately. Avoid wetting foliage and apply sulfur or neem oil as a treatment.
      Plant resistant varieties when available.
    `,
    link: "https://hort.extension.wisc.edu/articles/powdery-mildew-vegetables/",
  },
  {
    image: "disease3.jpg",
    alt: "Blog 3 Image",
    title: "Root Rot",
    description: `
      Symptoms: Wilting plants, yellowing leaves, and mushy or decayed roots caused by overwatering or poorly draining soil.
      Management:
      Avoid overwatering and ensure soil has proper drainage. Remove infected plants and improve soil health with compost.
      Use fungicide-treated soil if planting again in the same area.
    `,
    link: "https://hort.extension.wisc.edu/articles/root-rots-garden/",
  },
  {
    image: "disease4.jpg",
    alt: "Blog 4 Image",
    title: "Blight",
    description: `
      Symptoms: Dark, water-soaked lesions on leaves, stems, and fruit, often spreading quickly in wet conditions.
      Management:
      Remove and destroy infected plants promptly. Avoid wetting foliage and improve airflow.
      Apply fungicides containing copper or chlorothalonil.
    `,
    link: "https://www.britannica.com/science/plant-disease/Soil-pH",
  },
  {
    image: "disease5.jpg",
    alt: "Blog 5 Image",
    title: "Mosaic Virus",
    description: `
      Symptoms: Leaves develop yellow, green, or white mottled patterns, often accompanied by stunted growth or curling.
      Management:
      Remove infected plants immediately. Control insect vectors like aphids and thrips using neem oil or insecticidal soap.
      Plant virus-resistant varieties.
    `,
    link: "https://www.planetnatural.com/pest-problem-solver/plant-disease/mosaic-virus/",
  },
  {
    image: "disease6.jpg",
    alt: "Blog 6 Image",
    title: "Rust",
    description: `
      Symptoms: Small orange, yellow, or brown pustules on leaves and stems, reducing vigor and photosynthesis.
      Management:
      Remove infected leaves and ensure good air circulation. Avoid overhead watering.
      Apply sulfur-based fungicides or copper sprays.
    `,
    link: "https://www.sciencedirect.com/topics/agricultural-and-biological-sciences/rust-diseases",
  },
];

// BlogPost Component
const BlogPost = ({ post }) => {
  // Get current date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="blog-post">
      <img src={post.image} alt={post.alt} />
      <div className="blog-content">
        <p className="date">{formattedDate} | 1 min read</p>
        <h2 className="title">{post.title}</h2>
        <p className="description">{post.description}</p>
        <a href={post.link} className="read-more" target="_blank" rel="noopener noreferrer">
          Read More
        </a>
      </div>
    </div>
  );
};

// BlogSection Component
const BlogSection = () => (
  <section className="blog-section">
    <h1>
      MY <span className="highlight">BLOG</span>
    </h1>
    <p style={{ color: "white", fontSize: "1.1em" }}>
      We have designed a blog for user understanding of plant diseases. Here are a few mentioned below:
    </p>
    <div className="blog-container">
      {blogPosts.map((post, index) => (
        <BlogPost key={index} post={post} />
      ))}
    </div>
  </section>
);

export default BlogSection;

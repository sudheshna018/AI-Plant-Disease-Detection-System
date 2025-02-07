import React from 'react';
import './Aboutus.css';
 // Assuming you want to keep your CSS in a separate file

const AboutUs = () => {
  
    return (
        
        <section className="about" id="about">
          <div className="max-width">
            <h2 className="title" style={{color: '#d2691e'}}>About Us</h2>
            <div className="about-content">
              <div className="column left">
                <img src="abo1.jpg" alt="" />
              </div>
              <div className="column right">
                <div className="text"style={{color: '#8b4513'}}>Mission
                  {/* <span class="typing-2"></span> */}
                </div>
                <p>Our mission is to revolutionize agriculture by equipping farmers and agricultural professionals with cutting-edge AI-driven solutions for precise and efficient plant disease detection.</p>
                
                <div className="text-in">
                <h3 style={{color: '#003d19'}}>Key Objectives:</h3>
               <ul>
                  <li> <strong style={{color: '#8b4513'}}>Proactive Disease Management:</strong> Facilitate early detection of plant diseases to mitigate crop damage before it escalates.</li>
                  <li> <strong style={{color: '#8b4513'}}>Optimized Crop Productivity:</strong> Enhance agricultural output by addressing issues at their root, ensuring healthier and more abundant yields.</li>
                  <li> <strong style={{color: '#8b4513'}}>Seamless Usability:</strong> Deliver an intuitive and accessible user experience tailored to the needs of diverse stakeholders in the agricultural ecosystem.</li>
                  <li> <strong style={{color: '#8b4513'}}>Cost Efficiency:</strong> Reduce operational costs by minimizing waste, preventing extensive crop loss, and streamlining resource utilization.</li>
                  <li><strong style={{color: '#8b4513'}}>Knowledge Empowerment:</strong> Foster a deeper understanding of plant health dynamics through data-driven insights and advanced analytics.</li>
                </ul>
                </div>            
              </div>
            </div>
          </div>
        </section>
    );
};

export default AboutUs;

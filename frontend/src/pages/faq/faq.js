import React, { useState } from "react";
import "./faq.css";

const FAQ = () => {
  const faqs = [
    {
      question: "What is the goal of this website?",
      answer:
        "Provide a tool to quickly identify diseases, enabling timely intervention to prevent crop loss. Reduce the need for expensive lab tests or frequent expert consultations by offering an affordable and easy-to-use alternative.",
    },
    {
      question: "How does the model perform under real-world conditions?",
      answer:
        "Performance may degrade under poor lighting, occlusion, or noise. However, robust training with diverse, augmented data can improve real-world applicability.",
    },
    {
      question: "What types of files can I upload?",
      answer:
        "You can upload image files in common formats such as JPEG, PNG, and BMP. Ensure the images are clear and not excessively compressed for best results.",
    },
    {
      question: "What is the accuracy of the model?",
      answer:
        "The model's accuracy depends on the dataset and training quality. Typically, a well-trained CNN can achieve accuracies between 85% and 98% for plant disease detection tasks.",
    },
  ];

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h3 className="faq-subheading">FREQUENTLY ASKED QUESTIONS</h3>
        <h2 className="faq-heading">
          Questions? <span className="highlight">We’ve Got Answers.</span>
        </h2>
      </div>
      <div className="faq-content">
        {faqs.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
};

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <div className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        <button className="toggle-btn">{isOpen ? "−" : "+"}</button>
      </div>
      {isOpen && <p className="faq-answer">{answer}</p>}
    </div>
  );
};

export default FAQ;

import React, { useState } from 'react';
import axios from 'axios';

function FeedbackForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://ai-plant-disease-detection-system-2-1.onrender.com/api/feedback', { name, message });
      setSuccess('Feedback submitted successfully!');
      setName('');
      setMessage('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSuccess('Error submitting feedback.');
    }
  };

  const styles = {
    container: {
      width: '90%',
      margin: '50px auto',
      height: '500px',
      padding: '30px',
      borderRadius: '10px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backgroundImage: `url("/image.jpeg")`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      fontFamily: "'Arial', sans-serif",
      transition: 'max-width 0.3s ease',
    },
    title: {
      fontSize: '2.5rem', // Adjusted for smaller screens
      marginBottom: '40px',
      color: 'white',
      textAlign: 'center',
      fontWeight: 'bold',
      fontFamily: 'system-ui',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    input: {
      width: '100%', // Takes full width on small screens
      maxWidth: '500px', // Limit max width
      padding: '15px',
      marginBottom: '20px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '16px', // Slightly smaller font for better readability on small screens
      backgroundColor: '#dee063',
    },
    textarea: {
      width: '100%', // Takes full width on small screens
      maxWidth: '500px', // Limit max width
      padding: '15px',
      marginBottom: '20px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '16px', // Adjusted for smaller screens
      resize: 'none',
      height: '80px',
      backgroundColor: '#dee063',
    },
    button: {
      backgroundColor: '#007bff',
      width: '120px',
      margin: 'auto',
      color: '#fff',
      border: 'none',
      padding: '15px',
      borderRadius: '20px',
      fontSize: '20px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    buttonHover: {
      backgroundColor: '#2b5426',
      color: 'white',
      fontSize: '25px',
    },
    message: (isError) => ({
      fontSize: '16px', // Adjusted font size for smaller screens
      textAlign: 'center',
      marginTop: '15px',
      color: isError ? 'red' : 'white',
    }),
    // Media queries for responsiveness
    '@media (max-width: 768px)': {
      container: {
        padding: '20px', // Reduced padding for smaller screens
      },
      title: {
        fontSize: '2rem', // Smaller title for small screens
      },
      input: {
        width: '90%', // Inputs take more width on smaller screens
      },
      textarea: {
        width: '90%', // Textarea takes more width on smaller screens
      },
      button: {
        width: '100%', // Button takes full width on smaller screens
        padding: '12px', // Reduced padding
        fontSize: '18px', // Slightly smaller font
      },
    },
    '@media (max-width: 480px)': {
      container: {
        padding: '15px', // Further reduced padding for very small screens
      },
      title: {
        fontSize: '1.5rem', // Even smaller title for very small screens
      },
      input: {
        width: '80%', // Inputs take even more width on extra small screens
      },
      textarea: {
        width: '80%', // Textarea also takes more width on small screens
      },
      button: {
        width: '100%', // Full width button for very small screens
        padding: '10px', // Smaller button padding
        fontSize: '16px', // Smaller font for very small screens
      },
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Feedback Form</h1>
      {success && (
        <p style={styles.message(success.includes('Error'))}>{success}</p>
      )}
      <form style={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
          required
        />
        <textarea
          placeholder="Your Feedback"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={styles.textarea}
          required
        ></textarea>
        <button
          type="submit"
          style={styles.button}
          onMouseOver={(e) =>
            (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)
          }
          onMouseOut={(e) =>
            (e.target.style.backgroundColor = styles.button.backgroundColor)
          }
        >
          Submit
        </button>
      </form>
    </div>
  );
}

export default FeedbackForm;


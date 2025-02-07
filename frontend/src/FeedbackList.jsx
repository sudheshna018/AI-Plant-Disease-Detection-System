import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('https://ai-plant-disease-detection-system-2-1.onrender.com/api/feedback');
        setFeedbacks(response.data);
      } catch (error) {
        console.error('Error fetching feedbacks:', error);
      }
    };

    fetchFeedbacks();
  }, []);

  const styles = {
    page: {
      width: '90%', 
      maxWidth: '1400px', 
      margin: '20px auto', 
      padding: '25px 20px', 
      backgroundColor: '#1b4332', 
       
    },
    title: {
      textAlign: 'center', 
      fontSize: '2.5rem', 
      color: 'white', 
      marginTop: '10px', 
      marginBottom: '30px', 
      fontFamily: 'system-ui', 
    },
    container: {
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      overflow: 'hidden', 
     
    },
    card: {
      flex: '0 0 auto', 
      maxWidth: '300px', 
      minHeight: '200px', 
      backgroundColor: '#d4edda', 
      padding: '20px', 
      borderRadius: '10px', 
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', 
      textAlign: 'center', 
      color: '#155724', 
      display: 'flex', 
      flexDirection: 'column', 
      margin: '0 10px', 
    },
    name: {
      fontWeight: 'bold', 
      fontSize: '25px', 
      marginBottom: '10px', 
    },
    message: {
      fontSize: '20px', 
      marginBottom: '15px', 
    },
    date: {
      fontSize: '15px',
      color: '#6c757d',
      position: 'absolute', 
      bottom: '10px', 
      right: '25px',
    },
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>What Our Users Say</h1>
      <div style={styles.container}>
        <Swiper
          modules={[Navigation]}
          spaceBetween={30}
          slidesPerView={3} 
          navigation 
          className="mySwiper" 
        >
          {feedbacks.map((feedback) => (
            <SwiperSlide key={feedback._id}>
              <div style={styles.card}>
                <span style={styles.name}>{feedback.name}</span>
                <span style={styles.message}>{feedback.message}</span>
                <span style={styles.date}>{new Date(feedback.date).toLocaleString()}</span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default FeedbackList;
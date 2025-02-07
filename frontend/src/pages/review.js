import React, { useEffect, useState } from "react";
import axios from "axios";

function FeedbackDisplay({ type }) {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`/feedbacks?type=${type}`);
        setFeedbacks(response.data);
      } catch (error) {
        console.error("Error fetching feedbacks:", error.message);
      }
    };

    fetchFeedbacks();
  }, [type]);

  return (
    <div>
      <h2>User Reviews</h2>
      <ul>
        {feedbacks.map((feedback) => (
          <li key={feedback._id}>
            {feedback.feedback}
            <small> - {new Date(feedback.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FeedbackDisplay;

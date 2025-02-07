import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./styles.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://ai-plant-disease-detection-system-2-1.onrender.com/signup", { username, email, password });
      navigate("/login");
    } catch (err) {
      console.error(err.response.data.message);
    }
  };

  return (
    <div className="body">
    <div className="login-container">
      <div className="left-section">
        {/* Left Section: Decorative Background */}
      </div>
      <div className="right-section">
        <form onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Signup</button>
          <a href="/login">Already have an account? Login</a>
        </form>
      </div>
    </div>
    </div>
  );
}

export default Signup;

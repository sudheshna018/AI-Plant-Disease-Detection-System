import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import AboutUs from "./pages/Aboutus/Aboutus";
import FAQ from "./pages/faq/faq";
import BlogSection from "./pages/Blog/Blog";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ImageUpload from "./pages/ImageUpload";
import HistoryPage from "./pages/HistoryPage";
import Dashboard from "./pages/dashboard/Dashboard";
import FeedbackForm from "./FeedbackForm";
import FeedbackList from "./FeedbackList";
// Optional global Navbar component

// Scroll to the relevant section on route change
function ScrollToSection() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      const section = location.hash ? document.querySelector(location.hash) : null;
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return null;
}

function Homepage() {
  return (
    <div>
      <div id="home" className="Home">
        <Home />
      </div>
      <div id="aboutus" className="Aboutus">
        <AboutUs />
      </div>
      <div id="faq" className="faq">
        <FAQ />
      </div>
      <div id="blog" className="blog">
        <BlogSection />
      </div>
      <div id="feedbacks" className="feedbacks">
        <FeedbackList />
      </div>

    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToSection />
     
      <Routes>
        {/* Homepage with sections */}
        <Route path="/" element={<Homepage />} />

        {/* Other standalone pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/ImageUpload" element={<ImageUpload />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/dashboard" element={<Dashboard />} /> 
        <Route path="/feedback" element={<FeedbackForm />} />
      </Routes>
    </Router>
  );
}

export default App;

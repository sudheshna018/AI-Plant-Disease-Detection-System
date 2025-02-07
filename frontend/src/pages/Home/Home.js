import React from 'react';
import style from './Home.css';


const Home = () => {
  return (
    <>
      {/* Meta Information */}
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Plant Detection Project</title>

      {/* Navbar */}
      <nav className="navbar">
        <div className="max-width">
          <div className="logo">
            <a href="#">
              Jupit<span>er.</span>
            </a>
          </div>
          <ul className="menu">
            <li>
              <a href="#home" className="menu-btn">Home</a>
            </li>
            <li>
              <a href="#about" className="menu-btn">About</a>
            </li>
            <li>
              <a href="#blog" className="menu-btn">Blog</a>
            </li>
            <li>
              <a href="#faq" className="menu-btn">FAQ</a>
            </li>
            <li>
              <a href="#feedbacks" className="menu-btn">Feedbacks</a>
            </li>
            <li>
              <a href="/login" className="menu-btn">Login</a>
            </li>
            <li>
              <a href="/signup" className="menu-btn">Sign up</a>
            </li>

          </ul>
        </div>
      </nav>

      {/* Home Section */}
      <section className="home" id="home">
        <div className="max-width">
          <div className="home-content">
            <div className="text-1">Welcome to</div>
            <div className="text-2">AI Plant Disease</div>
            <div className="text-3">Detection</div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

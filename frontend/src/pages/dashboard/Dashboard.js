
import React from "react";
import { useNavigate } from "react-router-dom";
import "../../style4.css";

function Dashboard() {
  const navigate = useNavigate(); // React Router hook for navigation

  // Logout Handler
  const handleLogout = () => {
    // Clear token from localStorage or sessionStorage
    localStorage.removeItem("token");

    // Redirect to the login page
    navigate("/");
  };

  return (
    <>
      <aside className="sidebar">
        <div className="logo">
          <h2>Jupiter</h2>
        </div>
        <nav>
          <ul>
            <li><a href="#" className="left">Dashboard</a></li>
            <li><a href="/ImageUpload" className="left">Diagnosis</a></li>
            <li><a href="/history" className="left">History</a></li>
            {/* <li><a href="#" className="left">Settings</a></li>
            <li><a href="#" className="left">Help</a></li> */}
            <li><a href="/feedback" className="left">Feedback</a></li>
            <li>
              {/* Logout Option */}
              <a
                href="#"
                id="logoutButton"
                className="left"
                onClick={(e) => {
                  e.preventDefault(); // Prevent default link behavior
                  handleLogout();
                }}
              >
                Logout
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      <div className="dashboard">
        <h2 className="welcome-font">HELLO!! WELCOME BACK</h2>
        <h4 className="h4-font">
          NOTE: Sometimes the diagnosis is not accurate. In that case, give us feedback.
        </h4>
        <section className="stats">
          <div className="activity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              fill="currentColor"
              className="bi bi-cloud-arrow-up-fill"
              viewBox="0 0 16 16"
            >
              <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2m2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0z" />
            </svg>
            <h1 className="upload-head">Upload Your Image</h1>
            <button className="upload-button" onClick={() => navigate("/ImageUpload")}>
              Upload{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                className="bi bi-arrow-right-circle-fill"
                viewBox="0 0 16 16"
              >
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
              </svg>
            </button>
          </div>

          <div className="progress">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="60"
              height="60"
              fill="currentColor"
              className="bi bi-clock-history"
              viewBox="0 0 16 16"
            >
              <path d="M8 1a7 7 0 1 0 4.95 11.95l.707.707A8.001 8.001 0 1 1 8 0z" />
              <path d="M7.5 3a.5.5 0 0 1 .5.5v5.21l3.248 1.856a.5.5 0 0 1-.496.868l-3.5-2A.5.5 0 0 1 7 9V3.5a.5.5 0 0 1 .5-.5" />
            </svg>
            <h1 className="upload-head">View Your History</h1>
            <button className="upload-button" onClick={() => navigate("/history")} style={{ paddingLeft: "30px" }}>
              View{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                className="bi bi-arrow-right-circle-fill"
                viewBox="0 0 16 16"
              >
                <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5z" />
              </svg>
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

export default Dashboard;

import React from "react";
import "./style4.css"

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <h2>Jupiter</h2>
      </div>
      <nav>
        <ul>
          <li><a href="#" className="left">Dashboard</a></li>
          <li><a href="#" className="left">Projects</a></li>
          <li><a href="#" className="left">Tasks</a></li>
          <li><a href="#" className="left">Settings</a></li>
          <li><a href="#" className="left">Help</a></li>
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;

import React from "react";
import "./AppPreview.css";
import appPreview from '../../assets/tasksparkDashboard.png'

const AppPreview = () => {
  return (
    <section className="app-preview">
      <div className="preview-content">
        <div className="preview-text">
          <h2>See Your Tasks in Action</h2>
          <p>Track progress, manage deadlines, and stay organized with our intuitive interface. Experience productivity like never before.</p>
        </div>
        <div className="preview-image">
          <img src={appPreview} alt="App Preview" />
        </div>        
      </div>
    </section>
  );
};

export default AppPreview;

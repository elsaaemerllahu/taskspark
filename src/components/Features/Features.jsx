import React from "react";
import "./Features.css";
import { FaTasks, FaClock, FaBell, FaChartBar } from "react-icons/fa";

const Features = () => {
  const features = [
    {
      icon: <FaTasks />,
      title: "Organize Tasks",
      description: "Create, edit, and prioritize your daily tasks easily.",
    },
    {
      icon: <FaClock />,
      title: "Time Tracking",
      description: "Track how much time you spend on each task.",
    },
    {
      icon: <FaBell />,
      title: "Reminders",
      description: "Set reminders to never miss a deadline.",
    },
    {
      icon: <FaChartBar />,
      title: "Productivity Insights",
      description: "View your productivity stats and progress charts.",
    },
  ];

  return (
    <section className="features-section">
      <h2 className="features-title">Why Choose Our Task Manager?</h2>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;

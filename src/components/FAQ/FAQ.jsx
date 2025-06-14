import React, { useState } from "react";
import "./FAQ.css";
import { FaClock, FaBell, FaUserShield, FaUsers, FaLock, FaMobile, FaCheckCircle } from "react-icons/fa";

const faqs = [
  {
    icon: <FaClock />,
    question: "How do I create a task?",
    answer: "Just click the 'Add Task' button, enter your task details, and save. It’s that easy!",
  },
  {
    icon: <FaBell />,
    question: "Can I set due dates and reminders?",
    answer: "Yes! Each task allows you to set a due date and an optional reminder notification.",
  },
  {
    icon: <FaUserShield />,
    question: "Is this service free?",
    answer: "We offer a free plan with core features. Premium plans are available with more options.",
  },
  {
    icon: <FaUsers />,
    question: "Can I collaborate with teammates?",
    answer: "Yes, our premium version includes team collaboration tools so you can assign and track tasks with others.",
  },
  {
    icon: <FaLock />,
    question: "How do I reset my password?",
    answer: "Click on 'Forgot Password' at the login page and follow the instructions to reset it.",
  },
  {
    icon: <FaMobile />,
    question: "Does this app support mobile devices?",
    answer: "Yes, the app is fully responsive and works smoothly on all devices.",
  },
  {
    icon: <FaCheckCircle />,
    question: "Can I track my task progress?",
    answer: "Definitely! You can mark tasks as complete, view progress bars, and generate reports.",
  },
];



const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? "open" : ""}`}
            onClick={() => toggleFAQ(index)}
          >
            <h3>
  <div className="faq-title">
    <span className="faq-icon">{faq.icon}</span>
    <span>{faq.question}</span>
  </div>
  <span className={`arrow ${openIndex === index ? "rotate" : ""}`}>
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 8L10 12L14 8" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </span>
</h3>

            <p>{openIndex === index && faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;

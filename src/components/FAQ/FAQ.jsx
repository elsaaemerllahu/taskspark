import React, { useState } from "react";
import "./FAQ.css";

const faqs = [
  {
    question: "How do I create a task?",
    answer: "Just click the 'Add Task' button, enter your task details, and save. It’s that easy!",
  },
  {
    question: "Can I set due dates and reminders?",
    answer: "Yes! Each task allows you to set a due date and an optional reminder notification.",
  },
  {
    question: "Is this service free?",
    answer: "We offer a free plan with core features. Premium plans are available with more options.",
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
            <h3>{faq.question}</h3>
            <p>{openIndex === index && faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;

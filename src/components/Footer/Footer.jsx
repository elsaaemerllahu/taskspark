import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} TaskSpark. Elsa Emerllahu</p>
    </footer>
  );
};

export default Footer;

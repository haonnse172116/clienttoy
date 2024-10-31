// src/components/Footer.js
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} EduToy+. All rights reserved.</p>
        <p>Contact us: support@EduToy2024.com</p>
      </div>
    </footer>
  );
};

export default Footer;

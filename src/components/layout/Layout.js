// src/components/Layout.js
import React from 'react';
import './Layout.css';
import Navbar from '../navbar/Navbar';
import Footer from '../footer/Footer';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="content">{children}</main>
      <Footer/>
    </div>
  );
};

export default Layout;

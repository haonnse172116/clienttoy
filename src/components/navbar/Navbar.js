// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useUser } from '../contextprovider/UserContext';

const Navbar = () => {
  const { user, logout } = useUser();
    const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/');
  }
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">EduToy Renting Service</Link>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/">All Toys</Link>
        </li>
        {user?.role === 'supplier' && (
          <li>
             <Link to="/toy-management">Toy Management</Link>
          </li>
        )}
         {user?.role === 'renter' && (
            <>
                 {/* <li><Link to="/my-requests">My Requests</Link></li> */}
                 <li><Link to="/cart">Cart</Link></li>
                 <li><Link to="/transaction">Transaction</Link></li>
            </>
       
        )}
         {user?.role === 'staff' && (
            <>
             {/* <li><Link to="/all-requests">All Requests</Link></li> */}
             <li><Link to="/order-management">Order Management</Link></li>
            </>
        
         )}
        {!user ? (
            <>
              <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/signup">Sign Up</Link>
          </li>
            </>
          
        ) : (
          <li>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

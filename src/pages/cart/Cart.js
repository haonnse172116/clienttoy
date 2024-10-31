// src/pages/Cart.js
import React, { useEffect, useState, useCallback } from "react";
import { useUser } from "../../components/contextprovider/UserContext";
import "./Cart.css";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
    const navigate = useNavigate();
  const calculateItemTotal = (item) => {
    if (item.type === "rent") {
      const { day, week, twoWeeks } = item.toy.price;
      const priceMap = { "day": day, "week": week, "twoWeeks": twoWeeks };
      return priceMap[item.rent_duration] * item.quantity;
    }
    return item.toy.fixedPrice * item.quantity;
  };

  const calculateTotalPrice = useCallback((items) => {
    const total = items.reduce((acc, item) => acc + calculateItemTotal(item), 0);
    setTotalPrice(total);
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch("http://localhost:5003/api/shopping-cart", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch cart items");
        const data = await response.json();
        if (data.items) {
          setCartItems(data.items);
          calculateTotalPrice(data.items);
        } else {
          setCartItems([]);
          setTotalPrice(0);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user, calculateTotalPrice]);

  const handleRemoveItem = async (itemId) => {
    console.log("Attempting to remove item with ID:", itemId); // Add this log
    try {
      const response = await fetch(`http://localhost:5003/api/shopping-cart/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData); // Add this log
        throw new Error("Failed to remove item from cart");
      }
  
      const updatedItems = cartItems.filter((item) => item._id !== itemId);
      setCartItems(updatedItems);
      calculateTotalPrice(updatedItems);
      alert("Item removed from cart");
    } catch (err) {
      console.error("Failed to remove item from cart:", err.message); // Add this log
      alert("Failed to remove item from cart. Please try again.");
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };
  if (loading) return <p>Loading cart items...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item._id} className="cart-item">
              <h3>{item.toy.name}</h3>
              <p>Type: {item.type === "rent" ? `Rent (${item.rent_duration})` : "Buy"}</p>
              <p>Quantity: {item.quantity}</p>
              <p>Price: ${calculateItemTotal(item).toFixed(2)}</p>
              <button onClick={() => handleRemoveItem(item._id)} className="remove-button">
                Remove
              </button>
            </div>
          ))}
          <div className="cart-total">
            <h3>Total Price: ${totalPrice.toFixed(2)}</h3>
            <button onClick={handleCheckout} className="checkout-button">Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

import React, { useState, useEffect } from "react";
import "./Checkout.css";
import { useUser } from "../../components/contextprovider/UserContext";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [transactionType, setTransactionType] = useState("rent");
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch("http://localhost:5003/api/shopping-cart", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        setCartItems(data.items || []);
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
      }
    };
    fetchCartItems();
  }, [user]);

  useEffect(() => {
    const calculateTotal = () => {
      const total = cartItems.reduce((sum, item) => {
        const price =
          item.type === "rent"
            ? item.toy.price[item.rent_duration]
            : item.toy.fixedPrice;
        return sum + price * item.quantity;
      }, 0);
      setTotalAmount(total);
    };
    calculateTotal();
  }, [cartItems]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5003/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          shippingAddress,
          transaction_type: transactionType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Checkout failed");
      }

      const data = await response.json();
      setMessage("Order placed successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error during checkout:", error.message);
      setMessage(error.message);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Checkout</h2>
      {message && <p className="checkout-message">{message}</p>}
      <form onSubmit={handleCheckout} className="checkout-form">
        <h3>Shipping Address</h3>
        <label>
          Street:
          <input
            type="text"
            name="street"
            value={shippingAddress.street}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          City:
          <input
            type="text"
            name="city"
            value={shippingAddress.city}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          State:
          <input
            type="text"
            name="state"
            value={shippingAddress.state}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Postal Code:
          <input
            type="text"
            name="postalCode"
            value={shippingAddress.postalCode}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Country:
          <input
            type="text"
            name="country"
            value={shippingAddress.country}
            onChange={handleInputChange}
            required
          />
        </label>

        <h3>Transaction Type</h3>
        <label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
          >
            <option value="rent">Rent</option>
            {/* Add more options if there are other transaction types */}
          </select>
        </label>

        <h3>Total Amount: ${totalAmount.toFixed(2)}</h3>

        <button type="submit" className="checkout-button">
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;

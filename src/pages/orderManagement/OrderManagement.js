// src/pages/OrderManagement.js
import React, { useEffect, useState } from "react";
import { useUser } from "../../components/contextprovider/UserContext";
import "./OrderManagement.css";

const OrderManagement = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:5003/api/checkout/all", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleApproveOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5003/api/checkout/${orderId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to approve order");
      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: "approved" } : order
        )
      );
      alert("Order approved successfully!");
    } catch (error) {
      console.error("Error approving order:", error.message);
      alert("Failed to approve order. Please try again.");
    }
  };
  const formatRentDuration = (duration) => {
    switch (duration) {
      case "day":
        return "1 day";
      case "week":
        return "1 week";
      case "twoWeeks":
        return "2 weeks";
      default:
        return duration;
    }
  };

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="order-management-container">
        
      <h2>Order Management</h2>
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>User</th>
            <th>Items</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.user?.username || "N/A"}</td>
              <td>
                {order.items.map((item, index) => (
                  <div key={index}>
                    {item.rent_duration ? (
                      <>
                        Rented {item.quantity} product: {item.toy?.name || "N/A"} for {formatRentDuration(item.rent_duration)}
                      </>
                    ) : (
                      <>
                        Bought {item.quantity} product: {item.toy?.name || "N/A"}
                      </>
                    )}
                  </div>
                ))}
              </td>
              <td>${order.totalAmount.toFixed(2)}</td>
              <td>{order.status}</td>
              <td>
                {order.status !== "approved" ? (
                  <button
                    onClick={() => handleApproveOrder(order._id)}
                    className="approve-button"
                  >
                    Approve
                  </button>
                ) : (
                  "Approved"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderManagement;

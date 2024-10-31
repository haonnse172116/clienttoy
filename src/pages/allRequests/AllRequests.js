// src/pages/AllRequests.js
import React, { useEffect, useState } from 'react';
import './AllRequests.css';
import { useUser } from '../../components/contextprovider/UserContext';

const AllRequests = () => {
  const [groupedRequests, setGroupedRequests] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useUser();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:5003/api/requests', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch requests');
        const requestsData = await response.json();

        const requestsWithDetails = await Promise.all(
          requestsData.map(async (request) => {
            try {
              const toyId = request.toy_id._id || request.toy_id;
              const userId = request.user_id._id || request.user_id;

              const toyResponse = await fetch(`http://localhost:5003/api/toys/${toyId}`, {
                headers: {
                  'Authorization': `Bearer ${user.token}`,
                },
              });
              const toyData = await toyResponse.json();

              const userResponse = await fetch(`http://localhost:5003/api/auth/${userId}`, {
                headers: {
                  'Authorization': `Bearer ${user.token}`,
                },
              });
              const userData = await userResponse.json();

              return {
                ...request,
                toy_name: toyData.name || 'Unknown Toy',
                username: userData.username || 'Unknown User',
              };
            } catch (error) {
              console.error("Failed to fetch toy or user data:", error);
              return {
                ...request,
                toy_name: 'Unknown Toy',
                username: 'Unknown User',
              };
            }
          })
        );

        const groupedByUser = requestsWithDetails.reduce((acc, request) => {
          const { username } = request;
          if (!acc[username]) acc[username] = [];
          acc[username].push(request);
          return acc;
        }, {});

        setGroupedRequests(groupedByUser);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const calculateTotalPrice = (requests) => {
    return requests.reduce((total, request) => total + request.price, 0);
  };

  const handleBatchUpdateStatus = async (username, newStatus) => {
    const userRequests = groupedRequests[username];
    const requestIds = userRequests.map((request) => request._id);

    try {
      await Promise.all(
        requestIds.map((requestId) =>
          fetch(`http://localhost:5003/api/requests/${requestId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify({ status: newStatus }),
          })
        )
      );

      setGroupedRequests((prevRequests) => {
        const updatedRequests = { ...prevRequests };
        updatedRequests[username] = updatedRequests[username].map((request) => ({
          ...request,
          status: newStatus,
        }));
        return updatedRequests;
      });

      alert(`All requests for ${username} have been ${newStatus}.`);
    } catch (err) {
      console.error(err.message);
      alert('Failed to update request status. Please try again.');
    }
  };

  if (loading) return <p>Loading requests...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="all-requests-container">
      <h2>All Requests by User</h2>
      {Object.keys(groupedRequests).map((username) => {
        const userRequests = groupedRequests[username];
        const totalPrice = calculateTotalPrice(userRequests);

        return (
          <div key={username} className="user-requests">
            <h3>User: {username}</h3>
            <p className="total-price"><strong>Total Price for User:</strong> ${totalPrice}</p>
            <div className="requests-list">
              {userRequests.map((request) => (
                <div key={request._id} className="request-card">
                  <p><strong>Item Name:</strong> {request.toy_name}</p>
                  <p><strong>Type:</strong> {request.type}</p>
                  {request.type === 'rent' && (
                    <p><strong>Rent Duration:</strong> {request.rent_duration || 'N/A'}</p>
                  )}
                  <p><strong>Price:</strong> ${request.price}</p>
                  <p><strong>Status:</strong> {request.status || 'Pending'}</p>
                </div>
              ))}
            </div>
            <div className="status-update-group">
              <button onClick={() => handleBatchUpdateStatus(username, 'approved')} className="approve-all-button">
                Approve All
              </button>
              <button onClick={() => handleBatchUpdateStatus(username, 'rejected')} className="reject-all-button">
                Reject All
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllRequests;

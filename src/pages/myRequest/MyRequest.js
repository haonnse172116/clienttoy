// src/pages/MyRequests.js
import React, { useEffect, useState } from 'react';
import './MyRequest.css';
import { useUser } from '../../components/contextprovider/UserContext';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
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

        // Lấy toy name cho từng request (nếu toy_id tồn tại)
        const requestsWithToyNames = await Promise.all(
          requestsData.map(async (request) => {
            if (request.toy_id && request.toy_id._id) {
              const toyResponse = await fetch(`http://localhost:5003/api/toys/${request.toy_id._id}`, {
                headers: {
                  'Authorization': `Bearer ${user.token}`,
                },
              });
              const toyData = await toyResponse.json();
              return {
                ...request,
                toy_name: toyData.name || 'Unknown Toy', // Thêm toy_name vào dữ liệu request
              };
            }
            return {
              ...request,
              toy_name: 'Unknown Toy', // Xử lý trường hợp không có toy_id
            };
          })
        );

        setRequests(requestsWithToyNames);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  if (loading) return <p>Loading requests...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="my-requests-container">
      <h2>My Requests</h2>
      <div className="requests-list">
        {requests.map((request) => (
          <div key={request._id} className="request-card">
            <p><strong>Item Name:</strong> {request.toy_name}</p>
            <p><strong>Type:</strong> {request.type}</p>
            {/* Chỉ hiển thị rent_duration nếu type là 'rent' */}
            {request.type === 'rent' && (
              <p><strong>Rent Duration:</strong> {request.rent_duration || 'N/A'}</p>
            )}
            <p><strong>Price:</strong> ${request.price}</p>
            <p><strong>Status:</strong> {request.status || 'Pending'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRequests;

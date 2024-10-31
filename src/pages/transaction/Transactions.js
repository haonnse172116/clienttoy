import React, { useEffect, useState } from "react";
import "./Transactions.css";
import { useUser } from "../../components/contextprovider/UserContext";

const Transactions = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const formatDuration = (duration) => {
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
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("http://localhost:5003/api/transactions", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch transactions");
        const data = await response.json();
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  if (loading) return <p>Loading transactions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="transactions-container">
      <h2>All Transactions</h2>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Item</th>
              <th>Type</th>
              <th>Cost</th>
              <th>Status</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
  {transactions.map((transaction) => (
    <tr key={transaction._id}>
      <td>{transaction._id}</td>
      <td>{transaction.toy_id?.name || "N/A"}</td>
      <td>{transaction.transaction_type}</td>
      <td>${transaction.amount.toFixed(2)}</td>
      <td>{transaction.status}</td>
      <td>{formatDuration(transaction.duration) || "N/A"}</td>
    </tr>
  ))}
</tbody>
        </table>
      )}
    </div>
  );
};

export default Transactions;

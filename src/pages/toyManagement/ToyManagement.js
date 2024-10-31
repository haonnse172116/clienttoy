import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ToyManagement.css";
import { useUser } from "../../components/contextprovider/UserContext";

const ToyManagement = () => {
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useUser();
  const [updatedFields, setUpdatedFields] = useState({});
  useEffect(() => {
    if (!user || (user.role !== "supplier" && user.role !== "staff")) {
      console.log("Only suppliers or staff can enter this page!");
      navigate("/login");
    }

    const fetchToys = async () => {
      try {
        const response = await fetch("http://localhost:5003/api/toys", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch toys");
        const data = await response.json();
        setToys(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchToys();
  }, [user, navigate]);

  const handleCreateToy = () => {
    navigate("/createToy");
  };

  const handleFieldChange = (toyId, field, value) => {
    if ((field === 'inventory_count' || field === 'price') && value < 0) {
      value = 0;
    }
    setUpdatedFields((prev) => ({
      ...prev,
      [toyId]: {
        ...prev[toyId],
        [field]: field === 'price'
          ? { ...prev[toyId]?.price, ...value }
          : value,
        is_rentable: prev[toyId]?.is_rentable ?? toys.find(toy => toy._id === toyId).is_rentable,
        is_saleable: prev[toyId]?.is_saleable ?? toys.find(toy => toy._id === toyId).is_saleable,
        fixedPrice: field === 'fixedPrice' ? value : prev[toyId]?.fixedPrice ?? toys.find(toy => toy._id === toyId).fixedPrice
      },
    }));
  };

  const handleSaleOrRentChange = (toyId, value) => {
    setUpdatedFields((prev) => ({
      ...prev,
      [toyId]: {
        ...prev[toyId],
        saleOrRent: value,
        is_rentable: true,
        is_saleable: value === 'both',
        fixedPrice: value === 'both' ? prev[toyId]?.fixedPrice ?? toys.find(toy => toy._id === toyId).fixedPrice : null,
      },
    }));
  };

  const handleUpdateSubmit = async (toyId) => {
    const toy = toys.find((t) => t._id === toyId);
    const updatedData = {
      ...updatedFields[toyId],
      is_rentable: updatedFields[toyId]?.saleOrRent ? updatedFields[toyId].saleOrRent !== 'saleable' : toy.is_rentable,
      is_saleable: updatedFields[toyId]?.saleOrRent ? updatedFields[toyId].saleOrRent === 'both' : toy.is_saleable,
      // Giữ nguyên giá trị fixedPrice nếu saleOrRent là both hoặc không thay đổi
      fixedPrice: updatedFields[toyId]?.saleOrRent === 'both' || toy.is_saleable
        ? updatedFields[toyId]?.fixedPrice ?? toy.fixedPrice
        : null,
    };
  
    try {
      const response = await fetch(`http://localhost:5003/api/toys/${toyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error('Failed to update toy');
      const updatedToy = await response.json();
  
      setToys((prevToys) =>
        prevToys.map((toy) => (toy._id === updatedToy._id ? updatedToy : toy))
      );
      setUpdatedFields((prev) => ({ ...prev, [toyId]: {} }));
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleDelete = async (toyId) => {
    if (!window.confirm("Are you sure you want to delete this toy?")) return;

    try {
      const response = await fetch(`http://localhost:5003/api/toys/${toyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.status === 204) {
        setToys(toys.filter((toy) => toy._id !== toyId));
      } else {
        throw new Error("Failed to delete toy");
      }
    } catch (err) {
      console.error(err.message);
      alert("Failed to delete toy. Please try again.");
    }
  };

  if (loading) return <p>Loading toys...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="toy-management-container">
  <h2>Toy Management</h2>
  <button onClick={handleCreateToy} className="create-toy-button1">
    Create New Toy
  </button>
  <table className="toy-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Category</th>
        <th>Description</th>
        <th>Inventory Count</th>
        <th>Type</th>
        <th>Rental Prices</th>
        <th>Fixed Price</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {toys.map((toy) => (
        <tr key={toy._id}>
          <td>
            <input
              type="text"
              value={updatedFields[toy._id]?.name || toy.name}
              onChange={(e) => handleFieldChange(toy._id, "name", e.target.value)}
              aria-label={`Name for ${toy.name}`}
            />
          </td>
          <td>
            <input
              type="text"
              value={updatedFields[toy._id]?.category || toy.category}
              onChange={(e) => handleFieldChange(toy._id, "category", e.target.value)}
              aria-label={`Category for ${toy.name}`}
            />
          </td>
          <td>
            <input
              type="text"
              value={updatedFields[toy._id]?.description || toy.description}
              onChange={(e) => handleFieldChange(toy._id, "description", e.target.value)}
              aria-label={`Description for ${toy.name}`}
            />
          </td>
          <td>
            <input
              type="number"
              value={updatedFields[toy._id]?.inventory_count || toy.inventory_count}
              onChange={(e) => handleFieldChange(toy._id, "inventory_count", parseInt(e.target.value))}
              className="inventory-input"
              aria-label={`Inventory count for ${toy.name}`}
            />
          </td>
          <td>
            <select
              value={updatedFields[toy._id]?.saleOrRent || (toy.is_saleable ? "both" : "rentable")}
              onChange={(e) => handleSaleOrRentChange(toy._id, e.target.value)}
              aria-label={`Sale or Rent type for ${toy.name}`}
            >
              <option value="rentable">Rentable</option>
              <option value="both">Both</option>
            </select>
          </td>
          <td>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Day"
                value={updatedFields[toy._id]?.price?.day || toy.price.day}
                onChange={(e) =>
                  handleFieldChange(toy._id, "price", {
                    day: parseFloat(e.target.value),
                    week: updatedFields[toy._id]?.price?.week || toy.price.week,
                    twoWeeks: updatedFields[toy._id]?.price?.twoWeeks || toy.price.twoWeeks,
                  })
                }
                aria-label={`Daily rental price for ${toy.name}`}
              />
              <input
                type="number"
                placeholder="Week"
                value={updatedFields[toy._id]?.price?.week || toy.price.week}
                onChange={(e) =>
                  handleFieldChange(toy._id, "price", {
                    day: updatedFields[toy._id]?.price?.day || toy.price.day,
                    week: parseFloat(e.target.value),
                    twoWeeks: updatedFields[toy._id]?.price?.twoWeeks || toy.price.twoWeeks,
                  })
                }
                aria-label={`Weekly rental price for ${toy.name}`}
              />
              <input
                type="number"
                placeholder="Two Weeks"
                value={updatedFields[toy._id]?.price?.twoWeeks || toy.price.twoWeeks}
                onChange={(e) =>
                  handleFieldChange(toy._id, "price", {
                    day: updatedFields[toy._id]?.price?.day || toy.price.day,
                    week: updatedFields[toy._id]?.price?.week || toy.price.week,
                    twoWeeks: parseFloat(e.target.value),
                  })
                }
                aria-label={`Two-week rental price for ${toy.name}`}
              />
            </div>
          </td>
          <td>
            {(updatedFields[toy._id]?.saleOrRent === "both" || toy.is_saleable) ? (
              <input
                type="number"
                value={updatedFields[toy._id]?.fixedPrice ?? toy.fixedPrice ?? ""}
                onChange={(e) => handleFieldChange(toy._id, "fixedPrice", parseFloat(e.target.value))}
                aria-label={`Fixed price for ${toy.name}`}
              />
            ) : (
              <span>N/A</span>
            )}
          </td>
          <td>
            <div className="action-buttons">
              <button onClick={() => handleUpdateSubmit(toy._id)} className="update-button">
                Update
              </button>
              <button onClick={() => handleDelete(toy._id)} className="delete-button">
                Delete
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
  );
};

export default ToyManagement;

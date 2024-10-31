import React, { useEffect, useState } from "react";
import "./ToyList.css";
import { useUser } from "../../components/contextprovider/UserContext";

const ToyList = () => {
  const [toys, setToys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestData, setRequestData] = useState({});
  const [quantityData, setQuantityData] = useState({});
  const { user } = useUser();

  useEffect(() => {
    const fetchToys = async () => {
      try {
        const response = await fetch("http://localhost:5003/api/toys");
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
  }, []);

  const handleOptionChange = (toyId, option) => {
    setRequestData((prev) => ({
      ...prev,
      [toyId]: { type: option, rent_duration: "" }, // Reset rent_duration on type change
    }));
  };

  const handleRentDurationChange = (toyId, duration) => {
    setRequestData((prev) => ({
      ...prev,
      [toyId]: { ...prev[toyId], rent_duration: duration },
    }));
  };

  const handleQuantityChange = (toyId, quantity) => {
    setQuantityData((prev) => ({
      ...prev,
      [toyId]: quantity,
    }));
  };

  const calculatePrice = (toy, type, duration) => {
    if (type === "rent") {
      if (duration === "day") return toy.price.day;
      if (duration === "week") return toy.price.week;
      if (duration === "twoWeeks") return toy.price.twoWeeks;
    } else if (type === "sale") {
      return toy.fixedPrice;
    }
    return 0;
  };

  const handleAddToCart = async (toyId) => {
    const type = requestData[toyId]?.type;
    const isRent = type === "rent";
    const rentDuration = isRent ? requestData[toyId]?.rent_duration : null;
    const quantity = quantityData[toyId] || 1;

    if (!type) {
      alert("Please select Rent or Buy.");
      return;
    }

    if (isRent && !rentDuration) {
      alert("Please select a duration for rent.");
      return;
    }

    const payload = {
      toyId,
      type,
      quantity,
      ...(isRent && { rent_duration: rentDuration }),
    };

    try {
      const response = await fetch("http://localhost:5003/api/shopping-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Failed to add item to cart");
      }

      alert("Item added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error.message);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  if (loading) return <p>Loading toys...</p>;
  if (error) return <p>{error}</p>;
  if (!loading && toys.length === 0) return <p>No toys available at the moment.</p>;

  return (
    <div className="toys-list-container">
      <h2>All Toys</h2>
      <div className="toys-list">
        {toys.map((toy) => (
          <div key={toy._id} className="toy-card">
            <img src={toy.imageUrl || "placeholder-image.jpg"} alt={toy.name} />
            <h3>{toy.name}</h3>
            <p>Category: {toy.category}</p>
            <p>{toy.description}</p>
            <p>Inventory Count: {toy.inventory_count}</p>
            {toy.price && (
              <div>
                <p>Price per day: ${toy.price.day}</p>
                <p>Price per week: ${toy.price.week}</p>
                <p>Price per two weeks: ${toy.price.twoWeeks}</p>
              </div>
            )}
            {toy.fixedPrice && <p>Fixed Price: ${toy.fixedPrice}</p>}
            {user?.role === "renter" && (
              <div className="request-form">
                <select
                  value={requestData[toy._id]?.type || ""}
                  onChange={(e) => handleOptionChange(toy._id, e.target.value)}
                >
                  <option disabled value="">
                    Please choose your selection
                  </option>
                  <option value="rent">Rent</option>
                  <option value="sale" disabled={!toy.is_saleable}>
                    Buy
                  </option>
                </select>

                {requestData[toy._id]?.type === "rent" && (
                  <>
                    <select
                      value={requestData[toy._id]?.rent_duration || ""}
                      onChange={(e) =>
                        handleRentDurationChange(toy._id, e.target.value)
                      }
                    >
                      <option disabled value="">
                        Select Duration
                      </option>
                      <option value="day">1 Day</option>
                      <option value="week">1 Week</option>
                      <option value="twoWeeks">2 Weeks</option>
                    </select>
                    <p>
                      Price: $
                      {calculatePrice(
                        toy,
                        "rent",
                        requestData[toy._id]?.rent_duration || ""
                      )}
                    </p>
                  </>
                )}

                {requestData[toy._id]?.type === "sale" && (
                  <div>
                    <label>Quantity:</label>
                    <input
                      type="number"
                      min="1"
                      value={quantityData[toy._id] || 1}
                      onChange={(e) =>
                        handleQuantityChange(toy._id, parseInt(e.target.value))
                      }
                    />
                    <p>
                      Total Price: $
                      {toy.fixedPrice * (quantityData[toy._id] || 1)}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => handleAddToCart(toy._id)}
                  className="request-button"
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToyList;

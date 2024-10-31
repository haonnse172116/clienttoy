import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateToy.css';
import { useUser } from '../../components/contextprovider/UserContext';

const CreateToy = () => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: { day: '', week: '', twoWeeks: '' },
    fixedPrice: '',
    availability: true,
    saleOrRent: 'rentable',
    inventory_count: '',
    imageUrl: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    // Prevent negative values for specific fields
    const numericFields = ["day", "week", "twoWeeks", "fixedPrice", "inventory_count"];
    if (numericFields.includes(name) && parseFloat(value) < 0) {
      setMessage("Negative values are not allowed.");
      return;
    }
  
    if (name === "saleOrRent") {
      setFormData({
        ...formData,
        saleOrRent: value,
        fixedPrice: value === "rentable" ? '' : formData.fixedPrice
      });
    } else if (name in formData.price) {
      setFormData({
        ...formData,
        price: { ...formData.price, [name]: parseFloat(value) }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role !== 'supplier') {
      setMessage("Access denied. Only suppliers can create toys.");
      return;
    }

 
    const payload = {
      ...formData,
      is_rentable: true,
      is_saleable: formData.saleOrRent === 'both'
    };

    if (formData.saleOrRent === 'rentable') {
      delete payload.fixedPrice;
    }

    try {
      const response = await fetch('http://localhost:5003/api/toys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok) {
        setMessage('Toy created successfully!');
        navigate('/toy-management');
      } else {
        setMessage(result.message || 'Toy creation failed.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'supplier') {
      console.log('Only supplier can enter this page!');
      navigate('/login'); 
    }
  }, [user, navigate]);

  return (
    <div className="create-toy-container">
      <form onSubmit={handleSubmit} className="create-toy-form">
        <h2>Create Toy</h2>
        {message && <p className="message">{message}</p>}
        
        <label>
          Name
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>
        <label>
          Category
          <input type="text" name="category" value={formData.category} onChange={handleChange} required />
        </label>
        <label>
          Description
          <textarea name="description" value={formData.description} onChange={handleChange} required />
        </label>
        
        <label>
          Type
          <select name="saleOrRent" value={formData.saleOrRent} onChange={handleChange} required>
            <option value="rentable">Rentable</option>
            <option value="both">Rent and Sale</option>
          </select>
        </label>

        {formData.saleOrRent !== 'both' && (
          <>
            <label>
              Price (per Day)
              <input type="number" name="day" value={formData.price.day} onChange={handleChange} required />
            </label>
            <label>
              Price (per Week)
              <input type="number" name="week" value={formData.price.week} onChange={handleChange} required />
            </label>
            <label>
              Price (per Two Weeks)
              <input type="number" name="twoWeeks" value={formData.price.twoWeeks} onChange={handleChange} required />
            </label>
          </>
        )}

        {formData.saleOrRent === 'both' && (
           <>
           <label>
             Price (per Day)
             <input type="number" name="day" value={formData.price.day} onChange={handleChange} required />
           </label>
           <label>
             Price (per Week)
             <input type="number" name="week" value={formData.price.week} onChange={handleChange} required />
           </label>
           <label>
             Price (per Two Weeks)
             <input type="number" name="twoWeeks" value={formData.price.twoWeeks} onChange={handleChange} required />
           </label>
           <label>
            Fixed Price
            <input type="number" name="fixedPrice" value={formData.fixedPrice} onChange={handleChange} required />
          </label>
         </>
          
        )}

        <label>
          Availability
          <input type="checkbox" name="availability" checked={formData.availability} onChange={() => setFormData({ ...formData, availability: !formData.availability })} />
        </label>
        
        <label>
          Inventory Count
          <input type="number" name="inventory_count" value={formData.inventory_count} onChange={handleChange} required />
        </label>
        
        <label>
          Image URL
          <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
        </label>
        
        <button type="submit" className="create-toy-button">Create Toy</button>
      </form>
    </div>
  );
};

export default CreateToy;

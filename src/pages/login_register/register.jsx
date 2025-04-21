import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Registration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    restaurantName: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await axios.post('/api/register', formData);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-card">
        <h1 className="registration-title">Create Account 🍔</h1>
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="input-group">
            <label htmlFor="role">Account Type</label>
            <select
              id="role"
              value={formData.role}
              onChange={e => setFormData({...formData, role: e.target.value})}
              className="role-select"
            >
              <option value="user">Food Lover</option>
              <option value="restaurant">Restaurant Owner</option>
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="name">{formData.role === 'user' ? 'Your Name' : 'Owner Name'}</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              required
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              required
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {formData.role === 'restaurant' && (
            <div className="restaurant-fields">
              <div className="input-group">
                <label htmlFor="restaurantName">Restaurant Name</label>
                <input
                  id="restaurantName"
                  type="text"
                  placeholder="Enter restaurant name"
                  required
                  value={formData.restaurantName}
                  onChange={e => setFormData({...formData, restaurantName: e.target.value})}
                />
              </div>
              <div className="input-group">
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  type="text"
                  placeholder="Enter restaurant address"
                  required
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              'Create Account'
            )}
          </button>

          <p className="login-text">
            Already have an account?{" "}
            <span 
              className="login-link"
              onClick={() => navigate('/login')}
            >
              Sign in here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registration;
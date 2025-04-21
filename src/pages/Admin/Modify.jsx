import React, { useState } from 'react';
import axios from 'axios';
//import './Modify.css';

const Modify = ({ grill, onUpdate, onClose }) => {
  const [formData, setFormData] = useState({
    name: grill.name,
    picture: grill.picture,
    desc: grill.desc
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.picture || !formData.desc) {
      setError('Minden mező kitöltése kötelező');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/grills/${grill._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onUpdate(res.data);
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Hiba a frissítés során');
    }
  };

  return (
    <div className="modify-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{grill.name} szerkesztése</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Név:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="input-group">
            <label>Kép URL:</label>
            <input
              type="url"
              name="picture"
              value={formData.picture}
              onChange={(e) => setFormData({...formData, picture: e.target.value})}
            />
          </div>
          
          <div className="input-group">
            <label>Leírás:</label>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={(e) => setFormData({...formData, desc: e.target.value})}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Mégse
            </button>
            <button type="submit" className="save-btn">
              Mentés
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modify;
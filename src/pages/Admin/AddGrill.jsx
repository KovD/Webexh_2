import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modify from './Modify';
import './Admin.css';

const AdminPanel = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    picture: '', 
    desc: '' 
  });
  const [grills, setGrills] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedGrill, setSelectedGrill] = useState(null);
  const [showModify, setShowModify] = useState(false);
  const navigate = useNavigate();

  const fetchGrills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/grills', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGrills(response.data);
    } catch (err) {
      setError('Nem sikerült betölteni a grilleket');
      setTimeout(() => setError(''), 3000);
    }
  };

  useEffect(() => { fetchGrills(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/grills', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Grill sikeresen hozzáadva!');
      setFormData({ name: '', picture: '', desc: '' });
      await fetchGrills();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a grill hozzáadásakor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (grillId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/grills/${grillId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setGrills(grills.filter(grill => grill._id !== grillId));
      setSuccess('Grill sikeresen törölve!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a grill törlésekor');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateGrill = (updatedGrill) => {
    setGrills(grills.map(grill => 
      grill._id === updatedGrill._id ? updatedGrill : grill
    ));
  };

  return (
    <div className="admin-panel">
      <h2 className="admin-heading">Admin Panel</h2>
      
      {error && <div className="alert-message error-message">{error}</div>}
      {success && <div className="alert-message success-message">{success}</div>}

      <div className="form-section">
        <h3 className="form-heading">Új Grill Hozzáadása</h3>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="input-group">
            <label className="input-label">Név:</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Kép URL:</label>
            <input
              type="text"
              className="form-input"
              value={formData.picture}
              onChange={(e) => setFormData({...formData, picture: e.target.value})}
              required
            />
          </div>
          
          <div className="input-group">
            <label className="input-label">Leírás:</label>
            <textarea
              className="form-input form-textarea"
              value={formData.desc}
              onChange={(e) => setFormData({...formData, desc: e.target.value})}
              required
            />
          </div>
          
          <button type="submit" className="submit-btn">
            Hozzáadás
          </button>
        </form>
      </div>

      <div className="grill-list">
        <h3 className="form-heading">Meglévő Grillek</h3>
        <div className="grill-grid">
          {grills.map(grill => (
            <div key={grill._id} className="grill-card">
              <h4 className="grill-name">{grill.name}</h4>
              <img 
                src={grill.picture} 
                alt={grill.name}
                id="grill-image"
              />
              <p className="grill-desc">{grill.desc}</p>
              <div className="card-actions">
                <button
                  onClick={() => {
                    setSelectedGrill(grill);
                    setShowModify(true);
                  }}
                  className="edit-btn"
                >
                  Szerkesztés
                </button>
                <button 
                  onClick={() => handleDelete(grill._id)}
                  className="delete-btn"
                >
                  Törlés
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModify && (
        <Modify
          grill={selectedGrill}
          onUpdate={handleUpdateGrill}
          onClose={() => setShowModify(false)}
        />
      )}
    </div>
  );
};

export default AdminPanel;
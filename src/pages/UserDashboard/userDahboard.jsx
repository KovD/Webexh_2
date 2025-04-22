import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserDashboard.css';

const UserDashboard = () => {
  const [grills, setGrills] = useState([]);
  const [currentGrillIndex, setCurrentGrillIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState(null);
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    const fetchGrills = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/grills', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGrills(res.data);
      } catch (error) {
        console.error('Error fetching grills:', error);
      }
    };
    fetchGrills();
  }, []);

  const handleLike = async (grillId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`/api/grills/${grillId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setGrills(grills.map(grill => 
        grill._id === grillId 
          ? { ...grill, likes: res.data.likes, isLiked: res.data.isLiked }
          : grill
      ));

      setAnimationDirection('right');
      setIsEntering(false);
      
      setTimeout(() => {
        setGrills(prevGrills => prevGrills.filter(grill => grill._id !== grillId));
        setCurrentGrillIndex(0);
        setAnimationDirection(null);
        setIsEntering(true);
      }, 300);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
    
  };

  const handleSkip = () => {
    setAnimationDirection('left');
    setIsEntering(false);
    
    setTimeout(() => {
      setCurrentGrillIndex(prev => (prev + 1) % grills.length);
      setAnimationDirection(null);
      setIsEntering(true);
    }, 300);
  };

  if (grills.length === 0) {
    return <div className="no-grills">No grills available 🔥</div>;
  }

  const currentGrill = grills[currentGrillIndex];

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Find Your Perfect Grill</h1>
      <div className="grill-container">
        <div 
          className={`grill-item
            ${animationDirection ? `slide-out-${animationDirection}` : ''}
            ${isEntering ? 'enter-top' : ''}
          `}
          key={currentGrillIndex}
        >
          <div className="grill-image-wrapper">
            <img src={currentGrill.picture} alt={currentGrill.name} className="grill-image" />
          </div>
          <div className="grill-content">
            <h3 className="grill-name">{currentGrill.name}</h3>
            <p className="grill-description">{currentGrill.desc}</p>
            <div className="actions">
              <button className="skip-button" onClick={handleSkip}>
                <span className="icon">❌</span> Skip
              </button>
              <button 
                className={`like-button ${currentGrill.isLiked ? 'liked' : ''}`}
                onClick={() => handleLike(currentGrill._id)}
              >
                <span className="icon">♥</span> {currentGrill.likes}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
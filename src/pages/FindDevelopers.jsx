import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FindDevelopers.css';
import DeveloperCard from '../components/DeveloperCard';
import RateDeveloperModal from '../components/RateDeveloperModal';
import ApiService from '../services/ApiService';

export default function FindDevelopers() {
  const [developers, setDevelopers] = useState([]);
  const [filteredDevelopers, setFilteredDevelopers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('devconnect_user') || '{}');

  useEffect(() => {
    loadDevelopers();
  }, []);

  useEffect(() => {
    // Filter developers based on search query
    if (searchQuery.trim() === '') {
      setFilteredDevelopers(developers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = developers.filter(dev => 
        dev.username?.toLowerCase().includes(query) ||
        dev.email?.toLowerCase().includes(query) ||
        dev.bio?.toLowerCase().includes(query)
      );
      setFilteredDevelopers(filtered);
    }
  }, [searchQuery, developers]);

  const loadDevelopers = async () => {
    try {
      setLoading(true);
      const allDevelopers = await ApiService.getAllDevelopers();
      setDevelopers(allDevelopers || []);
      setFilteredDevelopers(allDevelopers || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching developers:', err);
      setError('Failed to load developers. Please try again.');
      setDevelopers([]);
      setFilteredDevelopers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMessage = (developerId) => {
    navigate(`/messages?userId=${developerId}`);
  };

  const handleRate = (developer) => {
    setSelectedDeveloper(developer);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (ratingData) => {
    try {
      await ApiService.rateDeveloper({
        ...ratingData,
        clientId: currentUser.id || currentUser.userId
      });
      
      // Reload developers to get updated ratings
      await loadDevelopers();
      
      alert('Rating submitted successfully!');
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  };

  return (
    <div className="find-dev-page">
      <div className="find-dev-header">
        <h1>Find Developers</h1>
        <p className="subtitle">Discover skilled developers for your projects</p>

        <div className="search-row">
          <input 
            className="search-input" 
            placeholder="Search by name, email, or skills..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="developers-content">
        {loading ? (
          <div className="loading-message">Loading developers...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadDevelopers} className="retry-btn">Retry</button>
          </div>
        ) : filteredDevelopers.length === 0 ? (
          <div className="empty-message">
            {searchQuery ? `No developers found matching "${searchQuery}"` : 'No developers available yet'}
          </div>
        ) : (
          <div className="developers-grid">
            {filteredDevelopers.map(dev => (
              <DeveloperCard 
                key={dev.id} 
                developer={dev} 
                onMessage={() => handleMessage(dev.userId || dev.id)}
                onRate={() => handleRate(dev)}
              />
            ))}
          </div>
        )}
      </div>

      {showRatingModal && selectedDeveloper && (
        <RateDeveloperModal
          isOpen={showRatingModal}
          onClose={() => {
            setShowRatingModal(false);
            setSelectedDeveloper(null);
          }}
          developer={selectedDeveloper}
          onSubmitRating={handleSubmitRating}
        />
      )}
    </div>
  );
}

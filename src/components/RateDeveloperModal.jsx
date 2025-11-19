import React, { useState } from 'react';
import '../styles/RateDeveloperModal.css';

export default function RateDeveloperModal({ isOpen, onClose, developer, onSubmitRating }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitRating({
        developerId: developer.id,
        rating,
        comment: comment.trim()
      });
      
      // Reset form
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      console.error('Failed to submit rating:', error);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleStarHover = (value) => {
    setHoveredRating(value);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rate-developer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Rate Developer</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="developer-info-section">
            <div className="dev-avatar-small">
              {developer.username?.substring(0, 2).toUpperCase() || 'D'}
            </div>
            <div>
              <h3>{developer.username || 'Developer'}</h3>
              <p>{developer.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rating-section">
              <label>Your Rating *</label>
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= displayRating ? 'filled' : ''}`}
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => handleStarHover(star)}
                    onMouseLeave={handleStarLeave}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="rating-text">
                {rating === 0 && 'Select a rating'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </div>
            </div>

            <div className="comment-section">
              <label htmlFor="comment">Comment (Optional)</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience working with this developer..."
                rows={4}
                maxLength={500}
              />
              <div className="char-count">{comment.length}/500</div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-submit" 
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

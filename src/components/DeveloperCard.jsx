import React from 'react';
import '../styles/FindDevelopers.css';

export default function DeveloperCard({ developer, onMessage, onRate }) {
  const getInitials = (name) => {
    if (!name) return 'D';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.substring(0, 2);
  };

  const displayName = developer.username || developer.name || 'Developer';
  const initials = getInitials(displayName).toUpperCase();
  const completedProjects = developer.completedProjects || 0;
  const averageRating = developer.averageRating || 0;

  return (
    <div className="developer-card-modern">
      <div className="dev-card-header-new">
        <div className="dev-avatar-large">
          {initials}
        </div>
        <div className="dev-info-new">
          <h3 className="dev-name-new">{displayName}</h3>
          <p className="dev-email-new">{developer.email}</p>
        </div>
      </div>

      {developer.bio && (
        <div className="dev-bio">
          <p>{developer.bio}</p>
        </div>
      )}

      <div className="dev-stats">
        <div className="stat-item">
          <span className="stat-icon">✅</span>
          <span className="stat-label">Completed</span>
          <span className="stat-value">{completedProjects}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⭐</span>
          <span className="stat-label">Rating</span>
          <span className="stat-value">{averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}</span>
        </div>
      </div>

      <div className="dev-card-footer-new">
        <button className="btn-message-developer" onClick={onMessage}>
          💬 Message
        </button>
        <button className="btn-rate-developer" onClick={onRate}>
          ⭐ Rate
        </button>
      </div>
    </div>
  );
}

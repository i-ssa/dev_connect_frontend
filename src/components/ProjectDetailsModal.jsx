import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatBudget, formatTimeline } from '../utils/projectMapper';
import '../styles/ProjectDetails.css';

export default function ProjectDetailsModal({ project, onClose }) {
  const navigate = useNavigate();
  if (!project) return null;

  const openChat = () => {
    // Determine the other user ID based on current user role
    const userStr = localStorage.getItem('devconnect_user');
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      const otherUserId = currentUser.role === 'client' ? project.devId : project.clientId;
      
      if (otherUserId) {
        navigate(`/messages?userId=${otherUserId}&projectId=${project.id}`);
        onClose && onClose();
      } else {
        alert('No developer assigned to this project yet.');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="project-details-header">
          <h2>{project.title || project.name || `Project ${project.id}`}</h2>
          <span className={`status-badge status-${project.status}`}>
            {(project.status || 'available').replace('-', ' ').toUpperCase()}
          </span>
        </div>

        <div className="project-details-body">
          <div>
            <section className="project-section">
              <h3>Description</h3>
              <p>{project.description || 'No description available yet.'}</p>
            </section>

            <section className="project-section">
              <h3>Project Details</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Budget:</span>
                  <span className="detail-value">{formatBudget(project.budget)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Timeline:</span>
                  <span className="detail-value">{formatTimeline(project.timeline)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className="detail-value">{project.status}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{formatTimeline(project.createdAt)}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="project-side-card">
            <div className="project-section">
              <button className="btn primary" onClick={openChat}>Open Chat</button>
              <button className="btn" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

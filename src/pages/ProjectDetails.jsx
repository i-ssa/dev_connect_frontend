import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import { mapBackendProjectToFrontend, formatBudget, formatTimeline } from '../utils/projectMapper';
import '../styles/ProjectDetails.css';
import MpesaPayment from '../components/MpesaPayment';

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError(null);

      const backendProject = await ApiService.getProject(projectId);
      const mappedProject = mapBackendProjectToFrontend(backendProject);
      setProject(mappedProject);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err.message || 'Failed to load project details');
      setLoading(false);
    }
  };

  const openChat = () => {
    if (!project) return;
    
    // Navigate to messages with appropriate user ID
    // If current user is client, chat with developer; if developer, chat with client
    const userStr = localStorage.getItem('devconnect_user');
    if (userStr) {
      const currentUser = JSON.parse(userStr);
      const otherUserId = currentUser.role === 'client' ? project.devId : project.clientId;
      
      if (otherUserId) {
        navigate(`/messages?userId=${otherUserId}&projectId=${project.id}`);
      } else {
        alert('No developer assigned to this project yet.');
      }
    }
  };

  if (loading) {
    return (
      <div className="project-details-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-details-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error loading project</h3>
          <p>{error}</p>
          <button onClick={loadProject} className="retry-btn">Retry</button>
          <button onClick={() => navigate(-1)} className="back-btn">Go Back</button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details-page">
        <div className="empty-state">
          <h3>Project not found</h3>
          <button onClick={() => navigate(-1)} className="back-btn">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-details-page">
      <div className="project-details-header">
        <h2>{project.title}</h2>
        <div className="project-meta-info">
          <span className={`status-badge status-${project.status}`}>
            {project.status.replace('-', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="project-details-body">
        <section className="project-section">
          <h3>Description</h3>
          <p>{project.description || 'No description provided.'}</p>
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
            {project.devId && (
              <div className="detail-item">
                <span className="detail-label">Developer ID:</span>
                <span className="detail-value">{project.devId}</span>
              </div>
            )}
            <div className="detail-item">
              <span className="detail-label">Client ID:</span>
              <span className="detail-value">{project.clientId}</span>
            </div>
          </div>
        </section>

        <section className="project-section">
          <h3>Payment</h3>
          <p>Use M-Pesa STK Push to pay for this project.</p>
          <MpesaPayment 
            accountReference={`PRJ-${project.id}`} 
            transactionDesc={`Payment for ${project.title}`} 
          />
        </section>

        <div className="project-actions">
          <button className="btn primary" onClick={openChat}>
            Open Chat
          </button>
          <button className="btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

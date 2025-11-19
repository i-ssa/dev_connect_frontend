import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';
import { mapBackendProjectToFrontend, formatBudget, formatTimeline } from '../utils/projectMapper';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import '../styles/Marketplace.css';

export default function Marketplace() {
  const [availableProjects, setAvailableProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingProjectId, setClaimingProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);

  // Get current user from localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('devconnect_user') || '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    loadAvailableProjects();
  }, []);

  const loadAvailableProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('devconnect_token');
      if (!token) {
        setError('Please log in to view available projects.');
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching PENDING projects from backend...');
      const backendProjects = await ApiService.getProjectsByStatus('PENDING');
      console.log('Received projects:', backendProjects);
      const mapped = (backendProjects || []).map(mapBackendProjectToFrontend);
      setAvailableProjects(mapped);
    } catch (err) {
      console.error('Failed to load available projects:', err);
      if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
        setError('Authentication required. Please log in again.');
      } else {
        setError('Unable to connect to server. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimProject = async (projectId) => {
    if (!currentUser?.developerId) {
      alert('You must be signed in as a developer to claim a project. Please log out and log in again.');
      return;
    }

    const devId = currentUser.developerId;
    setClaimingProjectId(projectId);

    try {
      console.log(`Claiming project ${projectId} for developer ${devId}...`);
      const claimedProject = await ApiService.claimProject(projectId, devId);
      console.log('Project claimed successfully:', claimedProject);
      
      alert('✅ Project claimed successfully! Redirecting to your dashboard...');
      
      // Redirect to developer dashboard to see the claimed project
      window.location.href = '/dashboard-developer';
    } catch (err) {
      console.error('Failed to claim project:', err);
      
      if (err.message.includes('already claimed')) {
        alert('❌ This project has already been claimed by another developer.');
      } else {
        alert(`❌ Failed to claim project: ${err.message}`);
      }
      
      // Refresh list in case project was claimed by someone else
      await loadAvailableProjects();
    } finally {
      setClaimingProjectId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="marketplace-page">
        <div className="marketplace-header">
          <h1>Project Marketplace</h1>
          <p>Loading available projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketplace-page">
        <div className="marketplace-header">
          <h1>Project Marketplace</h1>
          <p className="error-message">{error}</p>
          <button onClick={loadAvailableProjects} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-page">
      <div className="marketplace-header">
        <h1>Project Marketplace</h1>
        <p className="marketplace-subtitle">
          Browse and claim available projects from clients
        </p>
        <button onClick={loadAvailableProjects} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {availableProjects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No Available Projects</h2>
          <p>There are no projects available to claim right now. Check back later!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {availableProjects.map((project) => (
            <div key={project.id} className="marketplace-project-card">
              <div className="project-card-header">
                <h3>{project.title}</h3>
                <span className="project-status-badge available">Available</span>
              </div>
              
              <p className="project-description">
                {project.description || 'No description provided'}
              </p>
              
              <div className="project-details">
                <div className="detail-item">
                  <span className="detail-label">💰 Budget:</span>
                  <span className="detail-value">{formatBudget(project.budget)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">📅 Timeline:</span>
                  <span className="detail-value">{formatTimeline(project.timeline)}</span>
                </div>
              </div>

              <div className="project-card-actions">
                <button
                  className="view-details-btn"
                  onClick={() => setSelectedProject(project)}
                >
                  View Details
                </button>
                <button
                  className="claim-btn"
                  onClick={() => handleClaimProject(project.id)}
                  disabled={claimingProjectId === project.id}
                >
                  {claimingProjectId === project.id ? '⏳ Claiming...' : '✓ Claim Project'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}

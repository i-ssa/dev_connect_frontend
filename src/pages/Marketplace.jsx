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
      console.log('Fetching PENDING projects from backend...');
      const backendProjects = await ApiService.getProjectsByStatus('PENDING');
      console.log('Received projects:', backendProjects);
      const mapped = (backendProjects || []).map(mapBackendProjectToFrontend);
      setAvailableProjects(mapped);
    } catch (err) {
      console.error('Failed to load available projects:', err);
      setError('Failed to load available projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimProject = async (projectId) => {
    if (!currentUser?.id && !currentUser?.userId) {
      alert('You must be signed in as a developer to claim a project');
      return;
    }

    const devId = currentUser.id || currentUser.userId;
    setClaimingProjectId(projectId);

    try {
      console.log(`Claiming project ${projectId} for developer ${devId}...`);
      const claimedProject = await ApiService.claimProject(projectId, devId);
      console.log('Project claimed successfully:', claimedProject);
      
      alert('✅ Project claimed successfully! Check your dashboard.');
      
      // Refresh the available projects list
      await loadAvailableProjects();
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

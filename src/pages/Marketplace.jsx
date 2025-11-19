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
  const [confirmProject, setConfirmProject] = useState(null);
  const [confirmError, setConfirmError] = useState('');

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
      const backendProjects = await ApiService.getUnclaimedProjects();
      const mapped = (backendProjects || [])
        .map(mapBackendProjectToFrontend)
        .filter((project) => project && !project.isClaimed);
      setAvailableProjects(mapped);
    } catch (err) {
      console.error('Failed to load available projects:', err);
      setError('Failed to load available projects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestClaimProject = (project) => {
    const role = (currentUser?.userRole || currentUser?.role || '').toLowerCase();
    if (!currentUser?.id && !currentUser?.userId) {
      alert('You must be signed in as a developer to claim a project');
      return;
    }

    if (role !== 'developer') {
      alert('Only developer accounts can claim projects. Please switch accounts.');
      return;
    }

    setConfirmProject(project);
    setConfirmError('');
  };

  const handleConfirmClaim = async () => {
    if (!confirmProject) {
      return;
    }

    const projectId = confirmProject.id;
    const devId = currentUser.id || currentUser.userId;
    setClaimingProjectId(projectId);
    setConfirmError('');

    try {
      await ApiService.claimProject(projectId, devId);
      alert('✅ Project claimed successfully! Check your dashboard.');
      setAvailableProjects((prev) => prev.filter((project) => project.id !== projectId));
      setConfirmProject(null);
    } catch (err) {
      console.error('Failed to claim project:', err);
      setConfirmError(err.message || 'Failed to claim project. Please try again.');
      await loadAvailableProjects();
    } finally {
      setClaimingProjectId(null);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmProject(null);
    setConfirmError('');
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
        <h1>Find Projects</h1>
        <p className="marketplace-subtitle">
          Browse and claim client projects that are still unclaimed
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
                  onClick={() => requestClaimProject(project)}
                  disabled={claimingProjectId === project.id}
                >
                  {claimingProjectId === project.id ? '⏳ Claiming...' : '✓ Claim Project'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmProject && (
        <div className="claim-confirm-overlay" onClick={handleCancelConfirm}>
          <div className="claim-confirm-modal" onClick={(event) => event.stopPropagation()}>
            <h2>Claim “{confirmProject.title}”?</h2>
            <p>
              You are about to claim this project. Once confirmed, it will move to your dashboard and
              disappear from the unclaimed list.
            </p>
            {confirmError && <p className="confirm-error">{confirmError}</p>}
            <div className="confirm-actions">
              <button type="button" className="cancel-btn" onClick={handleCancelConfirm} disabled={!!claimingProjectId}>
                Cancel
              </button>
              <button
                type="button"
                className="confirm-btn"
                onClick={handleConfirmClaim}
                disabled={!!claimingProjectId}
              >
                {claimingProjectId ? 'Confirming…' : 'Yes, claim project'}
              </button>
            </div>
          </div>
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

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/ApiService';
import '../styles/ClientReports.css';

export default function ClientReports() {
  const [projects, setProjects] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('devconnect_user') || '{}');
  const userId = currentUser.id || currentUser.userId;

  useEffect(() => {
    loadClientReports();
  }, [userId]);

  const loadClientReports = async () => {
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const clientProjects = await ApiService.getProjectsByClient(userId);
      setProjects(clientProjects || []);

      // Group projects by developer
      const devMap = {};
      clientProjects.forEach(project => {
        if (project.developerId) {
          if (!devMap[project.developerId]) {
            devMap[project.developerId] = {
              developerId: project.developerId,
              developerName: project.developerName || 'Unknown Developer',
              projects: [],
              totalSpent: 0,
              projectsCompleted: 0,
            };
          }
          devMap[project.developerId].projects.push(project);
          devMap[project.developerId].totalSpent += project.budget || 0;
          if (project.status?.toUpperCase() === 'COMPLETED') {
            devMap[project.developerId].projectsCompleted++;
          }
        }
      });

      setDevelopers(Object.values(devMap));
      setError(null);
    } catch (err) {
      console.error('Error loading client reports:', err);
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleContactDeveloper = (developerId) => {
    navigate(`/messages?userId=${developerId}`);
  };

  const totalSpent = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const completedProjects = projects.filter(p => p.status?.toUpperCase() === 'COMPLETED').length;
  const activeProjects = projects.filter(p => 
    p.status?.toUpperCase() === 'IN_PROGRESS' || 
    p.status?.toUpperCase() === 'ACTIVE'
  ).length;

  return (
    <div className="client-reports-page">
      <div className="reports-header">
        <h1>My Reports</h1>
        <p className="subtitle">Overview of your projects and developers</p>
      </div>

      {/* Summary Stats */}
      <div className="reports-summary">
        <div className="summary-card">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <div className="summary-label">Total Spent</div>
            <div className="summary-value">KSH {totalSpent.toLocaleString()}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">✅</div>
          <div className="summary-content">
            <div className="summary-label">Completed</div>
            <div className="summary-value">{completedProjects}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🔄</div>
          <div className="summary-content">
            <div className="summary-label">Active</div>
            <div className="summary-value">{activeProjects}</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">👥</div>
          <div className="summary-content">
            <div className="summary-label">Developers</div>
            <div className="summary-value">{developers.length}</div>
          </div>
        </div>
      </div>

      {/* Developers List */}
      <div className="developers-section">
        <h2>Developers You've Worked With</h2>
        {loading ? (
          <div className="loading-message">Loading reports...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : developers.length === 0 ? (
          <div className="empty-message">
            <p>No developers yet. Start by posting a project and hiring a developer!</p>
          </div>
        ) : (
          <div className="developers-grid">
            {developers.map((dev) => (
              <div key={dev.developerId} className="developer-report-card">
                <div className="dev-card-header">
                  <div className="dev-avatar">
                    {dev.developerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="dev-info">
                    <h3 className="dev-name">{dev.developerName}</h3>
                    <p className="dev-stats">
                      {dev.projects.length} project{dev.projects.length !== 1 ? 's' : ''} • 
                      {dev.projectsCompleted} completed
                    </p>
                  </div>
                </div>

                <div className="dev-card-body">
                  <div className="total-spent-section">
                    <span className="label">Total Spent:</span>
                    <span className="amount">KSH {dev.totalSpent.toLocaleString()}</span>
                  </div>

                  <div className="projects-worked-on">
                    <div className="projects-label">Projects:</div>
                    <div className="projects-list-small">
                      {dev.projects.map((project) => (
                        <div key={project.id} className="project-chip">
                          <span className="project-chip-title">{project.title}</span>
                          <span className="project-chip-budget">KSH {project.budget?.toLocaleString()}</span>
                          <span className={`project-chip-status status-${project.status?.toLowerCase()}`}>
                            {project.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="dev-card-footer">
                  <button 
                    className="btn-contact-developer"
                    onClick={() => handleContactDeveloper(dev.developerId)}
                  >
                    💬 Contact Again
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

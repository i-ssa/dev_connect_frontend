import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FindClients.css';

export default function ClientCard({ client }) {
  const navigate = useNavigate();
  const [showProjects, setShowProjects] = useState(false);

  const handleConnect = () => {
    navigate(`/messages?userId=${client.id}`);
  };

  return (
    <div className="client-card-modern">
      <div className="client-card-header">
        <div className="client-avatar-modern">
          {client.name?.charAt(0)?.toUpperCase() || 'C'}
        </div>
        <div className="client-info-modern">
          <h3 className="client-name-modern">{client.name}</h3>
          <p className="client-email">{client.email}</p>
        </div>
      </div>

      <div className="client-card-body">
        <div className="client-stat">
          <span className="stat-icon">📊</span>
          <span className="stat-text">{client.description}</span>
        </div>

        {client.projects && client.projects.length > 0 && (
          <div className="client-projects-section">
            <button 
              className="toggle-projects-btn"
              onClick={() => setShowProjects(!showProjects)}
            >
              {showProjects ? '▼' : '▶'} View Projects ({client.projects.length})
            </button>
            
            {showProjects && (
              <div className="projects-list-dropdown">
                {client.projects.map((project, index) => (
                  <div key={index} className="project-item-small">
                    <div className="project-dot" />
                    <div className="project-info-small">
                      <div className="project-title-small">{project.title || project.name || 'Untitled Project'}</div>
                      <div className="project-budget-small">Budget: KSH {(project.budget || 0).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="client-card-footer">
        <button className="btn-connect-client" onClick={handleConnect}>
          💬 Connect
        </button>
      </div>
    </div>
  );
}

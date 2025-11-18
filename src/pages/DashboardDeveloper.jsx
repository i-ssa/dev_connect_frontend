
import React, { useState, useEffect } from 'react';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import '../styles/Dashboard.css';
import ApiService from '../services/ApiService';
import { mapBackendProjectToFrontend } from '../utils/projectMapper';

const MoneyBarChart = ({ clientMoney, developerMoney }) => {
  const max = Math.max(clientMoney, developerMoney, 1);
  return (
    <div className="money-bar-chart">
      <div className="bar-label">Client Money</div>
      <div className="bar-wrapper">
        <div className="bar client" style={{ height: `${(clientMoney / max) * 100}%` }} />
        <span className="bar-value">KSH.{clientMoney.toLocaleString()}</span>
      </div>
      <div className="bar-label">Developer Money</div>
      <div className="bar-wrapper">
        <div className="bar developer" style={{ height: `${(developerMoney / max) * 100}%` }} />
        <span className="bar-value">KSH.{developerMoney.toLocaleString()}</span>
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value, icon, color, note }) => (
  <div className="dash-card">
    <div className="dash-card-icon" style={{ background: color }}>{icon}</div>
    <div className="dash-card-title">{title}</div>
    <div className="dash-card-value">{value}</div>
    {note && <div className="dash-card-note">{note}</div>}
  </div>
);

const QuickAction = ({ label, icon }) => (
  <div className="quick-action">
    <div className="quick-action-icon">{icon}</div>
    <div className="quick-action-label">{label}</div>
  </div>
);

export default function DashboardDeveloper() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load current user from localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('devconnect_user') || '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    // Fetch developer's assigned projects from backend
    const loadMyProjects = async () => {
      if (!currentUser?.id && !currentUser?.userId) {
        setIsLoading(false);
        return;
      }

      const devId = currentUser.id || currentUser.userId;
      setIsLoading(true);
      try {
        const backendProjects = await ApiService.getProjectsByDeveloper(devId);
        const mapped = (backendProjects || []).map(mapBackendProjectToFrontend);
        setMyProjects(mapped);
      } catch (e) {
        console.error('Failed to load developer projects', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadMyProjects();
  }, [currentUser?.id, currentUser?.userId]);

  // Example stats
  const summary = [
    {
      title: 'Active Projects',
      value: myProjects.filter(p => p.status === 'in-progress').length,
      icon: '🚀',
      color: '#e3f2fd',
      note: 'In Progress',
    },
    {
      title: 'Completed Projects',
      value: myProjects.filter(p => p.status === 'completed').length,
      icon: '✅',
      color: '#e8f5e9',
      note: 'All Time',
    },
    {
      title: 'Total Projects',
      value: myProjects.length,
      icon: '📊',
      color: '#fff3e0',
      note: 'Overall',
    },
    {
      title: 'Available Projects',
      value: '?',
      icon: '🔔',
      color: '#e1f5fe',
      note: 'Check Marketplace',
    },
  ];

  // Money stats for bar chart (placeholder)
  const clientMoney = 15800;
  const developerMoney = 27879;

  // Quick actions
  const actions = [
    { label: 'Browse Marketplace', icon: '🛒' },
    { label: 'My Projects', icon: '📁' },
    { label: 'Messages', icon: '💬' },
    { label: 'Analytics', icon: '📈' },
  ];

  return (
    <div className="dashboard-page redesigned">
      <div className="dash-header">
        <h1>Dashboard</h1>
        <div className="dash-date">{new Date().toLocaleDateString()}</div>
      </div>

      <div className="dash-performance-row">
        <div className="dash-performance-card">
          <div className="dash-performance-title">Performance Overview</div>
          {/* Placeholder for a line chart or area chart */}
          <div className="dash-performance-chart-placeholder">
            <span>Chart coming soon...</span>
          </div>
        </div>
        <div className="dash-money-card">
          <div className="dash-money-title">Money Overview</div>
          <MoneyBarChart clientMoney={clientMoney} developerMoney={developerMoney} />
        </div>
      </div>

      <div className="dash-summary-grid redesigned">
        {summary.map((card, i) => (
          <SummaryCard key={i} {...card} />
        ))}
      </div>

      <div className="quick-actions-section">
        <div className="quick-actions-title">Quick Actions</div>
        <div className="quick-actions-grid">
          {actions.map((action, i) => (
            <QuickAction key={i} {...action} />
          ))}
        </div>
      </div>

      <div className="projects-section">
        <div className="projects-title">My Projects</div>
        {isLoading ? (
          <div>Loading your projects...</div>
        ) : (
          <div className="projects-list">
            {myProjects.length === 0 && <div>No projects assigned yet. Check the Marketplace!</div>}
            {myProjects.map((proj) => {
              // Calculate a simple percentage based on status
              const percent = proj.status === 'completed' ? 100 : proj.status === 'in-progress' ? 50 : 0;
              return (
                <div key={proj.id} className="project-item project-link" onClick={() => setSelectedProject(proj)} role="button" tabIndex={0}>
                  <div className="project-name">{proj.title}</div>
                  <div className="project-owner">Budget: {proj.budget}</div>
                  <div className="project-progress-bar">
                    <div className="project-progress" style={{ width: `${percent}%` }} />
                    <span className="project-percent">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedProject && (
        <ProjectDetailsModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}

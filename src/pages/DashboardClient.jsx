
import React, { useState, useEffect } from 'react';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import { getProjectsByClient } from '../api/projectAPI';
import { mapBackendProjectToFrontend } from '../utils/projectMapper';
import '../styles/Dashboard.css';

// Simple bar chart for money stats
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

export default function DashboardClient() {
  // Load current user from localStorage with state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('devconnect_user') || '{}');
    } catch {
      return {};
    }
  });
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  // Listen for storage changes and refresh user data
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const updatedUser = JSON.parse(localStorage.getItem('devconnect_user') || '{}');
        setCurrentUser(updatedUser);
        console.log('Dashboard - User data refreshed:', updatedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    };

    // Listen for custom storage events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userDataUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataUpdated', handleStorageChange);
    };
  }, []);

  // Fetch authenticated client's projects
  useEffect(() => {
    const clientId = currentUser?.id || currentUser?.userId;
    if (!clientId) {
      return;
    }

    const loadProjects = async () => {
      setProjectsLoading(true);
      setProjectsError('');
      setProjectsLoaded(false);
      try {
        const backendProjects = await getProjectsByClient(clientId);
        const mappedProjects = (backendProjects || [])
          .map(mapBackendProjectToFrontend)
          .filter((project) => project && project.isClaimed);
        setProjects(mappedProjects);
        setProjectsLoaded(true);
      } catch (error) {
        console.error('Failed to load client projects:', error);
        setProjectsError(error.message || 'Failed to load projects');
        setProjectsLoaded(false);
      } finally {
        setProjectsLoading(false);
      }
    };

    loadProjects();
  }, [currentUser?.id, currentUser?.userId]);

  // Debug: Log current user data
  console.log('Dashboard - Current User:', currentUser);
  console.log('Dashboard - Project Count:', currentUser?.projectCount);
  console.log('Dashboard - Completed Count:', currentUser?.completedProjectCount);

  // Derive counts from loaded projects when available, otherwise fall back to user snapshot
  const derivedTotalProjects = projects.length;
  const derivedCompletedProjects = projects.filter((proj) => proj.status === 'completed').length;
  const derivedActiveProjects = projects.filter((proj) => proj.status !== 'completed').length;

  const totalProjects = projectsLoaded ? derivedTotalProjects : (currentUser?.projectCount || 0);
  const completedProjects = projectsLoaded ? derivedCompletedProjects : (currentUser?.completedProjectCount || 0);
  const activeProjects = projectsLoaded ? derivedActiveProjects : Math.max(0, totalProjects - completedProjects);

  const summary = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: '📊',
      color: '#e3f2fd',
      note: 'All projects',
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      icon: '🚀',
      color: '#fff3e0',
      note: 'In progress',
    },
    {
      title: 'Completed Projects',
      value: completedProjects,
      icon: '✅',
      color: '#e8f5e9',
      note: 'Finished',
    },
    {
      title: 'Account Status',
      value: currentUser?.active ? 'Active' : 'Inactive',
      icon: '👤',
      color: '#e1f5fe',
      note: currentUser?.userStatus || 'Unknown',
    },
  ];

  const getProjectProgressPercent = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completed':
        return 100;
      case 'in-progress':
        return 65;
      case 'available':
        return 35;
      default:
        return 50;
    }
  };

  // Money stats for bar chart
  const clientMoney = 27879;
  const developerMoney = 15800;

  // Only 4 important quick actions
  const actions = [
    { label: 'New AI Agent', icon: '➕' },
    { label: 'Integrations', icon: '🔗' },
    { label: 'Task Automation', icon: '⏱️' },
    { label: 'Analytics', icon: '�' },
  ];

  const [selectedProject, setSelectedProject] = useState(null);

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
        <div className="projects-title">
          Claimed Projects {projectsLoaded && <span className="projects-count">({projects.length})</span>}
        </div>
        <div className="projects-list">
          {projectsLoading ? (
            <div className="projects-empty">Loading projects...</div>
          ) : projectsError ? (
            <div className="projects-empty error">{projectsError}</div>
          ) : projects.length === 0 ? (
            <div className="projects-empty">None of your projects have been claimed yet.</div>
          ) : (
            projects.map((proj) => {
              const progressPercent = getProjectProgressPercent(proj.status);
              const statusLabel = (proj.status || 'unknown').replace('-', ' ');
              const numericBudget = Number(proj.budget);
              const hasBudget = Number.isFinite(numericBudget);
              return (
                <div
                  key={proj.id}
                  className="project-item project-link"
                  onClick={() => setSelectedProject(proj)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="project-name">{proj.title || proj.name || 'Untitled Project'}</div>
                  <div className="project-meta">
                    <span className={`status-chip status-${proj.status || 'unknown'}`}>
                      {statusLabel}
                    </span>
                    {hasBudget && (
                      <span className="project-budget">Budget: KSH.{numericBudget.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="project-progress-bar">
                    <div className="project-progress" style={{ width: `${progressPercent}%` }} />
                    <span className="project-percent">{progressPercent}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {selectedProject && (
        <ProjectDetailsModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}

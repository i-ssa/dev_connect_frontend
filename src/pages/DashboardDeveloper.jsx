
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const QuickAction = ({ label, icon, onClick }) => (
  <div className="quick-action" onClick={onClick} style={{ cursor: 'pointer' }}>
    <div className="quick-action-icon">{icon}</div>
    <div className="quick-action-label">{label}</div>
  </div>
);

export default function DashboardDeveloper() {
  const navigate = useNavigate();
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
      if (!currentUser?.developerId) {
        console.log('No developer ID found, skipping project load');
        setIsLoading(false);
        return;
      }

      const devId = currentUser.developerId;
      setIsLoading(true);
      try {
        console.log('Fetching projects for developer ID:', devId);
        const backendProjects = await ApiService.getProjectsByDeveloper(devId);
        console.log('Received developer projects:', backendProjects);
        const mapped = (backendProjects || []).map(mapBackendProjectToFrontend);
        console.log('Mapped projects:', mapped);
        setMyProjects(mapped);
      } catch (e) {
        console.error('Failed to load developer projects', e);
        // Set empty projects on error instead of breaking the page
        setMyProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMyProjects();
  }, [currentUser?.id, currentUser?.userId]);

  // Calculate real stats from projects
  const activeProjects = myProjects.filter(p => 
    p.status === 'in-progress' || p.status === 'active'
  ).length;

  const completedProjects = myProjects.filter(p => 
    p.status === 'completed' || p.status === 'done'
  ).length;

  // Calculate total earnings from completed projects
  const totalEarnings = myProjects
    .filter(p => p.status === 'completed' || p.status === 'done')
    .reduce((sum, p) => sum + (p.budget || 0), 0);

  // Calculate potential earnings from active projects
  const potentialEarnings = myProjects
    .filter(p => p.status === 'in-progress' || p.status === 'active')
    .reduce((sum, p) => sum + (p.budget || 0), 0);

  // Calculate progress percentage for each project based on milestones
  const calculateProgress = (project) => {
    if (!project.milestones || project.milestones.length === 0) {
      // Fallback to status-based percentage if no milestones
      if (project.status === 'completed' || project.status === 'done') return 100;
      if (project.status === 'in-progress' || project.status === 'active') return 50;
      return 0;
    }
    const completedMilestones = project.milestones.filter(m => 
      m.status?.toUpperCase() === 'COMPLETED' || m.completed
    ).length;
    return Math.round((completedMilestones / project.milestones.length) * 100);
  };

  // Example stats
  const summary = [
    {
      title: 'Active Projects',
      value: activeProjects,
      icon: '🚀',
      color: '#e3f2fd',
      note: isLoading ? 'Loading...' : `${activeProjects} in progress`,
    },
    {
      title: 'Completed Projects',
      value: completedProjects,
      icon: '✅',
      color: '#e8f5e9',
      note: isLoading ? 'Loading...' : `${completedProjects} delivered`,
    },
    {
      title: 'Total Earnings',
      value: `KSH ${totalEarnings.toLocaleString()}`,
      icon: '💰',
      color: '#fff3e0',
      note: isLoading ? 'Loading...' : 'From completed projects',
    },
    {
      title: 'Potential Earnings',
      value: `KSH ${potentialEarnings.toLocaleString()}`,
      icon: '🔔',
      color: '#e1f5fe',
      note: isLoading ? 'Loading...' : 'From active projects',
    },
  ];

  // Money stats for bar chart
  const clientMoney = potentialEarnings;
  const developerMoney = totalEarnings;

  // Quick actions
  const actions = [
    { label: 'Browse Marketplace', icon: '🛒', path: '/marketplace' },
    { label: 'My Projects', icon: '📁', path: '/myProjectsDeveloper' },
    { label: 'Messages', icon: '💬', path: '/messages' },
    { label: 'Analytics', icon: '📈', path: '/analytics' },
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
            <QuickAction key={i} {...action} onClick={() => navigate(action.path)} />
          ))}
        </div>
      </div>

      <div className="projects-section">
        <div className="projects-title">My Projects</div>
        {isLoading ? (
          <div className="loading-message">Loading your projects...</div>
        ) : myProjects.length === 0 ? (
          <div className="empty-message">No projects assigned yet. Check the Marketplace!</div>
        ) : (
          <div className="projects-list">
            {myProjects.map((proj) => {
              const progress = calculateProgress(proj);
              return (
                <div key={proj.id} className="project-item project-link" onClick={() => setSelectedProject(proj)} role="button" tabIndex={0}>
                  <div className="project-name">{proj.title}</div>
                  <div className="project-owner">Budget: KSH {(proj.budget || 0).toLocaleString()}</div>
                  <div className="project-progress-bar">
                    <div className="project-progress" style={{ width: `${progress}%` }} />
                    <span className="project-percent">{progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedProject && (
        <ProjectDetailsModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)}
          onProjectUpdated={() => {
            setSelectedProject(null);
            // Reload projects
            const loadProjects = async () => {
              if (currentUser?.developerId) {
                try {
                  const backendProjects = await ApiService.getProjectsByDeveloper(currentUser.developerId);
                  const mapped = (backendProjects || []).map(mapBackendProjectToFrontend);
                  setMyProjects(mapped);
                } catch (e) {
                  console.error('Failed to reload projects', e);
                }
              }
            };
            loadProjects();
          }}
        />
      )}
    </div>
  );
}

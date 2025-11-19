
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import ApiService from '../services/ApiService';
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

const QuickAction = ({ label, icon, onClick }) => (
  <div className="quick-action" onClick={onClick} style={{ cursor: 'pointer' }}>
    <div className="quick-action-icon">{icon}</div>
    <div className="quick-action-label">{label}</div>
  </div>
);

export default function DashboardClient() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const navigate = useNavigate();

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('devconnect_user') || '{}');
  const userId = currentUser.id || currentUser.userId;

  console.log('DashboardClient - Current User:', currentUser);
  console.log('DashboardClient - User ID:', userId);

  useEffect(() => {
    const fetchClientData = async () => {
      console.log('Fetching client data for userId:', userId);
      
      if (!userId) {
        console.warn('No userId found, skipping fetch');
        setError('User not logged in');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Calling ApiService.getProjectsByClient...');
        // Fetch client's projects from API
        const clientProjects = await ApiService.getProjectsByClient(userId);
        console.log('Fetched projects (raw from backend):', clientProjects);
        
        // Map backend DTOs to frontend shape
        const mappedProjects = (clientProjects || []).map(mapBackendProjectToFrontend);
        console.log('Mapped projects:', mappedProjects);
        
        setProjects(mappedProjects);
        setError(null);
      } catch (err) {
        console.error('Error fetching client data:', err);
        if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
          setError('Authentication required. Please log in again.');
        } else if (err.message?.includes('Failed to fetch')) {
          setError('Unable to connect to server. Please check your internet connection.');
        } else {
          setError('Failed to load projects. Please try again later.');
        }
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [userId]);

  // Calculate real stats from fetched projects
  console.log('DashboardClient - Projects for stats:', projects);
  console.log('DashboardClient - Projects count:', projects.length);
  
  const activeProjects = projects.filter(p => 
    p.status?.toUpperCase() === 'IN_PROGRESS' || 
    p.status?.toUpperCase() === 'ACTIVE' ||
    p.status?.toUpperCase() === 'PLANNING' ||
    p.status === 'in-progress' || 
    p.status === 'active'
  ).length;

  const completedProjects = projects.filter(p => 
    p.status?.toUpperCase() === 'COMPLETED' ||
    p.status?.toUpperCase() === 'DONE' ||
    p.status === 'completed'
  ).length;

  const totalSpent = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  // Count unique developers across all projects (using devId from mapper)
  const developersHired = new Set(
    projects
      .filter(p => p.devId || p.developerId)
      .map(p => p.devId || p.developerId)
  ).size;

  console.log('DashboardClient - Stats:', {
    activeProjects,
    completedProjects,
    totalSpent,
    developersHired,
    projects: projects.map(p => ({ 
      id: p.id, 
      title: p.title, 
      status: p.status, 
      budget: p.budget, 
      devId: p.devId,
      developerId: p.developerId 
    }))
  });

  // Client-focused stats
  const summary = [
    {
      title: 'Active Projects',
      value: activeProjects,
      icon: '📂',
      color: '#fff3e0',
      note: loading ? 'Loading...' : `${activeProjects} in progress`,
    },
    {
      title: 'Developers Hired',
      value: developersHired,
      icon: '👥',
      color: '#e8f5e9',
      note: loading ? 'Loading...' : `${developersHired} developers`,
    },
    {
      title: 'Total Spent',
      value: `KSH ${totalSpent.toLocaleString()}`,
      icon: '💰',
      color: '#fce4ec',
      note: loading ? 'Loading...' : `Across ${projects.length} projects`,
    },
    {
      title: 'Completed Projects',
      value: completedProjects,
      icon: '✅',
      color: '#e3f2fd',
      note: loading ? 'Loading...' : `${completedProjects} delivered`,
    },
  ];

  // Money stats for bar chart (could be enhanced with actual payment data)
  const clientMoney = totalSpent;
  const developerMoney = projects.reduce((sum, p) => 
    (p.status?.toUpperCase() === 'COMPLETED' ? (p.budget || 0) : 0) + sum, 0
  );

  // Client-focused quick actions
  const actions = [
    { label: 'Post New Project', icon: '➕', path: '/myProjects' },
    { label: 'Find Developers', icon: '🔍', path: '/findDevelopers' },
    { label: 'Manage Budget', icon: '💵', path: '/client-payments' },
    { label: 'View Reports', icon: '📊', path: '/client-reports' },
  ];

  // Calculate progress percentage for each project based on milestones
  const calculateProgress = (project) => {
    if (!project.milestones || project.milestones.length === 0) return 0;
    const completedMilestones = project.milestones.filter(m => 
      m.status?.toUpperCase() === 'COMPLETED' || m.completed
    ).length;
    return Math.round((completedMilestones / project.milestones.length) * 100);
  };

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
        {loading ? (
          <div className="loading-message">Loading projects...</div>
        ) : error ? (
          <div className="error-message">Error: {error}</div>
        ) : projects.length === 0 ? (
          <div className="empty-message">No projects yet. Create your first project!</div>
        ) : (
          <div className="projects-list">
            {projects.map((proj) => {
              const progress = calculateProgress(proj);
              return (
                <div key={proj.id} className="project-item project-link" onClick={() => setSelectedProject(proj)} role="button" tabIndex={0}>
                  <div className="project-name">{proj.title || proj.name}</div>
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
        <ProjectDetailsModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}

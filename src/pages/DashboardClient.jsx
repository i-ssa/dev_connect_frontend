
import React, { useState } from 'react';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
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
  // Client-focused stats
  const summary = [
    {
      title: 'Active Projects',
      value: 4,
      icon: '📂',
      color: '#fff3e0',
      note: '↑ 1 new this week',
    },
    {
      title: 'Developers Hired',
      value: 8,
      icon: '👥',
      color: '#e8f5e9',
      note: '↑ 2 this month',
    },
    {
      title: 'Total Spent',
      value: 'KSH 27,879',
      icon: '💰',
      color: '#fce4ec',
      note: '↑ 12% from last month',
    },
    {
      title: 'Completed Projects',
      value: 12,
      icon: '✅',
      color: '#e3f2fd',
      note: '↑ 3 delivered',
    },
  ];

  // Money stats for bar chart
  const clientMoney = 27879;
  const developerMoney = 15800;

  // Client-focused quick actions
  const actions = [
    { label: 'Post New Project', icon: '➕' },
    { label: 'Find Developers', icon: '🔍' },
    { label: 'Manage Budget', icon: '💵' },
    { label: 'View Reports', icon: '📊' },
  ];

  // Projects offered by client (include ids)
  const projectsOffered = [
    { id: 'p1', name: 'Restaurant Website', percent: 80, clientId: 'c100', description: 'Local restaurant site', milestones: [], status: 'In Progress' },
    { id: 'p2', name: 'E-Commerce Platform', percent: 55, clientId: 'c100', description: 'Online store', milestones: [], status: 'In Progress' },
    { id: 'p3', name: 'Portfolio Site', percent: 30, clientId: 'c100', description: 'Personal portfolio', milestones: [], status: 'Planning' },
    { id: 'p4', name: 'Booking App', percent: 90, clientId: 'c100', description: 'Tour booking app', milestones: [], status: 'In Review' },
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
        <div className="projects-title">Projects Offered</div>
        <div className="projects-list">
          {projectsOffered.map((proj) => (
            <div key={proj.id} className="project-item project-link" onClick={() => setSelectedProject(proj)} role="button" tabIndex={0}>
              <div className="project-name">{proj.name}</div>
              <div className="project-progress-bar">
                <div className="project-progress" style={{ width: `${proj.percent}%` }} />
                <span className="project-percent">{proj.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedProject && (
        <ProjectDetailsModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}

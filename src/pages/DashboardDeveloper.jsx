
import React, { useState } from 'react';
import ProjectDetailsModal from '../components/ProjectDetailsModal';
import '../styles/Dashboard.css';

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
  // Example stats
  const summary = [
    {
      title: 'Agents Deployed',
      value: 12,
      icon: '🤖',
      color: '#e3f2fd',
      note: '↑ 2 from last week',
    },
    {
      title: 'Active Workflows',
      value: 32,
      icon: '⚙️',
      color: '#e8f5e9',
      note: '↑ 8% increase',
    },
    {
      title: 'Pending Alerts',
      value: 3,
      icon: '🔔',
      color: '#fff3e0',
      note: '↓ 1 new alert',
    },
    {
      title: 'Completed Tasks',
      value: 67,
      icon: '✅',
      color: '#e1f5fe',
      note: '↑ 10 today',
    },
  ];

  // Money stats for bar chart
  const clientMoney = 15800;
  const developerMoney = 27879;

  // Developer-focused quick actions
  const actions = [
    { label: 'Browse Projects', icon: '🔍' },
    { label: 'Update Skills', icon: '⚡' },
    { label: 'Time Tracker', icon: '⏱️' },
    { label: 'Earnings Report', icon: '💸' },
  ];

  // Projects done by developer (include ids and clientId to allow linking)
  const projectsDone = [
    {
      id: 'p1',
      name: 'Restaurant Website',
      percent: 100,
      clientId: 'c100',
      client: 'John Client',
      description: 'Full website for a local restaurant with menu and reservations.',
      milestones: [
        { id: 'm1', title: 'Design', status: 'Done' },
        { id: 'm2', title: 'Dev', status: 'Done' },
        { id: 'm3', title: 'Testing', status: 'Done' },
      ],
      status: 'Completed',
    },
    {
      id: 'p2',
      name: 'E-Commerce Platform',
      percent: 85,
      clientId: 'c101',
      client: 'Acme Store',
      description: 'Shopping platform with payments and admin panel.',
      milestones: [
        { id: 'm1', title: 'Scoping', status: 'Done' },
        { id: 'm2', title: 'Implementation', status: 'In Progress' },
      ],
      status: 'In Progress',
    },
    { id: 'p3', name: 'Portfolio Site', percent: 60, clientId: 'c102', client: 'Sally Portfolio', description: 'Personal portfolio site.', milestones: [], status: 'In Progress' },
    { id: 'p4', name: 'Booking App', percent: 95, clientId: 'c103', client: 'TravelCo', description: 'Booking web app for tours.', milestones: [], status: 'Almost Done' },
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
        <div className="projects-title">Projects Done</div>
        <div className="projects-list">
          {projectsDone.map((proj) => (
            <div key={proj.id} className="project-item project-link" onClick={() => setSelectedProject(proj)} role="button" tabIndex={0}>
              <div className="project-name">{proj.name}</div>
              <div className="project-owner">{proj.client}</div>
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

import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';
import { mapBackendProjectToFrontend } from '../utils/projectMapper';
import '../styles/Analytics.css';

export default function Analytics() {
  const [myProjects, setMyProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('devconnect_user') || '{}');
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    const loadProjects = async () => {
      if (!currentUser?.developerId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const backendProjects = await ApiService.getProjectsByDeveloper(currentUser.developerId);
        const mapped = (backendProjects || []).map(mapBackendProjectToFrontend);
        setMyProjects(mapped);
      } catch (e) {
        console.error('Failed to load projects for analytics', e);
        setMyProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [currentUser?.developerId]);

  // Calculate statistics
  const totalProjects = myProjects.length;
  const activeProjects = myProjects.filter(p => 
    p.status === 'in-progress' || p.status === 'active'
  ).length;
  const completedProjects = myProjects.filter(p => 
    p.status === 'completed' || p.status === 'done'
  ).length;
  const pendingProjects = myProjects.filter(p => 
    p.status === 'pending'
  ).length;

  const totalEarnings = myProjects
    .filter(p => p.status === 'completed' || p.status === 'done')
    .reduce((sum, p) => sum + (p.budget || 0), 0);

  const potentialEarnings = myProjects
    .filter(p => p.status === 'in-progress' || p.status === 'active')
    .reduce((sum, p) => sum + (p.budget || 0), 0);

  // Calculate completion rate
  const completionRate = totalProjects > 0 
    ? Math.round((completedProjects / totalProjects) * 100) 
    : 0;

  // Project status breakdown for chart
  const statusData = [
    { status: 'Active', count: activeProjects, color: '#3b82f6' },
    { status: 'Completed', count: completedProjects, color: '#10b981' },
    { status: 'Pending', count: pendingProjects, color: '#f59e0b' },
  ];

  const maxCount = Math.max(...statusData.map(d => d.count), 1);

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p>Track your project performance and earnings</p>
      </div>

      {isLoading ? (
        <div className="analytics-loading">Loading analytics...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="analytics-stats-grid">
            <div className="analytics-stat-card">
              <div className="stat-icon" style={{ background: '#e0e7ff' }}>📊</div>
              <div className="stat-content">
                <div className="stat-value">{totalProjects}</div>
                <div className="stat-label">Total Projects</div>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="stat-icon" style={{ background: '#dcfce7' }}>✅</div>
              <div className="stat-content">
                <div className="stat-value">{completedProjects}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="stat-icon" style={{ background: '#dbeafe' }}>🚀</div>
              <div className="stat-content">
                <div className="stat-value">{activeProjects}</div>
                <div className="stat-label">Active</div>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
              <div className="stat-content">
                <div className="stat-value">{pendingProjects}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="analytics-charts-row">
            {/* Status Breakdown Chart */}
            <div className="analytics-chart-card">
              <h3>Project Status Breakdown</h3>
              <div className="status-chart">
                {statusData.map((item, index) => (
                  <div key={index} className="status-bar-container">
                    <div className="status-label">{item.status}</div>
                    <div className="status-bar-wrapper">
                      <div 
                        className="status-bar" 
                        style={{ 
                          width: `${(item.count / maxCount) * 100}%`,
                          backgroundColor: item.color 
                        }}
                      />
                      <span className="status-count">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Earnings Overview */}
            <div className="analytics-chart-card">
              <h3>Earnings Overview</h3>
              <div className="earnings-chart">
                <div className="earnings-item">
                  <div className="earnings-label">Total Earned</div>
                  <div className="earnings-value" style={{ color: '#10b981' }}>
                    KSH {totalEarnings.toLocaleString()}
                  </div>
                  <div className="earnings-subtitle">From completed projects</div>
                </div>
                <div className="earnings-divider" />
                <div className="earnings-item">
                  <div className="earnings-label">Potential Earnings</div>
                  <div className="earnings-value" style={{ color: '#3b82f6' }}>
                    KSH {potentialEarnings.toLocaleString()}
                  </div>
                  <div className="earnings-subtitle">From active projects</div>
                </div>
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="analytics-chart-card full-width">
            <h3>Completion Rate</h3>
            <div className="completion-rate-container">
              <div className="completion-rate-circle">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="20"
                    strokeDasharray={`${(completionRate / 100) * 502} 502`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                  />
                  <text
                    x="100"
                    y="100"
                    textAnchor="middle"
                    dy="0.3em"
                    fontSize="48"
                    fontWeight="bold"
                    fill="#1f2937"
                  >
                    {completionRate}%
                  </text>
                </svg>
              </div>
              <div className="completion-rate-details">
                <p>You have successfully completed {completedProjects} out of {totalProjects} total projects.</p>
                {completionRate === 100 && totalProjects > 0 && (
                  <p className="success-message">🎉 Perfect completion rate! Keep up the excellent work!</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

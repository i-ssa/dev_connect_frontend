import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RoleSelectionPage.css';

const RoleSelectionPage = ({ onRoleSelect }) => {
  const navigate = useNavigate();

  const handleClientSelection = () => {
    // Navigate to client dashboard with setup flag
    navigate('/projects', { state: { showSetup: true, role: 'client' } });
  };

  const handleDeveloperSelection = () => {
    // Navigate developers straight to the marketplace to find projects
    navigate('/marketplace');
  };

  return (
    <div className="role-selection-page">
      <div className="role-selection-container">
        <div className="header-section">
          <h1 className="main-title">Welcome to DevConnect</h1>
          <p className="main-subtitle">
            Connect clients with developers for custom web applications
          </p>
        </div>

        {/* Role Cards */}
        <div className="role-cards-container">
          <div className="role-card client-card" onClick={handleClientSelection}>
            <div className="role-icon">
              <svg width="50" height="50" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="40" cy="25" r="10" stroke="currentColor" strokeWidth="3" fill="none"/>
                <circle cx="25" cy="35" r="8" stroke="currentColor" strokeWidth="3" fill="none"/>
                <circle cx="55" cy="35" r="8" stroke="currentColor" strokeWidth="3" fill="none"/>
                <path d="M15 55 C15 45, 25 40, 40 40 C55 40, 65 45, 65 55" stroke="currentColor" strokeWidth="3" fill="none"/>
              </svg>
            </div>
            <h2>I'm a Client</h2>
            <p className="role-description">
              I have a project idea and need a developer to bring it to life
            </p>
            <ul className="role-features">
              <li>Post project descriptions</li>
              <li>Upload designs and mockups</li>
              <li>Track development progress</li>
              <li>Receive final deliverables</li>
            </ul>
          </div>

          <div className="role-card developer-card" onClick={handleDeveloperSelection}>
            <div className="role-icon">
              💻
            </div>
            <h2>I'm a Developer</h2>
            <p className="role-description">
              I build web applications and want to take on client projects
            </p>
            <ul className="role-features">
              <li>Browse available projects</li>
              <li>Apply for interesting work</li>
              <li>Provide progress updates</li>
              <li>Submit completed projects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
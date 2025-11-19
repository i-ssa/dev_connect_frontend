import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ClientSetup from "../components/ClientSetup";
import CreateProjectModal from "../components/CreateProjectModal";
import ProjectCard from "../components/ProjectCard";
import { getProjectsByClient } from "../api/projectAPI";
import { mapBackendProjectToFrontend } from "../utils/projectMapper";
import "../styles/MyProjects.css";

const MyProjects = () => {
  const location = useLocation();
  const [showSetup, setShowSetup] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // all, in-progress, completed
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(true);

  useEffect(() => {
    // Check if we should show the setup overlay
    if (location.state?.showSetup && location.state?.role === 'client') {
      setShowSetup(true);
    }

    // Load current user and fetch projects
    loadUserAndProjects();
  }, [location]);

  const loadUserAndProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user from localStorage
      const userStr = localStorage.getItem('devconnect_user');
      if (!userStr) {
        setError('No user logged in. Please login first.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);
      const role = (user.userRole || user.role || '').toLowerCase();
      const userIsClient = role === 'client';
      setIsClient(userIsClient);

      if (!userIsClient) {
        setError('Only clients can manage projects in this view.');
        setLoading(false);
        return;
      }

      // Fetch projects from backend using clientId
      if (user.id || user.userId) {
        const clientId = user.id || user.userId;
        const backendProjects = await getProjectsByClient(clientId);
        
        // Map backend DTOs to frontend shape
        const mappedProjects = backendProjects
          .map(mapBackendProjectToFrontend)
          .filter((project) => project?.isClaimed);
        setProjects(mappedProjects);
      } else {
        setError('User ID not found. Cannot fetch projects.');
      }

      setLoading(false);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setError(err.message || 'Failed to load projects. Please try again.');
      setLoading(false);
    }
  };

  const handleSetupComplete = (profileData) => {
    // Create client user with profile data
    const clientUser = {
      id: 1,
      email: 'john@example.com',
      role: 'client',
      ...profileData,
    };
    
    // Save to localStorage
    localStorage.setItem('devconnect_user', JSON.stringify(clientUser));
    
    // Close setup overlay
    setShowSetup(false);
  };

  const handleSetupClose = () => {
    setShowSetup(false);
  };

  const handleCreateProject = async (newProject) => {
    try {
      console.log('Project created, reloading list from backend...');
      // Reload from backend to get the complete, up-to-date list
      await loadUserAndProjects();
    } catch (err) {
      console.error('Failed to reload projects after creation:', err);
      // Try to add optimistically as fallback
      try {
        const mappedProject = mapBackendProjectToFrontend(newProject);
        if (mappedProject?.isClaimed) {
          setProjects(prev => [mappedProject, ...prev]);
        }
      } catch (mapErr) {
        console.error('Failed to add project optimistically:', mapErr);
      }
    }
  };

  const filterProjects = () => {
    switch (activeTab) {
      case "in-progress":
        return projects.filter(p => p.status === "in-progress");
      case "completed":
        return projects.filter(p => p.status === "completed");
      default:
        return projects;
    }
  };

  const filteredProjects = filterProjects();

  return (
    <>
      <div className="projects-page">
        <div className="projects-header">
          <h1>My Projects</h1>
          <p className="subtitle">Track and manage all your projects in one place</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading projects...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Error loading projects</h3>
            <p>{error}</p>
            <button onClick={loadUserAndProjects} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Tabs */}
            <div className="projects-tabs">
              <button
                className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                All Projects
                <span className="tab-count">{projects.length}</span>
              </button>
              <button
                className={`tab-btn ${activeTab === "in-progress" ? "active" : ""}`}
                onClick={() => setActiveTab("in-progress")}
              >
                In Progress
                <span className="tab-count">
                  {projects.filter(p => p.status === "in-progress").length}
                </span>
              </button>
              <button
                className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
                onClick={() => setActiveTab("completed")}
              >
                Completed
                <span className="tab-count">
                  {projects.filter(p => p.status === "completed").length}
                </span>
              </button>
            </div>

            {/* Projects Grid */}
            <div className="projects-content">
              {filteredProjects.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No claimed projects yet</h3>
                  <p>Your projects will appear here once a developer claims them.</p>
                </div>
              ) : (
                <div className="projects-grid">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Floating Add Button */}
        {isClient && (
          <button
            className="floating-add-btn"
            onClick={() => setShowCreateModal(true)}
            aria-label="Create new project"
          >
            +
          </button>
        )}
      </div>

      {/* Modals */}
      <ClientSetup
        isOpen={showSetup}
        onClose={handleSetupClose}
        onComplete={handleSetupComplete}
      />
      {isClient && (
        <CreateProjectModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateProject={handleCreateProject}
        />
      )}
    </>
  );
};

export default MyProjects;

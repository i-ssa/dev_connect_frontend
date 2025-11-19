import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/FindClients.css';
import ClientCard from '../components/ClientCard';
import DeveloperSetup from '../components/DeveloperSetup';
import { getUsersByRole } from '../API/userAPI';
import ApiService from '../services/ApiService';

export default function FindClients() {
  const location = useLocation();
  const [showSetup, setShowSetup] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we should show the setup overlay
    if (location.state?.showSetup && location.state?.role === 'developer') {
      setShowSetup(true);
    }
  }, [location]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('devconnect_token');
        
        if (!token) {
          setError('Please log in to view clients');
          setLoading(false);
          return;
        }
        
        // Fetch all users with CLIENT role
        const clientUsers = await getUsersByRole('CLIENT', token);
        
        // For each client, fetch their projects to show what they need
        const clientsWithProjects = await Promise.all(
          (clientUsers || []).map(async (client) => {
            try {
              const projects = await ApiService.getProjectsByClient(client.id || client.userId);
              return {
                ...client,
                projects: projects || [],
                activeProjects: (projects || []).filter(p => 
                  p.status?.toUpperCase() === 'ACTIVE' || 
                  p.status?.toUpperCase() === 'OPEN' ||
                  p.status?.toUpperCase() === 'PLANNING'
                ).length,
              };
            } catch (err) {
              console.error(`Error fetching projects for client ${client.id}:`, err);
              return {
                ...client,
                projects: [],
                activeProjects: 0,
              };
            }
          })
        );

        setClients(clientsWithProjects);
        setError(null);
      } catch (err) {
        console.error('Error fetching clients:', err);
        if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
          setError('Authentication required. Please log in again.');
        } else {
          setError('Unable to connect to server. Please try again later.');
        }
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleSetupComplete = (profileData) => {
    // Create developer user with profile data
    const developerUser = {
      id: 2,
      email: 'alex@example.com',
      role: 'developer',
      ...profileData,
    };
    
    // Save to localStorage
    localStorage.setItem('devconnect_user', JSON.stringify(developerUser));
    
    // Close setup overlay
    setShowSetup(false);
  };

  const handleSetupClose = () => {
    setShowSetup(false);
  };

  return (
    <>
      <div className="find-clients-page">
        <section className="find-clients-header">
          <h1>Find Clients</h1>
          <p className="subtitle">Discover clients with active projects. Connect and collaborate.</p>
        </section>

        <section className="clients-list-card">
          {loading ? (
            <div className="loading-message">Loading clients...</div>
          ) : error ? (
            <div className="error-message">Error: {error}</div>
          ) : clients.length === 0 ? (
            <div className="empty-message">No clients found. Check back later!</div>
          ) : (
            clients.map(client => (
              <ClientCard 
                key={client.id || client.userId} 
                client={{
                  id: client.id || client.userId,
                  name: `${client.firstName || ''} ${client.lastName || ''}`.trim() || client.username || 'Anonymous Client',
                  description: client.activeProjects > 0 
                    ? `${client.activeProjects} active project${client.activeProjects > 1 ? 's' : ''} available`
                    : 'No active projects at the moment',
                  email: client.email,
                  projects: client.projects,
                }}
              />
            ))
          )}
        </section>
      </div>

      {/* Developer Setup Overlay */}
      <DeveloperSetup
        isOpen={showSetup}
        onClose={handleSetupClose}
        onComplete={handleSetupComplete}
      />
    </>
  );
}

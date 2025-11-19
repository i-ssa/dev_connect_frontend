import { useState, useEffect } from 'react';
import '../styles/ProfilePage.css';

const ProfilePage = ({ currentUser }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage or props on mount
  useEffect(() => {
    try {
      console.log('[ProfilePage] Starting to load user...', { currentUser });
      
      // Try to get user from localStorage first
      const savedUser = localStorage.getItem('devconnect_user');
      console.log('[ProfilePage] Saved user from localStorage:', savedUser);
      
      let userData = null;
      
      if (savedUser) {
        userData = JSON.parse(savedUser);
      } else if (currentUser) {
        userData = currentUser;
      }
      
      // If we have user data, ensure all fields exist
      if (userData) {
        if (!userData.skills) userData.skills = [];
        if (!userData.bio) userData.bio = '';
        if (!userData.location) userData.location = '';
        if (!userData.website) userData.website = '';
        if (!userData.github) userData.github = '';
        if (!userData.linkedin) userData.linkedin = '';
        if (!userData.experience) userData.experience = '';
        if (!userData.hourlyRate) userData.hourlyRate = 0;
        if (!userData.availability) userData.availability = 'Available';
        if (!userData.joinedDate) userData.joinedDate = new Date().toISOString();
        
        console.log('[ProfilePage] User data loaded:', userData);
        setUser(userData);
        setFormData(userData);
      }
    } catch (error) {
      console.error('[ProfilePage] Error loading user:', error);
    } finally {
      console.log('[ProfilePage] Setting loading to false');
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!user || !formData) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>Please log in to view your profile</h2>
            <p>You need to be logged in to access this page.</p>
            <button onClick={() => window.location.href = '/'} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setFormData(prev => ({
      ...prev,
      skills
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Update local state
      setUser(formData);
      
      // Save to localStorage
      localStorage.setItem('devconnect_user', JSON.stringify(formData));
      
      // TODO: Call API to update user profile on backend
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';
      const response = await fetch(`${API_BASE_URL}/api/users/${formData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        console.log('Profile updated successfully');
      } else {
        console.error('Failed to update profile on backend');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {formData.avatar ? (
                <img src={formData.avatar} alt={formData.username} />
              ) : (
                <div className="avatar-placeholder">
                  {formData.firstName?.charAt(0)}{formData.lastName?.charAt(0)}
                </div>
              )}
            </div>
            {isEditing && (
              <button className="change-avatar-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                Change Photo
              </button>
            )}
          </div>

          <div className="profile-header-info">
            <div className="profile-name-role">
              {isEditing ? (
                <div className="edit-name-group">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="First Name"
                    className="edit-input"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last Name"
                    className="edit-input"
                  />
                </div>
              ) : (
                <h1>{formData.firstName} {formData.lastName}</h1>
              )}
              <span className={`role-badge ${formData.role}`}>
                {formData.role === 'client' ? '💼 Client' : '👨‍💻 Developer'}
              </span>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-label">Projects</span>
                <span className="stat-value">12</span>
              </div>
              <div className="stat">
                <span className="stat-label">Connections</span>
                <span className="stat-value">48</span>
              </div>
              <div className="stat">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">{formatDate(formData.joinedDate)}</span>
              </div>
            </div>

            {!isEditing ? (
              <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSubmit}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <form className="profile-content" onSubmit={handleSubmit}>
          {/* About Section */}
          <div className="profile-section">
            <h2>About</h2>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                className="edit-textarea"
                rows="4"
              />
            ) : (
              <p className="bio">{formData.bio}</p>
            )}
          </div>

          {/* Contact Information */}
          <div className="profile-section">
            <h2>Contact Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Email
                </span>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                ) : (
                  <span className="info-value">{formData.email}</span>
                )}
              </div>

              <div className="info-item">
                <span className="info-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Location
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="edit-input"
                    placeholder="City, Country"
                  />
                ) : (
                  <span className="info-value">{formData.location}</span>
                )}
              </div>

              <div className="info-item">
                <span className="info-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  Website
                </span>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="edit-input"
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <a href={formData.website} target="_blank" rel="noopener noreferrer" className="info-value link">
                    {formData.website}
                  </a>
                )}
              </div>

              <div className="info-item">
                <span className="info-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  GitHub
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleInputChange}
                    className="edit-input"
                    placeholder="username"
                  />
                ) : (
                  <a href={`https://github.com/${formData.github}`} target="_blank" rel="noopener noreferrer" className="info-value link">
                    @{formData.github}
                  </a>
                )}
              </div>

              <div className="info-item">
                <span className="info-label">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" fill="currentColor"/>
                    <circle cx="4" cy="4" r="2" fill="currentColor"/>
                  </svg>
                  LinkedIn
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="edit-input"
                    placeholder="username"
                  />
                ) : (
                  <a href={`https://linkedin.com/in/${formData.linkedin}`} target="_blank" rel="noopener noreferrer" className="info-value link">
                    @{formData.linkedin}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Skills & Expertise (for Developers) */}
          {formData.role === 'developer' && (
            <div className="profile-section">
              <h2>Skills & Expertise</h2>
              {isEditing ? (
                <input
                  type="text"
                  value={(formData.skills || []).join(', ')}
                  onChange={handleSkillsChange}
                  placeholder="JavaScript, React, Node.js, Python..."
                  className="edit-input"
                />
              ) : (
                <div className="skills-list">
                  {(formData.skills || []).map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Professional Details */}
          <div className="profile-section">
            <h2>Professional Details</h2>
            <div className="info-grid">
              {formData.role === 'developer' && (
                <>
                  <div className="info-item">
                    <span className="info-label">Experience</span>
                    {isEditing ? (
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        className="edit-input"
                        placeholder="e.g., 5 years"
                      />
                    ) : (
                      <span className="info-value">{formData.experience}</span>
                    )}
                  </div>

                  <div className="info-item">
                    <span className="info-label">Hourly Rate</span>
                    {isEditing ? (
                      <input
                        type="number"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        className="edit-input"
                        placeholder="75"
                      />
                    ) : (
                      <span className="info-value">${formData.hourlyRate}/hr</span>
                    )}
                  </div>
                </>
              )}

              <div className="info-item">
                <span className="info-label">Availability</span>
                {isEditing ? (
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    className="edit-input"
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                ) : (
                  <span className={`availability-badge ${(formData.availability || 'available').toLowerCase().replace(' ', '-')}`}>
                    {formData.availability || 'Available'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;

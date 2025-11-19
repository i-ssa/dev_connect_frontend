import React, { useState, useEffect, useMemo } from 'react';
import '../styles/ProfilePage.css';
import { updateUser, getUserById } from '../api/userAPI';

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('devconnect_user') || '{}');
  } catch (error) {
    console.warn('Failed to parse stored user data:', error);
    return {};
  }
};

const normalizeUser = (user = {}) => {
  const skillsArray = Array.isArray(user.skills)
    ? user.skills
    : typeof user.skills === 'string'
      ? user.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
      : [];

  return {
    ...user,
    id: user.userId || user.id,
    userRole: (user.userRole || user.role || 'CLIENT').toLowerCase(),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    username: user.username || '',
    email: user.email || '',
    telephone: user.telephone || '',
    location: user.location || '',
    website: user.website || '',
    github: user.github || '',
    linkedin: user.linkedin || '',
    bio: user.bio || '',
    skills: skillsArray,
    experience: user.experience || '',
    hourlyRate: user.hourlyRate || '',
    availability: user.availability || 'Available',
    projectCount: user.projectCount || 0,
    completedProjectCount: user.completedProjectCount || 0,
    joinedDate: user.joinedDate || user.createdAt || new Date().toISOString(),
  };
};

const ProfileDetails = ({ initialUser = null, className = '', fullWidth = false }) => {
  const [user, setUser] = useState(() => normalizeUser(initialUser || readStoredUser()));
  const [formData, setFormData] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Keep form data in sync when user changes (e.g., after login refresh)
  useEffect(() => {
    setUser((prev) => {
      const normalized = normalizeUser(initialUser || readStoredUser());
      setFormData((current) => (isEditing ? current : normalized));
      return normalized;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUser]);

  useEffect(() => {
    const handleUserUpdated = () => {
      const stored = normalizeUser(readStoredUser());
      setUser(stored);
      if (!isEditing) {
        setFormData(stored);
      }
    };

    window.addEventListener('userDataUpdated', handleUserUpdated);
    window.addEventListener('storage', handleUserUpdated);
    return () => {
      window.removeEventListener('userDataUpdated', handleUserUpdated);
      window.removeEventListener('storage', handleUserUpdated);
    };
  }, [isEditing]);

  const initials = useMemo(() => {
    const fallback = formData.username?.charAt(0) || '?';
    return `${formData.firstName?.charAt(0) || ''}${formData.lastName?.charAt(0) || ''}`.trim() || fallback;
  }, [formData.firstName, formData.lastName, formData.username]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsChange = (event) => {
    const value = event.target.value;
    const parsed = value
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      skills: parsed,
    }));
  };

  const resetEditingState = () => {
    setFormData(user);
    setIsEditing(false);
    setStatusMessage('');
    setErrorMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user.id) {
      setErrorMessage('No user found to update. Please sign in again.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        telephone: formData.telephone,
        location: formData.location,
        website: formData.website,
        github: formData.github,
        linkedin: formData.linkedin,
        bio: formData.bio,
        skills: formData.skills,
        experience: formData.experience,
        hourlyRate: formData.hourlyRate,
        availability: formData.availability,
      };

      await updateUser(user.id, payload);
      const refreshed = await getUserById(user.id);
      const normalized = normalizeUser({ ...refreshed, ...payload });
      setUser(normalized);
      setFormData(normalized);
      localStorage.setItem('devconnect_user', JSON.stringify(normalized));
      window.dispatchEvent(new Event('userDataUpdated'));
      setStatusMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrorMessage(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user.id) {
    return (
      <div className={`profile-container ${className} ${fullWidth ? 'full-width' : ''}`}>
        <div className="profile-header">
          <p>Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const projectCount = formData.projectCount || user.projectCount || 0;
  const completedProjects = formData.completedProjectCount || user.completedProjectCount || 0;
  const activeProjects = Math.max(projectCount - completedProjects, 0);

  return (
    <div className={`profile-container ${className} ${fullWidth ? 'full-width' : ''}`}>
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {formData.avatar ? (
              <img src={formData.avatar} alt={formData.username || 'Profile avatar'} />
            ) : (
              <div className="avatar-placeholder">{initials}</div>
            )}
          </div>
          <p className="avatar-note">Profile photo uploads are coming soon.</p>
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
              <h1>{formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}`.trim() : formData.username}</h1>
            )}
            <span className={`role-badge ${formData.userRole}`}>
              {formData.userRole === 'client' ? '💼 Client' : '👨‍💻 Developer'}
            </span>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-label">Projects</span>
              <span className="stat-value">{projectCount}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Active</span>
              <span className="stat-value">{activeProjects}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{completedProjects}</span>
            </div>
          </div>

          {!isEditing ? (
            <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="cancel-btn" onClick={resetEditingState} disabled={isSaving}>
                Cancel
              </button>
            </div>
          )}

          {statusMessage && <p className="profile-status success">{statusMessage}</p>}
          {errorMessage && <p className="profile-status error">{errorMessage}</p>}
        </div>
      </div>

      <form className="profile-content" onSubmit={handleSubmit}>
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
            <p className="bio">{formData.bio || 'Add a short biography to tell others more about you.'}</p>
          )}
        </div>

        <div className="profile-section">
          <h2>Contact Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Email</span>
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
              <span className="info-label">Phone</span>
              {isEditing ? (
                <input
                  type="text"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  className="edit-input"
                  placeholder="e.g., +254712345678"
                />
              ) : (
                <span className="info-value">{formData.telephone || 'Not provided'}</span>
              )}
            </div>
            <div className="info-item">
              <span className="info-label">Location</span>
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
                <span className="info-value">{formData.location || 'Add your location'}</span>
              )}
            </div>
            <div className="info-item">
              <span className="info-label">Website</span>
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="edit-input"
                  placeholder="https://yourwebsite.com"
                />
              ) : formData.website ? (
                <a href={formData.website} target="_blank" rel="noopener noreferrer" className="info-value link">
                  {formData.website}
                </a>
              ) : (
                <span className="info-value">Add your website</span>
              )}
            </div>
            <div className="info-item">
              <span className="info-label">GitHub</span>
              {isEditing ? (
                <input
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="edit-input"
                  placeholder="username"
                />
              ) : formData.github ? (
                <a href={`https://github.com/${formData.github}`} target="_blank" rel="noopener noreferrer" className="info-value link">
                  @{formData.github}
                </a>
              ) : (
                <span className="info-value">Add your GitHub</span>
              )}
            </div>
            <div className="info-item">
              <span className="info-label">LinkedIn</span>
              {isEditing ? (
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="edit-input"
                  placeholder="username"
                />
              ) : formData.linkedin ? (
                <a href={`https://linkedin.com/in/${formData.linkedin}`} target="_blank" rel="noopener noreferrer" className="info-value link">
                  @{formData.linkedin}
                </a>
              ) : (
                <span className="info-value">Add your LinkedIn</span>
              )}
            </div>
          </div>
        </div>

        {formData.userRole === 'developer' && (
          <div className="profile-section">
            <h2>Skills & Expertise</h2>
            {isEditing ? (
              <input
                type="text"
                value={formData.skills.join(', ')}
                onChange={handleSkillsChange}
                placeholder="JavaScript, React, Node.js..."
                className="edit-input"
              />
            ) : (
              <div className="skills-list">
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))
                ) : (
                  <span className="info-value">Add your key skills</span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="profile-section">
          <h2>Professional Details</h2>
          <div className="info-grid">
            {formData.userRole === 'developer' && (
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
                    <span className="info-value">{formData.experience || 'Add your experience'}</span>
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
                    <span className="info-value">
                      {formData.hourlyRate ? `$${formData.hourlyRate}/hr` : 'Set your rate'}
                    </span>
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
                <span className={`availability-badge ${formData.availability.toLowerCase().replace(' ', '-')}`}>
                  {formData.availability}
                </span>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileDetails;

import React, { useState, useEffect } from 'react';
import { UserProfile as UserProfileType, UpdateUserProfile } from '../types/userProfile';
import { ProfileService } from '../services/profileService';
import SubscriptionCard from './SubscriptionCard';
import './UserProfile.css';

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<UpdateUserProfile>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    bio: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const profileData = await ProfileService.getProfile();
      setProfile(profileData);
      
      // Populate form data
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phoneNumber: profileData.phoneNumber || '',
        bio: profileData.bio || '',
        dateOfBirth: profileData.dateOfBirth ? profileData.dateOfBirth.split('T')[0] : '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const updatedProfile = await ProfileService.updateProfile(formData);
      setProfile(updatedProfile);
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to current profile values
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
        bio: profile.bio || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="error">Failed to load profile. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!isEditing && (
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-content">
        {/* Personal Information Section */}
        <div className="profile-section">
          <h2>Personal Information</h2>
          
          <div className="profile-grid">
            <div className="profile-field">
              <label>Username</label>
              <div className="field-value">{profile.username}</div>
            </div>

            <div className="profile-field">
              <label>Email</label>
              <div className="field-value">{profile.email}</div>
            </div>

            <div className="profile-field">
              <label>First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
              ) : (
                <div className="field-value">{profile.firstName || 'Not set'}</div>
              )}
            </div>

            <div className="profile-field">
              <label>Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
              ) : (
                <div className="field-value">{profile.lastName || 'Not set'}</div>
              )}
            </div>

            <div className="profile-field">
              <label>Phone Number</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              ) : (
                <div className="field-value">{profile.phoneNumber || 'Not set'}</div>
              )}
            </div>

            <div className="profile-field">
              <label>Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="field-value">{formatDate(profile.dateOfBirth)}</div>
              )}
            </div>
          </div>

          <div className="profile-field full-width">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={500}
              />
            ) : (
              <div className="field-value bio-value">
                {profile.bio || 'No bio added yet'}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="edit-actions">
              <button 
                className="save-btn"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                className="cancel-btn"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          )}

          <div className="profile-meta">
            <small>Last updated: {formatDate(profile.lastUpdated)}</small>
          </div>
        </div>

        {/* Subscription Information Section */}
        <SubscriptionCard 
          subscription={profile.subscription}
          scanCount={profile.scanCount}
          lastScanDate={profile.lastScanDate}
          onCancellationSuccess={loadProfile}
        />

        {/* Usage Statistics Section */}
        <div className="profile-section">
          <h2>Usage Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{profile.scanCount}</div>
              <div className="stat-label">Total Scans</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {profile.lastScanDate ? formatDate(profile.lastScanDate) : 'Never'}
              </div>
              <div className="stat-label">Last Scan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
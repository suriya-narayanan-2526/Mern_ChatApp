import React, { useState } from 'react';
import '../styles/ProfilePage.css';

function ProfilePage({ currentUser, onLogout, onProfileUpdate, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || 'Hey there! I am using ChatApp');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch(`https://chatwithlocalfriends.onrender.com/api/auth/profile/${currentUser._id}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUser = { ...currentUser, profilePicture: data.profilePicture };
        onProfileUpdate(updatedUser);
      } else {
        alert(data.message || 'Failed to upload profile picture');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);

    try {
      const response = await fetch(`https://chatwithlocalfriends.onrender.com/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, bio }),
      });

      const data = await response.json();

      if (response.ok) {
        onProfileUpdate(data.user);
        setIsEditing(false);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(currentUser.name);
    setBio(currentUser.bio || 'Hey there! I am using ChatApp');
    setIsEditing(false);
  };

  const getProfileImage = () => {
    if (currentUser.profilePicture) {
      return `https://chatwithlocalfriends.onrender.com${currentUser.profilePicture}`;
    }
    return null;
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2>Profile</h2>
        <div></div>
      </div>

      <div className="profile-content">
        <div className="profile-picture-section">
          <div className="profile-picture-wrapper">
            {getProfileImage() ? (
              <img src={getProfileImage()} alt="Profile" className="profile-picture" />
            ) : (
              <div className="profile-picture-placeholder">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <label className="upload-btn" htmlFor="profile-upload">
              {uploading ? (
                <span className="loading-spinner"></span>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 3C6.13 3 3 6.13 3 10C3 13.87 6.13 17 10 17C13.87 17 17 13.87 17 10C17 6.13 13.87 3 10 3ZM13 11H11V13H9V11H7V9H9V7H11V9H13V11Z"/>
                </svg>
              )}
            </label>
            <input
              type="file"
              id="profile-upload"
              accept="image/*"
              onChange={handleProfilePictureUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </div>
        </div>

        <div className="profile-info">
          <div className="info-section">
            <label>Name</label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="edit-input"
              />
            ) : (
              <p>{currentUser.name}</p>
            )}
          </div>

          <div className="info-section">
            <label>Email</label>
            <p>{currentUser.email}</p>
          </div>

          <div className="info-section">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="edit-textarea"
                rows="3"
              />
            ) : (
              <p>{currentUser.bio || 'Hey there! I am using ChatApp'}</p>
            )}
          </div>
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <div className="edit-actions">
              <button onClick={handleCancel} className="cancel-btn" disabled={saving}>
                Cancel
              </button>
              <button onClick={handleSaveProfile} className="save-btn" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              Edit Profile
            </button>
          )}

          <button onClick={onLogout} className="logout-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 3H11V5H3V15H11V17H3C1.89 17 1 16.1 1 15V5C1 3.9 1.89 3 3 3ZM13.59 11H7V9H13.59L11.29 6.71L12.71 5.29L17.41 10L12.71 14.71L11.29 13.29L13.59 11Z"/>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
import React, { useState, useRef } from 'react';
import '../styles/ProfileModal.css';

function ProfileModal({ user, onClose, onUpdate }) {
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || 'Hey there! I am using QuickChat');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.profilePhoto || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }

      const response = await fetch(`https://chatwithlocalfriends.onrender.com/api/profile/${user._id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        onUpdate(data.user);
        onClose();
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Unable to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay-dark" onClick={onClose}>
      <div className="modal-content-dark" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        <h2 className="modal-title">Profile details</h2>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-photo-section">
            <div className="photo-preview">
              {previewUrl ? (
                <img src={previewUrl.startsWith('http') ? previewUrl : `https://chatwithlocalfriends.onrender.com${previewUrl}`} alt="Profile" />
              ) : (
                <div className="default-avatar">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button
              type="button"
              className="upload-photo-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              upload profile image
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="form-group-dark">
            <input
              type="text"
              className="input-dark"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group-dark">
            <textarea
              className="textarea-dark"
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows="4"
              maxLength="150"
            />
            <span className="char-count">{bio.length}/150</span>
          </div>

          {error && (
            <div className="error-message-dark">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`save-button-dark ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;
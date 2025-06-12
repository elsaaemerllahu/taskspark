import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/authContext';
import './Profile.css';
import Sidebar from '../../components/Sidebar/Sidebar';
import { FaCamera } from 'react-icons/fa';

const Profile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const [activity, setActivity] = useState([]);


  const backendURL = '/backend/profile.php';
  useEffect(() => {
    if (!currentUser) return;

    fetch('/backend/activity.php', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        console.log('Fetched activity:', data); // Add this line
        
        setActivity(data);
      })
      .catch(err => {
        console.error('Failed to fetch activity:', err);
        setActivity([]);
      });
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    fetch(backendURL, {
      credentials: 'include'
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || 'Failed to fetch profile');
          });
        }
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setEditedProfile(data);
        setError(null);
      })
      .catch(err => {
        console.error('Fetch profile failed:', err);
        setError(err.message);
      });
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(backendURL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: editedProfile.username,
          email: editedProfile.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      if (data.success) {
        setProfile(editedProfile);
        setIsEditing(false);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setError(null);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPG, PNG, or GIF image.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File too large. Maximum size is 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/backend/upload-avatar.php', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload avatar');
      }

      const data = await response.json();
      if (data.success) {
        setProfile(prev => ({ ...prev, avatar: data.avatar }));
        setEditedProfile(prev => ({ ...prev, avatar: data.avatar }));
        setUploadError(null);
      }
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      setUploadError(err.message);
    }

    // Clear the file input
    event.target.value = '';
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return `/backend/serve-image.php?path=${encodeURIComponent(avatarPath)}`;
  };

  if (!currentUser) {
    return (
      <h1></h1>
    );
  }

  if (!profile && !error) {
    return (
            <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '80vh',
      width: '100%'
      }}>
      Loading...
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />

      <div style={{ width: '100%' }}>
        <div className="main-content-profile">
          <div className="profile" data-theme="light">
            <div className="profile-header">
              <h1>My Profile</h1>

            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {uploadError && (
              <div className="error-message">
                {uploadError}
              </div>
            )}

            <div className="profile-content">
              <div className="profile-left-section">
                <div className="profile-section">
                  <div className="profile-avatar" onClick={handleAvatarClick}>
                    {profile?.avatar ? (
                      <img src={getAvatarUrl(profile.avatar)} alt="Profile" />
                    ) : (
                      <div className="avatar-placeholder">
                        {typeof profile?.username === 'string' && profile.username.length > 0
                          ? profile.username[0].toUpperCase()
                          : 'U'}
                      </div>
                    )}
                    <div className="avatar-overlay">
                      <FaCamera />
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/gif"
                      style={{ display: 'none' }}
                    />
                  </div>

                  <div className="profile-info">
                    {isEditing ? (
                      <>
                        <div className="profile-field">
                          <label>Username</label>
                          <input
                            type="text"
                            value={editedProfile.username}
                            onChange={(e) => setEditedProfile({
                              ...editedProfile,
                              username: e.target.value
                            })}
                          />
                        </div>

                        <div className="profile-field">
                          <label>Email</label>
                          <input
                            type="email"
                            value={editedProfile.email}
                            onChange={(e) => setEditedProfile({
                              ...editedProfile,
                              email: e.target.value
                            })}
                          />
                        </div>

                        <div className="profile-actions">
                          <button className="save-btn" onClick={handleSave}>Save Changes</button>
                          <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="profile-field">
                          <label>Username</label>
                          <div className="field-value">{profile?.username}</div>
                        </div>

                        <div className="profile-field">
                          <label>Email</label>
                          <div className="field-value">{profile?.email}</div>
                        </div>

                        <div className="profile-actions">
                          <button className="edit-btn" onClick={() => setIsEditing(true)}>
                            Edit Profile
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="profile-right-section">
                <h1>Recent Activity</h1>
                <div className="activity-profile-list">
                  {activity.length === 0 && <div className="activity-profile-item">No recent activity</div>}
                  {activity.slice(0, 5).map((item, index) => (
                    <div key={index} className="activity-profile-item">
                      <div className="activity-profile-date">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </div>
                      <div className="activity-profile-description">
                        {item.action} - {item.details}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
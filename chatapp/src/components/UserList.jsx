import React from 'react';
import '../styles/UserList.css';

function UserList({ users, selectedUser, onUserSelect, unreadMessages }) {
  const onlineUsers = users.filter(user => user.isOnline);
  const offlineUsers = users.filter(user => !user.isOnline);

  const formatLastSeen = (lastSeen) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getProfileImage = (user) => {
    if (user.profilePicture) {
      return `https://chatwithlocalfriends.onrender.com${user.profilePicture}`;
    }
    return null;
  };

  const renderUser = (user) => {
    const unreadCount = unreadMessages[user._id] || 0;
    
    return (
      <div
        key={user._id}
        className={`user-item ${selectedUser?._id === user._id ? 'active' : ''}`}
        onClick={() => onUserSelect(user)}
      >
        <div className="user-avatar-wrapper">
          {getProfileImage(user) ? (
            <img src={getProfileImage(user)} alt={user.name} className="user-avatar-img" />
          ) : (
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className={`status-dot ${user.isOnline ? 'online' : 'offline'}`}></span>
        </div>
        <div className="user-info">
          <div className="user-name-row">
            <span className="user-name">{user.name}</span>
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </div>
          <span className="user-status">
            {user.isOnline ? 'Online' : `${formatLastSeen(user.lastSeen)}`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="user-list">
      <div className="user-list-content">
        {onlineUsers.length > 0 && (
          <div className="user-section">
            <div className="section-title">Online — {onlineUsers.length}</div>
            {onlineUsers.map(renderUser)}
          </div>
        )}

        {offlineUsers.length > 0 && (
          <div className="user-section">
            <div className="section-title">Offline — {offlineUsers.length}</div>
            {offlineUsers.map(renderUser)}
          </div>
        )}

        {users.length === 0 && (
          <div className="no-users">No users found</div>
        )}
      </div>
    </div>
  );
}

export default UserList;
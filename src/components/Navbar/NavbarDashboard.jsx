import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavbarDashboard.css';
import { FaBell, FaCircle, FaTrash, FaUser, FaSearch, FaTimes } from 'react-icons/fa';
import { useSearch } from '../../context/searchContext';

const Navbar = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [userAvatar, setUserAvatar] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const { searchQuery, setSearchQuery, searchResults, setSearchResults } = useSearch();

  const [userName, setUserName] = useState('');

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
        setSelectedNotifications([]); // Clear selections when closing
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/backend/auth-status.php', {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
          setAuthenticated(true);
          setUserName(data.username);
          setUserAvatar(data.avatar);
          fetchNotifications();
        } else {
          setAuthenticated(false);
          setUserName('');
          setUserAvatar(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/backend/notifications.php', {
        credentials: 'include'
      });
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setSelectedNotifications([]); // Clear selections when refreshing
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId = null) => {
    try {
      await fetch('/backend/notifications.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(notificationId ? { notificationId } : {})
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId = null) => {
    try {
      await fetch('/backend/notifications.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ notificationIds: notificationId ? [notificationId] : selectedNotifications })
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = async () => {
    await fetch('/backend/logout.php', {
      credentials: 'include',
    });

    const res = await fetch('/backend/auth-status.php', {
      credentials: 'include',
    });
    const data = await res.json();
    if (!data.authenticated) {
      localStorage.removeItem('authenticated');
      setAuthenticated(false);
      navigate('/login');
    } else {
      console.error("Logout failed on server.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    console.log('Avatar filename:', avatarPath);
    const url = `/backend/serve-image.php?path=${encodeURIComponent(avatarPath)}`;
    console.log('Full avatar URL:', url);
    return url;
  };

  // Update handleSearch function
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch('/backend/search.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ query: query.trim() })
      });

      const data = await response.json();
      console.log('Search results:', data);
      setSearchResults(data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className='top-part'>
      <nav className="navbar-dashboard">
        <div className="nav-dashboard-logo">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </div>

        <ul className="nav-dashboard-links">
          {!authenticated ? (
            <li><Link to="/login">Log in</Link></li>
          ) : (
            <>
              <li className="search-container" ref={searchRef}>
                <div className="search-input-navbar-wrapper">
                  <FaSearch className="search-icon-navbar" />
                  <input
                    type="text"
                    placeholder="Search dashboard"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="search-input-navbar"
                  />
                  {searchQuery && (
                    <button 
                      className="clear-search" 
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setShowSearchResults(false);
                      }}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                {showSearchResults && Object.keys(searchResults).length > 0 && (
                  <div className="search-results">
                    {Object.entries(searchResults).map(([category, items]) => (
                      items && items.length > 0 && (
                        <div key={category} className="search-category">
                          <h3>{category}</h3>
                          <div className="search-items">
                            {items.map((item, index) => (
                              <div key={index} className="search-result-item">
                                <div className="result-title">{item.title}</div>
                                <div className="result-preview">{item.preview}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </li>
              <li className="notification-icon" ref={notificationRef}>
                <button 
                  className="notification-button"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FaBell />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                      <div className="notification-actions">
                        {selectedNotifications.length > 0 && (
                          <button 
                            onClick={() => deleteNotification()} 
                            title={`Delete ${selectedNotifications.length} selected`}
                            className="delete-selected"
                          >
                            <FaTrash />
                            <span className="selected-count">{selectedNotifications.length}</span>
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="notifications-list">
                      {notifications.length === 0 ? (
                        <div className="no-notifications">No notifications</div>
                      ) : (
                        notifications.map(notification => (
                          <div 
                            key={notification.id} 
                            className={`notification-item ${!notification.is_read ? 'unread' : ''} ${
                              selectedNotifications.includes(notification.id) ? 'selected' : ''
                            }`}
                            onClick={() => toggleNotificationSelection(notification.id)}
                          >
                            <div className="notification-content">
                              <div className="notification-title">
                                <button 
                                  className={`read-marker ${notification.is_read ? 'read' : 'unread'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  title={notification.is_read ? "Read" : "Mark as read"}
                                >
                                  <FaCircle />
                                </button>
                                {notification.title}
                              </div>
                              <div className="notification-message">{notification.message}</div>
                              <div className="notification-time">{formatDate(notification.created_at)}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </li>
              <li
                className="profile-dropdown"
                ref={profileRef}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div className="profile-button" onClick={() => navigate('/profile')}>
                  {userAvatar ? (
                    <img 
                      src={getAvatarUrl(userAvatar)} 
                      alt="Profile" 
                      className="profile-avatar-small"
                      onError={(e) => {
                        console.error('Error loading avatar:', e);
                        setUserAvatar(null);
                      }}
                    />
                  ) : (
                    <div className="profile-avatar-small profile-avatar-placeholder">
                      <FaUser />
                    </div>
                  )}
                  <span className="username-display">{userName}</span>
                  {/* <FaChevronDown className="down-arrow" /> */}
                </div>
                {/* {showDropdown && (
                  <ul className="dropdown-menu">
                    <li onClick={() => navigate('/profile')}>
                      <FaUser className="dropdown-icon" />
                      <span>My Profile</span>
                    </li>
                    <li onClick={handleLogout}>
                      <FaChevronDown className="dropdown-icon" />
                      <span>Logout</span>
                    </li>
                  </ul>
                )} */}
              </li>
            </>
          )}
        </ul>
      </nav>
      <div className="nav-dashboard-bottom">
        <h1 style={{opacity: 0.5}}>{getGreeting()},&nbsp;</h1><h1>{userName || 'User'}!</h1>
      </div>
    </div>
  );
};

export default Navbar;

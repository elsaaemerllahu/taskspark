import './Navbar.css';
import logo from '../../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { FaUser, FaChevronDown } from 'react-icons/fa';

const Navbar = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const [userAvatar, setUserAvatar] = useState(null);
  const [userName, setUserName] = useState('');
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    console.log('Avatar filename:', avatarPath);
    const url = `/backend/serve-image.php?path=${encodeURIComponent(avatarPath)}`;
    console.log('Full avatar URL:', url);
    return url;
  };


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

  useEffect(() => {
    fetch('/backend/auth-status.php', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setAuthenticated(data.authenticated);
      })
      .catch(() => setAuthenticated(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/backend/logout.php', {
      credentials: 'include',
    });

    // Optional: verify logout worked
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
  const handleLogoClick = () => {
    navigate('/');  // redirect to home route
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="" className="navbar-image" />
        TaskSpark
      </div>
      <ul className="nav-links">
        <li>
          <Link to="/about">About</Link>
        </li>
        {!authenticated ? (
          <li>
            <Link to="/login">Log in</Link>
          </li>
        ) : (
          <li
            className="nav-profile-dropdown"
            ref={profileRef}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="nav-profile-button">
              {userAvatar ? (
                <img
                  src={getAvatarUrl(userAvatar)}
                  alt="Profile"
                  className="nav-profile-avatar-small"
                  onError={(e) => {
                    console.error('Error loading avatar:', e);
                    setUserAvatar(null);
                  }}
                />
              ) : (
                <div className="nav-profile-avatar-small nav-profile-avatar-placeholder">
                  <FaUser />
                </div>
              )}
              <FaChevronDown className="down-arrow" />
            </div>
            {showDropdown && (
              <ul className="nav-dropdown-menu">
                <li onClick={() => navigate('/dashboard')}>
                  <span>Dashboard</span>
                </li>
                <li onClick={handleLogout}>
                  <span>Logout</span>
                </li>
              </ul>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Sidebar.css';
import { FaHome, FaUser, FaSignOutAlt, FaMountain, FaTasks } from 'react-icons/fa';
import logo from '../../assets/logo.png';
import { FaChartSimple } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';


const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [goalsCount, setGoalsCount] = useState(0);
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
    const [authenticated, setAuthenticated] = useState(false);

  

useEffect(() => {
  const fetchTasks = async () => {
    try {
      const response = await fetch('/backend/assigned_tasks.php', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setTasks([]);
    }
  };

  fetchTasks();
}, []);



  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth <= 800);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchGoalsCount = async () => {
      try {
        const response = await fetch('/backend/goals.php', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch goals');
        }

        const data = await response.json();
        setGoalsCount(Array.isArray(data) ? data.length : 0);
      } catch (err) {
        console.error('Error fetching goals:', err);
        setGoalsCount(0);
      }
    };

    fetchGoalsCount();
  }, []);

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

  const handleLogoClick = () => {
    navigate('/');  // redirect to home route
  };

  console.log('All tasks:', tasks);
console.log('Current user:', currentUser?.username);

const myIncompleteTasks = tasks.filter(task => {
  const match = task.assigned_to === currentUser?.username && task.status === 'To Do' || task.assigned_to === currentUser?.username && task.status === 'Pending';
  return match;
});

const totalTasks = myIncompleteTasks.length;


  return (
    <motion.div
      className="sidebar"
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div className="top-section">
        {!isCollapsed ? (
          <div className='logo' onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="Logo" className="logo-img" />
            <h1 className="logo-text">TaskSpark</h1>
          </div>
        ) : (
          <img src={logo} alt="Logo" className="logo-img" />
        )}
      </div>

       <nav className="nav-links-sidebar">
        <div className="nav-links-main">
          <a href="/dashboard"><FaHome /> {!isCollapsed && <span>Home</span>}</a>
          <a href="/profile"><FaUser /> {!isCollapsed && <span>Profile</span>}</a>
          <a href="/mytasks" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaTasks />
              {!isCollapsed && <span style={{ marginLeft: 8 }}>Tasks</span>}
            </div>
            {totalTasks > 0 && <span style={{ marginLeft: isCollapsed ? 8 : 0 }}>{totalTasks}</span>}
          </a>
          <a href="/reporting"><FaChartSimple /> {!isCollapsed && <span>Reporting</span>}</a>
          <a href="/goals" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaMountain />
              {!isCollapsed && <span style={{ marginLeft: 8 }}>Goals</span>}
            </div>
            {goalsCount > 0 && <span style={{ marginLeft: isCollapsed ? 8 : 0 }}>{goalsCount}</span>}
          </a>
        </div>
      </nav>
      <div className="nav-links-bottom">
          <button onClick={handleLogout}>
            <FaSignOutAlt /> {!isCollapsed && <span>Logout</span>}</button>
        </div>
    </motion.div>
  );
};

export default Sidebar;

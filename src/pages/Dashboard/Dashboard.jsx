import { useState, useEffect } from 'react'; 
import '../Dashboard/Dashboard.css'; 
import Sidebar from '../../components/Sidebar/Sidebar';
import NavbarDashboard from '../../components/Navbar/NavbarDashboard';
import TaskList from '../../components/TaskList/TaskList';
import TimeTracker from '../../components/TimeTracker/TimeTracker';
import ActivityChart from '../../components/ActivityChart/ActivityChart'; 
import ReminderList from '../../components/Reminder/Reminder';
import AssignedTasks from '../../components/AssignedTasks/AssignedTasks'; 
import loadingGif from '../../assets/loadingIcon.gif';
const Dashboard = () => {
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 1500); // show overlay for 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* The dashboard components are always mounted and rendering */}
      <div className={`dashboard-container ${showOverlay ? 'blurred' : ''}`}>
        <Sidebar />
        <div className="dashboard-main">
          <NavbarDashboard /> 
          <section className="dashboard-grid">
            <div className="left-side">
              <TaskList />
              <div className="shared-bottom-row">
                <ReminderList/>
              </div>
            </div>
            <div className="right-side">
              <div className="chart-tracker">
                <TimeTracker />
                <ActivityChart />
              </div>
              <div className="shared-bottom-row">
                <AssignedTasks />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Overlay covers the entire screen while loading */}
      {showOverlay && (
        <div className="loading-overlay">
    <img src={loadingGif} alt="Loading..." className="loading-gif" />
        </div>
      )}
    </>
  );
};

export default Dashboard;

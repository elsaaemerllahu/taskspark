import { Doughnut } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import './ActivityChart.css';
import { useTasks } from '../../context/tasksContext';
import { useAuth } from '../../context/authContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const ActivityChart = () => {
  const [view, setView] = useState('daily');
  const [fade, setFade] = useState(false);
  const [activityData, setActivityData] = useState({
    weekly: null,
    daily: null
  });
  const { tasks } = useTasks();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const { currentUser } = useAuth();
const [windowWidth, setWindowWidth] = useState(window.innerWidth);

useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

  useEffect(() => {
    const calculateActivityData = async () => {
      if (!currentUser) return;

      try {
        // Get current date info
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));

        // Fetch working hours from backend
        const hoursResponse = await fetch('/backend/working-hours.php', {
          credentials: 'include'
        });
        const hoursData = await hoursResponse.json();

        // Fetch assigned tasks
        const tasksResponse = await fetch('/backend/assigned_tasks.php', {
          credentials: 'include'
        });
        const tasksData = await tasksResponse.json();
        setAssignedTasks(tasksData);
        // Calculate daily and weekly hours
        const dailyHours = hoursData
          .filter(entry => new Date(entry.date) >= startOfDay)
          .reduce((sum, entry) => sum + parseFloat(entry.hours), 0);

        const weeklyHours = hoursData
          .filter(entry => new Date(entry.date) >= startOfWeek)
          .reduce((sum, entry) => sum + parseFloat(entry.hours), 0);

        // Calculate completed tasks for current user
        const userTasks = tasksData.filter(task => task.assigned_to === currentUser.username);
        const weeklyCompletedTasks = userTasks.filter(task => 
          (task.status === 'Completed' || task.status === 'Done') && 
          new Date(task.due_date) >= startOfWeek
        );
        const dailyCompletedTasks = userTasks.filter(task => 
          (task.status === 'Completed' || task.status === 'Done') && 
          new Date(task.due_date) >= startOfDay
        );

        // For debugging
        console.log('Current user:', currentUser);
        console.log('Current user tasks:', userTasks);
        console.log('Weekly completed tasks:', weeklyCompletedTasks);
        console.log('Daily completed tasks:', dailyCompletedTasks);

        // Fetch goals data for current user
        const goalsResponse = await fetch(`/backend/goals.php?userId=${currentUser.id}`, {
          credentials: 'include'
        });
        const goalsData = await goalsResponse.json();
        
        // Filter completed goals for current user
        const completedGoals = goalsData.filter(goal => 
          goal.status === 'Completed' && goal.user_id === currentUser.id
        );
        const weeklyCompletedGoals = completedGoals.filter(goal => 
          new Date(goal.updated_at) >= startOfWeek
        );
        const dailyCompletedGoals = completedGoals.filter(goal => 
          new Date(goal.updated_at) >= startOfDay
        );

        // For debugging goals
        console.log('All goals for user:', goalsData);
        console.log('Completed goals for user:', completedGoals);
        console.log('Weekly completed goals:', weeklyCompletedGoals);
        console.log('Daily completed goals:', dailyCompletedGoals);

        setActivityData({
          weekly: [
            { 
              label: 'Working hours', 
              current: Math.round(weeklyHours * 10) / 10, 
              total: 40, 
              color: '#cf79c4', 
              size: 160 
            },
            { 
              label: 'Tasks completed', 
              current: weeklyCompletedTasks.length, 
              total: userTasks.length || 1,
              color: '#79a2cf', 
              size: 100 
            },
            { 
              label: 'Goals completed', 
              current: completedGoals.length,
              total: Math.max(goalsData.length, 7), 
              color: '#efc85c', 
              size: 60 
            },
          ],
          daily: [
            { 
              label: 'Working hours', 
              current: Math.round(dailyHours * 10) / 10, 
              total: 8, 
              color: '#cf79c4', 
              size: 160 
            },
            { 
              label: 'Tasks completed', 
              current: dailyCompletedTasks.length, 
              total: userTasks.length || 1,
              color: '#79a2cf', 
              size: 100 
            },
            { 
              label: 'Goals completed', 
              current: dailyCompletedGoals.length,
              total: Math.max(completedGoals.length, 1), 
              color: '#efc85c', 
              size: 60 
            },
          ]
        });
      } catch (error) {
        console.error('Error fetching activity data:', error);
        // Fallback to default data if fetch fails
        setActivityData({
          weekly: [
            { label: 'Working hours', current: 0, total: 40, color: '#cf79c4', size: 160 },
            { label: 'Tasks completed', current: 0, total: 12, color: '#79a2cf', size: 100 },
            { label: 'Goals completed', current: 0, total: 7, color: '#efc85c', size: 60 },
          ],
          daily: [
            { label: 'Working hours', current: 0, total: 8, color: '#cf79c4', size: 160 },
            { label: 'Tasks completed', current: 0, total: 3, color: '#79a2cf', size: 100 },
            { label: 'Goals completed', current: 0, total: 1, color: '#efc85c', size: 60 },
          ]
        });
      }
    };

    calculateActivityData();
    // Set up an interval to refresh data every 5 minutes
    const intervalId = setInterval(calculateActivityData, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [tasks, currentUser]);

  const handleToggle = (newView) => {
    setFade(true);
    setTimeout(() => {
      setView(newView);
      setFade(false);
    }, 300);
  };

  const rings = activityData[view] || [];

  return (
    <div className="activity-chart">
      <div className="activity-header">
        <h3>Activity</h3>
        <div className="activity-toggle">
          <span
            className={view === 'daily' ? 'active' : ''}
            onClick={() => handleToggle('daily')}          
          >
                {windowWidth < 1025 ? 'd' : 'daily'}

          </span>
          <span
            className={view === 'weekly' ? 'active' : ''}
            onClick={() => handleToggle('weekly')}          
          >
                {windowWidth < 1025 ? 'w' : 'weekly'}

          </span>
        </div>
      </div>

      <div className={`activity-content ${fade ? 'fade-out' : ''}`}>
        <div className="activity-details">
          {rings.map(({ label, current, total, color }) => (
            <div key={label} className="activity-item">
              <div className="activity-label" style={{ color }}>
                {label}
              </div>
              <div className="activity-numbers">
                <span className="current-count">{current}</span>
                <span className="total-count">/{total}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="donut-wrapper">
          {rings.map((ring, index) => (
            <div
              className="donut-layer"
              key={index}
              style={{
                width: `${ring.size}px`,
                height: `${ring.size}px`,
                zIndex: rings.length - index,
              }}
            >
              <Doughnut
                data={{
                  labels: [ring.label, 'Remaining'],
                  datasets: [
                    {
                      data: [ring.current, ring.total - ring.current],
                      backgroundColor: [ring.color, '#d1d1d1'],
                      borderWidth: 0,
                      cutout: '80%',
                    },
                  ],
                }}
                options={{
                  responsive: false,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false },
                  },
                  animation: false,
                }}
                width={ring.size}
                height={ring.size}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;

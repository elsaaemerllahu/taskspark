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
  const [fade, setFade] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const { tasks } = useTasks();
  const [assignedTasks, setAssignedTasks] = useState([]);
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
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));

        const hoursResponse = await fetch('/backend/working-hours.php', {
          credentials: 'include'
        });
        const hoursData = await hoursResponse.json();

        const tasksResponse = await fetch('/backend/assigned_tasks.php', {
          credentials: 'include'
        });
        const tasksData = await tasksResponse.json();
        setAssignedTasks(tasksData);

        const dailyHours = hoursData
          .filter(entry => new Date(entry.date) >= startOfDay && entry.bonus !== 1)
          .reduce((sum, entry) => sum + parseFloat(entry.hours), 0);

        const userTasks = tasksData.filter(task => task.assigned_to.toLowerCase() === currentUser.username.toLowerCase());
        const dailyCompletedTasks = userTasks.filter(task =>
          (task.status === 'Done' || task.status === 'Completed')
        );

        const goalsResponse = await fetch(`/backend/goals.php?userId=${currentUser.id}`, {
          credentials: 'include'
        });
        const goalsData = await goalsResponse.json();

        const dailyCompletedGoals = goalsData.filter(goal =>
          goal.status === 'Completed' && goal.user_id === currentUser.id && new Date(goal.updated_at) >= startOfDay
        );

        setActivityData([
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
            total: userTasks.length,
            color: '#79a2cf',
            size: 100
          },
          {
            label: 'Goals completed',
            current: dailyCompletedGoals.length,
            total: goalsData.length,
            color: '#efc85c',
            size: 60
          }
        ]);
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setActivityData([
          { label: 'Working hours', current: 0, total: 8, color: '#cf79c4', size: 160 },
          { label: 'Tasks completed', current: 0, total: 3, color: '#79a2cf', size: 100 },
          { label: 'Goals completed', current: 0, total: 1, color: '#efc85c', size: 60 },
        ]);
      }
    };

    calculateActivityData();
    const intervalId = setInterval(calculateActivityData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [tasks, currentUser]);

  return (
    <div className="activity-chart">
      <div className="activity-header">
        <h3>Activity</h3>
      </div>

      <div className={`activity-content ${fade ? 'fade-out' : ''}`}>
        <div className="activity-details">
          {activityData.map(({ label, current, total, color }) => (
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
          {activityData.map((ring, index) => (
            <div
              className="donut-layer"
              key={index}
              style={{
                width: `${ring.size}px`,
                height: `${ring.size}px`,
                zIndex: activityData.length - index,
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

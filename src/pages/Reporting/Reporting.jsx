import { useState, useEffect } from 'react';
import './Reporting.css';
import { useAuth } from '../../context/authContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { FaPlus, FaTrash, FaClock, FaTasks, FaMountain } from 'react-icons/fa';

const Reporting = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDateRange, setFilterDateRange] = useState('week'); // week, month, year
  const [filterAssignee, setFilterAssignee] = useState('');
  const { currentUser } = useAuth();
  const [workingHours, setWorkingHours] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [goals, setGoals] = useState([]);
  const [showBonusAlert, setShowBonusAlert] = useState(false);
  const [pendingBonusData, setPendingBonusData] = useState(null);

  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: '',
    task_id: '',
    goal_id: ''
  });

  const COLORS = ['#79a2cf', '#e85a95', '#F59E0B', '#EF4444'];

  const calculateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'Completed' || task.status === 'Done').length;
    const pending = tasks.filter(task => task.status === 'Pending' || task.status === 'To Do').length;
    const completionRate = total ? ((completed / total) * 100).toFixed(1) : 0;

    const tasksByAssignee = tasks.reduce((acc, task) => {
      acc[task.assigned_to] = (acc[task.assigned_to] || 0) + 1;
      return acc;
    }, {});

    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      completed,
      pending,
      completionRate,
      tasksByAssignee,
      tasksByStatus
    };
  };

  const stats = calculateStats();

  const statusData = [
    { name: 'Completed', value: stats.completed },
    { name: 'Pending', value: stats.pending }
  ];

  const assigneeData = Object.entries(stats.tasksByAssignee).map(([name, value]) => ({
    name,
    tasks: value
  }));


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let url = '/backend/assigned_tasks.php';
        if (filterAssignee) {
          url += `?assigned_to=${encodeURIComponent(filterAssignee)}`;
        }

        const response = await fetch(url, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();

        // Filter tasks based on date range
        const now = new Date();
        const filteredData = data.filter(task => {
          const taskDate = new Date(task.due_date);
          if (filterDateRange === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return taskDate >= weekAgo;
          } else if (filterDateRange === 'month') {
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return taskDate >= monthAgo;
          } else if (filterDateRange === 'year') {
            const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return taskDate >= yearAgo;
          }
          return true;
        });

        setTasks(filteredData);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [filterDateRange, filterAssignee]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        // Fetch working hours
        const hoursResponse = await fetch('/backend/working-hours.php', {
          credentials: 'include'
        });
        const hoursData = await hoursResponse.json();
        setWorkingHours(hoursData);

        // Fetch goals
        const goalsResponse = await fetch('/backend/goals.php', {
          credentials: 'include'
        });
        const goalsData = await goalsResponse.json();
        setGoals(goalsData);

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const pieTooltipFormatter = (value, name) => {
    return [`${value} Tasks`, name];
  };

  // Custom tooltip formatter for the bar chart
  const barTooltipFormatter = (value) => {
    return [`${value} Tasks`];
  };

  if (!currentUser) {
    return (

      <h1></h1>
    );
  }

  if (loading) {
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
  const handleAddEntry = async (e) => {
    e.preventDefault();

    const entryDate = newEntry.date;
    const newHours = parseFloat(newEntry.hours);

    if (isNaN(newHours) || newHours <= 0) {
      setError('Please enter a valid number of hours.');
      return;
    }

    const totalHoursForDate = workingHours
      .filter(entry => entry.date === entryDate)
      .reduce((sum, entry) => sum + Number(entry.hours), 0);

    const remainingRegular = Math.max(0, 8 - totalHoursForDate);

    let entryToSend = { ...newEntry };

    if (newHours <= remainingRegular) {
      entryToSend.bonus = false;
      await submitEntry(entryToSend);
    } else {
      setPendingBonusData({ entryToSend, entryDate, newHours, remainingRegular, totalHoursForDate });
      setShowBonusAlert(true);
      setShowAddModal(false);
      return;
    }

    try {
      const response = await fetch('/backend/working-hours.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(entryToSend)
      });

      if (!response.ok) {
        throw new Error('Failed to add entry');
      }

      const data = await response.json();
      setWorkingHours(prev => [data, ...prev]);
      setShowAddModal(false);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        hours: '',
        task_id: '',
        goal_id: ''
      });
      setError(null);
    } catch (err) {
      setError('Failed to add entry. Please try again.');
    }
  };
  const submitEntry = async (entryData) => {
    const response = await fetch('/backend/working-hours.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(entryData)
    });

    if (!response.ok) throw new Error('Failed to add entry');
    const data = await response.json();
    setWorkingHours(prev => [data, ...prev]);
  };

  const handleDeleteEntry = async (id) => {

    try {
      const response = await fetch(`/backend/working-hours.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      setWorkingHours(workingHours.filter(entry => entry.id !== id));
    } catch (err) {
      setError('Failed to delete entry. Please try again.');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content-reporting">
        <div className="reporting">
          <div className="reporting-header">
            <h1>Reports & Analytics</h1>
          </div>
          <div className="reporting-filters">
            <div className='search-container'>
              <div className="search-input-navbar-wrapper" style={{ backgroundColor: '#fff' }}>
                <input
                  type="text"
                  placeholder="Filter by assignee name"
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="search-input-navbar"
                />
              </div>
            </div>

            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className="date-range-filter"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>



          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="reporting-stats">
            <div className="stat-card">
              <h3>Total Tasks</h3>
              <div className="stat-number">{stats.total}</div>
            </div>
            <div className="stat-card">
              <h3>Completed Tasks</h3>
              <div className="stat-number">{stats.completed}</div>
            </div>
            <div className="stat-card">
              <h3>Pending Tasks</h3>
              <div className="stat-number">{stats.pending}</div>
            </div>
            <div className="stat-card">
              <h3>Completion Rate</h3>
              <div className="stat-number">{stats.completionRate}%</div>
            </div>
          </div>


          <div className="reporting-container">
            <div className="reporting-header">
              <div>
                <h1>Time Tracking</h1>
                <p className="subtitle">Log and track your working hours</p>
              </div>
              <button
                className="add-entry-btn"
                onClick={() => setShowAddModal(true)}
                title="Log Hours">
                <FaPlus className='add-entry-icon' />
              </button>
            </div>

            <div className="hours-list">
              {workingHours.map(entry => (
                <div key={entry.id} className="hours-entry">
                  <div className="entry-header">
                    <div className="entry-date">
                      <FaClock />
                      <span>{formatDate(entry.date)}</span>
                    </div>
                    <div className='entry-actions'>
                      <div className={`entry-hours ${entry.bonus ? 'bonus-hours' : ''}`}>
                        {entry.hours} {entry.bonus ? 'bonus ' : ''}hours
                      </div>

                      <button
                        className="delete-entry"
                        onClick={() => handleDeleteEntry(entry.id)}
                        title="Delete Entry"
                      >
                        <FaTrash />
                      </button>
                    </div>

                  </div>
                  {(entry.task_title || entry.goal_title) && (
                    <div className="entry-references">
                      {entry.task_title && (
                        <span className="reference task">
                          <FaTasks />
                          {entry.task_title}
                        </span>
                      )}
                      {entry.goal_title && (
                        <span className="reference goal">
                          <FaMountain />
                          {entry.goal_title}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {workingHours.length === 0 && !loading && (
                <div className="no-entries">No working hours logged yet</div>
              )}

            </div>
            {showAddModal && (
              <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <button
                    className="modal-close-btn"
                    onClick={() => setShowAddModal(false)}
                    aria-label="Close modal"
                    type="button"
                  >
                    ×
                  </button>
                  <h2>Log Working Hours</h2>
                  <form onSubmit={handleAddEntry}>
                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        value={newEntry.date}
                        onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Hours Worked</label>
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={newEntry.hours}
                        onChange={e => setNewEntry({ ...newEntry, hours: e.target.value })}
                        placeholder="Enter hours worked"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Related Task (Optional)</label>
                      <select
                        value={newEntry.task_id}
                        onChange={e => setNewEntry({ ...newEntry, task_id: e.target.value })}
                        className="task-select"
                      >
                        <option value="">Select a task</option>
                        {tasks.map(task => (
                          <option key={task.id} value={task.id}>
                            {task.title} {task.done ? '(Completed)' : '(In Progress)'}
                          </option>
                        ))}
                        {tasks.length === 0 && (
                          <option value="" disabled>No tasks available</option>
                        )}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Related Goal (Optional)</label>
                      <select
                        value={newEntry.goal_id}
                        onChange={e => setNewEntry({ ...newEntry, goal_id: e.target.value })}
                      >
                        <option value="">Select a goal</option>
                        {goals.map(goal => (
                          <option key={goal.id} value={goal.id}>
                            {goal.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="modal-buttons">
                      <button type="submit" className='assign-task-btn'>Save</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="reporting-charts">
            <div className="chart-container">
              <h3>Task Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#efc85c"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={pieTooltipFormatter} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Tasks by Team Member</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={assigneeData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    formatter={barTooltipFormatter}
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="tasks"
                    fill={COLORS[0]}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                    name="Tasks"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      {showBonusAlert && pendingBonusData && (
  <div
    className="custom-confirm-overlay"
    onClick={(e) => {
      // Close modal if user clicks on the overlay itself, not inside the box
      if (e.target.classList.contains('custom-confirm-overlay')) {
        setShowBonusAlert(false);
        setPendingBonusData(null);
      }
    }}
  >
    <div className="custom-confirm-box">
      <p>
        You have {pendingBonusData.totalHoursForDate} hours logged for {pendingBonusData.entryDate}.<br />
        Logging {pendingBonusData.newHours} more will exceed 8 hours.<br />
        Do you want to log {pendingBonusData.newHours - pendingBonusData.remainingRegular} hours as bonus?
      </p>
      <div className="custom-confirm-buttons">
        <button
          onClick={async () => {
            setShowBonusAlert(false);
            if (pendingBonusData.remainingRegular > 0) {
              const regularEntry = {
                ...pendingBonusData.entryToSend,
                hours: pendingBonusData.remainingRegular,
                bonus: false
              };
              await submitEntry(regularEntry);
            }
            const bonusEntry = {
              ...pendingBonusData.entryToSend,
              hours: pendingBonusData.newHours - pendingBonusData.remainingRegular,
              bonus: true
            };
            await submitEntry(bonusEntry);
            setPendingBonusData(null);
            setShowAddModal(false);
            setNewEntry({
              date: new Date().toISOString().split('T')[0],
              hours: '',
              task_id: '',
              goal_id: ''
            });
            setError(null);
          }}
        >
          Yes
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default Reporting; 
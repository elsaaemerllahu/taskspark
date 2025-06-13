import React, { useState, useEffect } from 'react';
import './Goals.css';
import { useAuth } from '../../context/authContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import { FaPlus, FaTrash, FaCheck, FaFilter, FaSearch, FaCalendarAlt, FaTimes } from 'react-icons/fa';

const Goals = () => {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
const [goalToDelete, setGoalToDelete] = useState(null);

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    status: 'In Progress'
  });

  const stats = {
    total: goals.length,
    completed: goals.filter(goal => goal.status === 'Completed').length,
    highPriority: goals.filter(goal => goal.priority === 'high').length,
    upcoming: goals.filter(goal => {
      const deadline = new Date(goal.target_date);
      const today = new Date();
      const diffTime = deadline - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && goal.status !== 'Completed';
    }).length
  };

  // Filter and sort goals
  const filteredGoals = goals.filter(goal => {
    const matchesPriority = filterPriority === 'all' || goal.priority === filterPriority;
    const matchesSearch = goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goal.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPriority && matchesSearch;
  }).sort((a, b) => {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.target_date) - new Date(b.target_date);
  });

  const formatDueDate = (date) => {
    const dueDate = new Date(date);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };
  useEffect(() => {
    const fetchGoals = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/backend/goals.php', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch goals');
        }

        const data = await response.json();
        setGoals(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching goals:', err);
        setError('Failed to load goals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [currentUser]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/backend/goals.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newGoal)
      });

      if (!response.ok) {
        throw new Error('Failed to add goal');
      }

      const data = await response.json();
      setGoals([...goals, data]);
      setShowAddModal(false);
      setNewGoal({
        title: '',
        description: '',
        target_date: '',
        priority: 'medium',
        status: 'In Progress'
      });
    } catch (err) {
      setError('Failed to add goal. Please try again.');
    }
  };

  const handleStatusToggle = async (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    const newStatus = goal.status === 'Completed' ? 'In Progress' : 'Completed';

    try {
      const response = await fetch(`/backend/goals.php?id=${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update goal status');
      }

      setGoals(goals.map(g =>
        g.id === goalId ? { ...g, status: newStatus } : g
      ));
    } catch (err) {
      setError('Failed to update goal status. Please try again.');
    }
  };

const handleDeleteClick = (goalId) => {
  setGoalToDelete(goalId);
  setShowDeleteModal(true);
};
const handleConfirmDelete = async () => {
  try {
    const response = await fetch(`/backend/goals.php?id=${goalToDelete}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to delete goal');
    }

    setGoals(goals.filter(g => g.id !== goalToDelete));
    setShowDeleteModal(false);
    setGoalToDelete(null);
  } catch (err) {
    setError('Failed to delete goal. Please try again.');
  }
};

  if (!currentUser) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content-goals">
          <div className="goals">
            <div className="goals-header">
              <h1>Please log in to view your goals</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content-goals">
          <div className="goals">
            <div className="goals-header">
              <h1>Loading goals...</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content-goals">
        <div className="goals">
          <div className="goals-header">
            <div>
              <h1>Goals</h1>
            </div>
            <button className="add-goal-btn" onClick={() => setShowAddModal(true)} style={{
              backgroundColor: 'var(--accent-color)',
              color: '#fff',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer'
            }}>
              <FaPlus />
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="goals-controls">
            <div className="search-box" style={{ backgroundColor: '#fff' }} >
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search goals"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <div className="filter-box" style={{ backgroundColor: '#fff' }} >
              <FaFilter className="filter-icon" />
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Goals</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="goals-stats">
            <div className="stat-card-goals">
              <div className="stat-number">{stats.total}</div>
              <h3>Total Goals</h3>
            </div>
            <div className="stat-card-goals">
              <div className="stat-number">{stats.completed}</div>
              <h3>Completed</h3>
              <div className="stat-subtitle">
                {stats.total ? ((stats.completed / stats.total) * 100).toFixed(0) : 0}% success rate
              </div>
            </div>
            <div className="stat-card-goals">
              <div className="stat-number">{stats.highPriority}</div>
              <h3>High Priority</h3>
            </div>
            <div className="stat-card-goals">
              <div className="stat-number">{stats.upcoming}</div>
              <h3>Due Soon</h3>
              <div className="stat-subtitle">Next 7 days</div>
            </div>
          </div>

          <div className="goals-list">
            {filteredGoals.map(goal => (
              <div
                key={goal.id}
                className={`goal-item priority-${goal.priority}`}
              >
                <div className="goal-header">
                  <div className="goal-title-section">
                    <h3>{goal.title}</h3>
                    <span className={`goal-priority-badge priority-${goal.priority}`}>
                      {goal.priority}
                    </span>
                  </div>
                  <div className="goal-actions">
                    <button
                      className={`status-toggle ${goal.status === 'Completed' ? 'completed' : ''}`}
                      onClick={() => handleStatusToggle(goal.id)}
                      title={goal.status === 'Completed' ? 'Mark as In Progress' : 'Mark as Completed'}
                    >
                      <FaCheck />
                    </button>
<button
  className="delete-goal"
  onClick={() => handleDeleteClick(goal.id)}
  title="Delete Goal"
>
  <FaTrash />
</button>

                  </div>
                </div>

                <p className="goal-description">{goal.description}</p>

                <div className="goal-footer">
                  <div className="goal-meta">
                    <span className="goal-date">
                      <FaCalendarAlt /> {formatDueDate(goal.target_date)}
                    </span>
                    <span className={`goal-status status-${goal.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {goal.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}


          </div>

          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowAddModal(false)} aria-label="Close modal"
                  type="button"
                >
                  ×
                </button>
                <h2>Add New Goal</h2>
                <form onSubmit={handleAddGoal}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={newGoal.title}
                      onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                      placeholder="Enter goal title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newGoal.description}
                      onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                      placeholder="Describe your goal"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Target Date</label>
                    <input
                      type="date"
                      value={newGoal.target_date}
                      onChange={e => setNewGoal({ ...newGoal, target_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={newGoal.priority}
                      onChange={e => setNewGoal({ ...newGoal, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="modal-buttons">
                    <button type="submit" className='assign-task-btn'>Add Goal</button>
                  </div>
                </form>
              </div>
            </div>
          )}

{showDeleteModal && (
  <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
    <div className="modal" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Close modal"
              type="button"
            >
              ×
            </button>
      <p>Are you sure you want to delete this goal?</p>
      <div className="modal-buttons">
        <button onClick={handleConfirmDelete} className='assign-task-btn'>Delete</button>
      </div>
    </div>
  </div>
)}


        </div>
      </div>
    </div>
  );
};

export default Goals; 
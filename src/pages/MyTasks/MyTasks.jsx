import { useState, useEffect } from 'react';
import './MyTasks.css';
import { useAuth } from '../../context/authContext';
import Sidebar from '../../components/Sidebar/Sidebar';

const MyTasks = () => {
  const { currentUser } = useAuth();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchAssignedTasks = async () => {
      try {
        const response = await fetch('/backend/assigned_tasks.php', {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setAssignedTasks(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedTasks();
  }, [currentUser]);

  // Group tasks by status
  const tasksByStatus = {
    todo: assignedTasks.filter(task => task.status === 'To Do' || task.status === 'Pending'),
    inProgress: assignedTasks.filter(task => task.status === 'In Progress'),
    inReview: assignedTasks.filter(task => task.status === 'In Review'),
    done: assignedTasks.filter(task => task.status === 'Done' || task.status === 'Completed')
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const taskToUpdate = assignedTasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    try {
      // Optimistically update the UI first
      setAssignedTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      const response = await fetch(`/backend/assigned_tasks.php?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...taskToUpdate,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

    } catch (err) {
      console.error('Error updating task:', err);
      setError(err.message);
      // Revert the optimistic update if the API call fails
      setAssignedTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, status: taskToUpdate.status } : task
        )
      );
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || 'U';
  };

  const renderTask = (task) => (
    <div
      key={task.id}
      className={`my-task-item ${task.assigned_to === currentUser?.username ? 'my-task' : ''}`}
      draggable="true"
      onDragStart={(e) => {
        console.log('Drag started:', task.id, task.status);
        e.dataTransfer.setData('text/plain', JSON.stringify({
          taskId: task.id,
          currentStatus: task.status
        }));
      }}
    >
      <div className="my-task-header">
        <div className="my-task-title">{task.title}</div>
      </div>
      <div className="my-task-footer">
        <div className="my-task-assignee">
          <div className="assignee-avatar">
            {getInitials(task.assigned_to)}
          </div>
          <span className="assignee-name">{task.assigned_to}</span>
        </div>
        <div className="my-task-date">
          {new Date(task.due_date).toLocaleDateString()}
        </div>
      </div>
    </div>
  );

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const taskId = data.taskId;
      const currentStatus = data.currentStatus;

      console.log('Drop event:', { taskId, currentStatus, newStatus });

      if (currentStatus !== newStatus) {
        await handleStatusChange(taskId, newStatus);
      }
    } catch (err) {
      console.error('Error in drop handler:', err);
    }
  };

  const renderColumn = (title, tasks, status, color) => (
    <div
      className={`kanban-column column-${status.toLowerCase().replace(/\s+/g, '-')}`}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove('drag-over');
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        handleDrop(e, status);
      }}
    >
      <div className="column-header">
        <div className="column-title" style={{ color }}>
          {title}
          <span className="column-count">{tasks.length}</span>
        </div>
      </div>
      <div className="my-tasks-list">
        {tasks.map(renderTask)}
        {tasks.length === 0 && (
          <div className="empty-column-message">
          </div>
        )}
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div style={{ width: '100%' }}>
        <h1></h1>
      </div>
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

  return (
    <div className="app-container">
      <Sidebar />
      <div style={{ width: '100%' }}>
        <div className="main-content-my-tasks">
          <div className="my-tasks">
            <div className="my-tasks-header">
              <h1>Assigned Tasks</h1>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="kanban-board">
              {renderColumn('To Do', tasksByStatus.todo, 'To Do', '#666')}
              {renderColumn('In Progress', tasksByStatus.inProgress, 'In Progress', '#3478F6')}
              {renderColumn('In Review', tasksByStatus.inReview, 'In Review', '#FF69B4')}
              {renderColumn('Done', tasksByStatus.done, 'Done', '#4CAF50')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;

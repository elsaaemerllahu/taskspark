import React, { useState, useEffect } from 'react';
import './AssignTaskModal.css';

const EditTaskModal = ({ task, onClose, onTaskUpdated }) => {
  const [title, setTitle] = useState(task.title);
  const [assignedTo, setAssignedTo] = useState(task.assigned_to);
  const [dueDate, setDueDate] = useState(task.due_date);
  const [status, setStatus] = useState(task.status);
  const [users, setUsers] = useState([]);
    const [filterAssignee, setFilterAssignee] = useState('');
      const [assignedTasks, setAssignedTasks] = useState([]);


  useEffect(() => {
    fetch('/backend/get_users.php')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err));
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatedTask = {
      title,
      assigned_to: assignedTo,
      due_date: dueDate,
      status,
    };

    const res = await fetch(`/backend/assigned_tasks.php?id=${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });

    if (res.ok) {
      onTaskUpdated();
      onClose();
    } else {
      alert('Failed to update task.');
    }
  };
    const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await fetch(`/backend/assigned_tasks.php?id=${id}`, { 
        method: 'DELETE',
        credentials: 'include'
      });
      fetchTasks();
    }
  };

    const fetchTasks = () => {
    const url = filterAssignee ? `/backend/assigned_tasks.php?assigned_to=${encodeURIComponent(filterAssignee)}` : '/backend/assigned_tasks.php';

    fetch(url, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setAssignedTasks(data))
      .catch(err => console.error('Failed to fetch tasks:', err));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          ×
        </button>
        <h2>Edit Task</h2>
        <form onSubmit={handleUpdate}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Task Title"
          />
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
          >
            <option value="">Select assignee</option>
            {users.map(user => (
              <option key={user.id} value={user.username}>
                {user.username}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>Pending</option>
            <option>Completed</option>
          </select>
          <div className="modal-buttons">
            <button type="submit" className="update">Update</button>
            <button onClick={() => handleDelete(task.id)} className="update">Delete</button>

          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;

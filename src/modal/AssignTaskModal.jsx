import React, { useState, useEffect } from 'react';
import './AssignTaskModal.css';

const AssignTaskModal = ({ onClose, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/backend/get_users.php')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newTask = {
      title,
      assigned_to: assignedTo,
      due_date: dueDate
    };

    const res = await fetch('/backend/assigned_tasks.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });

    if (res.ok) {
      onTaskAdded();
      onClose();
    } else {
      alert('Failed to assign task');
    }
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
        <h2>Assign New Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
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
          <div className="modal-buttons-assign">
          <button type="submit">Assign</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTaskModal;

import { useState, useEffect, useRef } from 'react';
import './TaskList.css';
import { useAuth } from '../../context/authContext.jsx';

const TaskList = ({ onLoadComplete }) => {
  const [tasks, setTasks] = useState([]);
  console.log('Current tasks state:', tasks);
  const [newTaskText, setNewTaskText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const editableRef = useRef(null);
  const { currentUser } = useAuth();

  const backendURL = '/backend/tasks.php';

  useEffect(() => {
    if (!currentUser) return;
        if (onLoadComplete) onLoadComplete('reminderList'); // ✅ Add this


    fetch(`${backendURL}?userId=${currentUser.id}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        console.log('Fetched tasks:', data);
        setTasks(Array.isArray(data) ? data : []);
        if (onLoadComplete) onLoadComplete('taskList');

      })

      .catch(err => console.error('Fetch tasks failed', err));
  }, [currentUser]);

  const toggleTask = async (id) => {
    if (!currentUser) return;

    const updatedTask = tasks.find(task => task.id === id);
    const updatedDone = !updatedTask.done;

    try {
      const response = await fetch(backendURL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, done: updatedDone, type: 'toggle' })
      });

      const data = await response.json();
      if (data.success) {
        setTasks(tasks.map(task =>
          task.id === id ? { ...task, done: updatedDone } : task
        ));
      }
    } catch (err) {
      console.error('Failed to update task status', err);
    }
  };

  const handleKeyDown = (e, taskId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        e.target.textContent = task.text;
      }
      e.target.blur();
    }
  };

  const startEditing = (taskId) => {
    setEditingTaskId(taskId);
  };

  const updateTaskText = async (id, newText) => {
    if (!currentUser) return;
   const trimmedText = newText.trim();

  if (trimmedText === '') {
    await deleteTask(id); // Delete task if empty
    return;
  }
    try {
      const response = await fetch(backendURL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id,
          text: newText.trim(),
          type: 'edit'
        })
      });

      const data = await response.json();
      if (data.success) {
        setTasks(tasks.map(task =>
          task.id === id ? { ...task, text: newText.trim() } : task
        ));
      }
    } catch (err) {
      console.error('Failed to update task text', err);
      // Revert the text if update failed
      const task = tasks.find(t => t.id === id);
      if (task && editableRef.current) {
        editableRef.current.textContent = task.text;
      }
    } finally {
      setEditingTaskId(null);
    }
  };

  const addTask = async () => {
    if (!newTaskText.trim()) return;
    if (!currentUser) {
      console.error("User not logged in");
      return;
    }

    const newTask = { text: newTaskText, userId: currentUser.id };

    try {
      const res = await fetch(backendURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTask)
      });

      const createdTask = await res.json();
      if (!createdTask.error) {
        setTasks([...tasks, createdTask]);
        setNewTaskText('');
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to add task', error);
    }
  };

  const deleteTask = async (id) => {
  if (!currentUser) return;

  try {
    const response = await fetch(backendURL, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id })
    });

    const data = await response.json();
    if (data.success) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  } catch (err) {
    console.error('Failed to delete task', err);
  }
};


  if (!currentUser) {
    return (
      <div className="tasklist" data-theme="light">
        <div className="tasklist-header">Please log in to view your tasks</div>
      </div>
    );
  }

  return (
    <>
      <div className="tasklist" data-theme="light">
        <div className="tasklist-header">To-do List</div>

        <button className="tasklist-create" onClick={() => setShowModal(true)}>
          + Create new
        </button>

        <ul className="tasklist-items">
          {tasks.map(task => (
            <li key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
                id={`task-${task.id}`}
                className="task-checkbox"
              />

              <div
                ref={editingTaskId === task.id ? editableRef : null}
                className={`task-text-input ${editingTaskId === task.id ? 'editing' : ''}`}
                contentEditable={editingTaskId === task.id}
                suppressContentEditableWarning={true}
                onClick={() => startEditing(task.id)}
                onBlur={e => updateTaskText(task.id, e.currentTarget.textContent)}
                onKeyDown={e => handleKeyDown(e, task.id)}
                tabIndex={0}
              >
                {task.text}
              </div>
            </li>

          ))}
        </ul>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button
              className="modal-close-btn"
              onClick={() => setShowModal(false)}
              aria-label="Close modal"
              type="button"
            >
              ×
            </button>
            <h3>Add New Task</h3>
            <input
              type="text"
              placeholder="Task description"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTask();
                }
              }}
            />
            <div className="modal-buttons">
              <button onClick={addTask}>Add</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskList;

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/authContext';
import './Reminder.css';

const ReminderList = () => {
  const initialReminders = [];
  const [reminders, setReminders] = useState(initialReminders);
  const [newReminder, setNewReminder] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const editableRef = useRef(null);
  const { currentUser } = useAuth();

  const backendURL = '/backend/reminders.php';

  useEffect(() => {
    if (!currentUser) return;

    fetch(backendURL, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setReminders(data);
        }
      })
      .catch(err => console.error('Fetch reminder failed', err))
  }, [currentUser]);


  const toggleReminder = async (id) => {
    if (!currentUser) return;

    const updatedReminder = reminders.find(reminder => reminder.id === id);
    const updatedDone = !updatedReminder.done;

    try {
      const response = await fetch(backendURL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, done: updatedDone })
      });

      const data = await response.json();
      if (data.success) {
        setReminders(reminders.map(reminder =>
          reminder.id === id ? { ...reminder, done: updatedDone } : reminder
        ));
      }
    } catch (err) {
      console.error('Failed to update reminder status', err);
    }
  };

  const addReminder = async () => {
    if (!currentUser) {
      console.error("User not logged in");
      return;
    }

    if (newReminder.trim() !== '') {
      const reminder = { text: newReminder };

      try {
        const res = await fetch(backendURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(reminder)
        });

        const createdReminder = await res.json();
        if (!createdReminder.error) {
          setReminders([...reminders, createdReminder]);
          setNewReminder('');
          setShowModal(false);
        }
      } catch (error) {
        console.error('Failed to add reminder', error);
      }
    }
  };

  const updateReminderText = async (id, newText) => {
    const trimmed = newText.trim();
    if (!currentUser) return;

    if (trimmed === '') {
      await deleteReminder(id); // delete if empty
      return;
    }

    try {
      const response = await fetch(backendURL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, text: trimmed })
      });

      const data = await response.json();
      if (data.success) {
        setReminders(reminders.map(r => r.id === id ? { ...r, text: trimmed } : r));
      }
    } catch (err) {
      console.error('Failed to update reminder', err);
    } finally {
      setEditingReminderId(null);
    }
  };

  const deleteReminder = async (id) => {
    try {
      const response = await fetch(backendURL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      if (data.success) {
        setReminders(reminders.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete reminder', err);
    }
  };

  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      const reminder = reminders.find(r => r.id === id);
      if (reminder) {
        e.target.textContent = reminder.text;
      }
      e.target.blur();
    }
  };

  if (!currentUser) {
    return (
      <div className="reminderlist" data-theme="light">
        <div className="reminderlist-header"></div>
      </div>
    );
  }

  return (
    <>
      <div className="reminderlist" data-theme="light">
        <div className="reminderlist-header">Today's Reminders</div>

        <button className="reminderlist-create" onClick={() => setShowModal(true)}>
          + Add Reminder
        </button>

        <ul className="reminderlist-items">
          {reminders.map(reminder => (
            <li key={reminder.id} className={reminder.done ? 'done' : ''}>
              <input
                type="checkbox"
                checked={reminder.done}
                onChange={() => toggleReminder(reminder.id)}
              />
              <div
                ref={editingReminderId === reminder.id ? editableRef : null}

                className="reminder-text-input"
                contentEditable={editingReminderId === reminder.id}
                suppressContentEditableWarning={true}
                onBlur={e => updateReminderText(reminder.id, e.currentTarget.textContent)}
                role="textbox"
                tabIndex={0}
                onClick={() => setEditingReminderId(reminder.id)}
                onKeyDown={e => handleKeyDown(e, reminder.id)}
              >
                {reminder.text}
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
            <h3>Add Reminder</h3>
            <input
              type="text"
              placeholder="Reminder details"
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={addReminder}>Add</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReminderList;

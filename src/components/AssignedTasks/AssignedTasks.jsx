import { useState, useEffect } from 'react';
import AssignTaskModal from '../../modal/AssignTaskModal.jsx';
import EditTaskModal from '../../modal/EditTaskModal';
import './AssignedTasks.css';
import { FaPen } from 'react-icons/fa';

const AssignedTasks = () => {
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterAssignee, setFilterAssignee] = useState('');
  const [assigneeSortOrder, setAssigneeSortOrder] = useState(null);
  const [users, setUsers] = useState([]);

  const fetchUsers = () => {
    fetch('/backend/get_users.php')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err));
  };

  const fetchTasks = () => {
    const url = filterAssignee ? `/backend/assigned_tasks.php?assigned_to=${encodeURIComponent(filterAssignee)}` : '/backend/assigned_tasks.php';

    fetch(url, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setAssignedTasks(data)

      })
      .catch(err => console.error('Failed to fetch tasks:', err));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filterAssignee]);



  const openEditModal = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const sortByAssignee = () => {
    let newSortOrder = 'asc';
    if (assigneeSortOrder === 'asc') newSortOrder = 'desc';
    else if (assigneeSortOrder === 'desc') newSortOrder = null;

    setAssigneeSortOrder(newSortOrder);

    if (newSortOrder === null) {
      fetchTasks(); // reset to original unsorted data (refetch)
    } else {
      const sorted = [...assignedTasks].sort((a, b) => {
        const aName = a.assigned_to.toLowerCase();
        const bName = b.assigned_to.toLowerCase();
        if (aName < bName) return newSortOrder === 'asc' ? -1 : 1;
        if (aName > bName) return newSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
      setAssignedTasks(sorted);
    }
  };

  return (
    <>    
      <div className="assigned-tasks">
        <h3 className="assigned-tasks-header">Assigned Tasks</h3>

        <div className="assigned-tasks-controls">
          <input
            type="text"
            placeholder="Search by assignee"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="search-input"
          />
          <button onClick={() => setShowAssignModal(true)} className="assign-task-btn">Assign</button>
        </div>
        <div className="assigned-tasks-table-wrapper">
          <table className="assigned-tasks-table">
            <thead>
              <tr>
                <th>Task</th>
                <th onClick={sortByAssignee} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Assignee&nbsp;
                  {assigneeSortOrder === 'asc' && '⬆'}
                  {assigneeSortOrder === 'desc' && '⬇'}
                  {!assigneeSortOrder && '⬇'}
                </th>
                <th className='due-date-col'>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assignedTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.assigned_to}</td>
                  <td className='due-date-col'>{task.due_date}</td>
                  <td>{task.status}</td>
                  <td>
                    <button onClick={() => openEditModal(task)} className='task-action'><FaPen/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        {showAssignModal && (
        <AssignTaskModal
          onClose={() => setShowAssignModal(false)}
          onTaskAdded={fetchTasks}
        />
      )}

      {showEditModal && selectedTask && (
        <EditTaskModal
          task={selectedTask}
          onClose={() => setShowEditModal(false)}
          onTaskUpdated={fetchTasks}
        />
      )}
    </>
  );
};

export default AssignedTasks;
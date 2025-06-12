// context/tasksContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const TasksContext = createContext();

export const TasksProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/backend/assigned_tasks.php', {
          credentials: 'include',
        });
        const data = await response.json();
        setTasks(data); // Make sure you're setting correct task list
      } catch (error) {
        console.error('Error fetching tasks in context:', error);
      }
    };

    fetchTasks();
  }, []);

  return (
    <TasksContext.Provider value={{ tasks, setTasks }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => useContext(TasksContext);

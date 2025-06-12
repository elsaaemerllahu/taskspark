import { useState, useEffect, useRef } from 'react';
import './TimeTracker.css';
import { FaPlay, FaPause, FaStop } from 'react-icons/fa';


const TimeTracker = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  return (
    <div className="timetracker">
      <h3 className="timetracker-header">Time Tracker</h3>

      <div className="timetracker-display">
        <div className="timetracker-time" aria-live="polite" aria-atomic="true">
          {formatTime(time)}
        </div>
      </div>
      <div className="timetracker-controls">
        <button
          className="control-btn start-stop"
          onClick={() => setIsRunning(!isRunning)}
          aria-label={isRunning ? "Pause timer" : "Start timer"}
          title={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? <FaPause /> : <FaPlay />}
        </button>
        <button
          className="control-btn reset"
          onClick={() => {
            setIsRunning(false);
            setTime(0);
          }}
          aria-label="Stop timer and reset"
          title="Stop timer and reset"
        >
          <FaStop />
        </button>

      </div>
    </div>
  );
};

export default TimeTracker;

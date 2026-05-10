import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://YOUR_PUBLIC_IP:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // New UI states
  const [filter, setFilter] = useState('all'); // all, active, completed
  const [sort, setSort] = useState('newest'); // newest, oldest
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await axios.post(API_URL, { title, description });
      fetchTasks();
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const toggleComplete = async (id, currentStatus) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !currentStatus });
      setTasks(tasks.map((task) => (task._id === id ? res.data : task)));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const res = await axios.put(`${API_URL}/${id}`, { title: editTitle, description: editDesc });
      setTasks(tasks.map((task) => (task._id === id ? res.data : task)));
      setEditingId(null);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  }

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDesc(task.description);
  }

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Derived state
  const completedTasks = tasks.filter(t => t.completed);
  const activeTasks = tasks.filter(t => !t.completed);

  let displayedTasks = [...tasks];
  if (filter === 'active') displayedTasks = activeTasks;
  if (filter === 'completed') displayedTasks = completedTasks;

  if (sort === 'oldest') {
    displayedTasks.reverse();
  }

  return (
    <div className="container">
      <header className="header">
        <h1>Taskflow</h1>
        <p>Organize your work, focus on what matters.</p>
      </header>

      {/* DASHBOARD STATS */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{tasks.length}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{activeTasks.length}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{completedTasks.length}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      <form className="task-form" onSubmit={addTask}>
        <div className="input-group">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <textarea
            placeholder="Optional details or context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <button type="submit">Create New Task  +</button>
      </form>

      {/* CONTROLS */}
      {tasks.length > 0 && (
        <div className="controls-row">
          <div className="filters">
            <button
              type="button"
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              type="button"
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed
            </button>
          </div>
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      )}

      <div className="task-list">
        {displayedTasks.map((task) => (
          <div className="task-item" key={task._id}>

            {editingId === task._id ? (
              <div className="task-edit-form">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="edit-input"
                  autoFocus
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="edit-textarea"
                />
                <div className="edit-actions">
                  <button type="button" onClick={() => saveEdit(task._id)} className="btn-save">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="btn-cancel">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="task-content">
                  <div className={`task-title ${task.completed ? 'completed' : ''}`}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div className={`task-desc ${task.completed ? 'completed' : ''}`}>
                      {task.description}
                    </div>
                  )}
                  {task.createdAt && (
                    <div className="task-date">
                      {new Date(task.createdAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
                <div className="task-actions">
                  <button
                    type="button"
                    className={`btn-icon ${task.completed ? 'undo' : 'done'}`}
                    title={task.completed ? 'Undo' : 'Mark as done'}
                    onClick={() => toggleComplete(task._id, task.completed)}
                  >
                    {task.completed ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )}
                  </button>
                  {!task.completed && (
                    <button
                      type="button"
                      className="btn-icon edit"
                      title="Edit task"
                      onClick={() => startEdit(task)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-icon delete"
                    title="Delete task"
                    onClick={() => deleteTask(task._id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {tasks.length > 0 && displayedTasks.length === 0 && (
          <div className="empty-state small">
            <p>No tasks match this filter.</p>
          </div>
        )}

        {tasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </div>
            <p>You're all caught up! Create a new task above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://YOUR_PUBLIC_IP:5000/api/tasks';

/* ── SVG Icons ── */
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const IconClock = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconLogo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const IconList = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const IconDone = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconFolder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => { fetchTasks(); }, []);

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
      setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    try {
      const res = await axios.put(`${API_URL}/${id}`, { title: editTitle, description: editDesc });
      setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
      setEditingId(null);
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const completedTasks = tasks.filter(t => t.completed);
  const activeTasks    = tasks.filter(t => !t.completed);
  const progressPct    = tasks.length === 0 ? 0 : Math.round((completedTasks.length / tasks.length) * 100);

  let displayedTasks = [...tasks];
  if (filter === 'active')    displayedTasks = [...activeTasks];
  if (filter === 'completed') displayedTasks = [...completedTasks];
  if (sort === 'oldest')      displayedTasks.reverse();

  const filterLabel = { all: 'All Tasks', active: 'Active', completed: 'Completed' };

  return (
    <div className="app-layout">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <div className="brand-icon"><IconLogo /></div>
            <span className="brand-name">Taskflow</span>
          </div>
          <span className="brand-tagline">Work smarter, not harder.</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Views</div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
              <IconList />
              All Tasks
              <span className="nav-badge">{tasks.length}</span>
            </button>
            <button className={`nav-item ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
              <IconFolder />
              Active
              <span className="nav-badge">{activeTasks.length}</span>
            </button>
            <button className={`nav-item ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
              <IconDone />
              Completed
              <span className="nav-badge">{completedTasks.length}</span>
            </button>
          </nav>
        </div>

        <div className="sidebar-stats">
          <div className="sidebar-stat-row">
            <span className="s-label">Total Tasks</span>
            <span className="s-val">{tasks.length}</span>
          </div>
          <div className="sidebar-stat-row">
            <span className="s-label">Pending</span>
            <span className="s-val">{activeTasks.length}</span>
          </div>
          <div className="sidebar-stat-row">
            <span className="s-label">Completed</span>
            <span className="s-val green">{completedTasks.length}</span>
          </div>
        </div>

        <div className="sidebar-progress">
          <div className="progress-label">
            <span>Overall Progress</span>
            <span className="progress-pct">{progressPct}%</span>
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">
            <h1>{filterLabel[filter]}</h1>
            <p>
              {filter === 'all'       && `${tasks.length} task${tasks.length !== 1 ? 's' : ''} total`}
              {filter === 'active'    && `${activeTasks.length} task${activeTasks.length !== 1 ? 's' : ''} remaining`}
              {filter === 'completed' && `${completedTasks.length} task${completedTasks.length !== 1 ? 's' : ''} finished`}
            </p>
          </div>
          <div className="topbar-right">
            <div className="topbar-stat">
              <span>Pending</span>
              <strong>{activeTasks.length}</strong>
            </div>
            <div className="topbar-stat">
              <span>Done</span>
              <strong className="green">{completedTasks.length}</strong>
            </div>
          </div>
        </div>

        <div className="page-body">

          {/* Add Task */}
          <div className="add-task-card">
            <div className="add-task-header">New Task</div>
            <form className="task-form" onSubmit={addTask}>
              <div className="form-field">
                <input
                  type="text"
                  placeholder="Task title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-field">
                <textarea
                  placeholder="Add a description (optional)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-add">
                  <IconPlus />
                  Add Task
                </button>
              </div>
            </form>
          </div>

          {/* Task List Header */}
          <div className="task-section-header">
            <div>
              <span className="task-section-title">{filterLabel[filter]}</span>
              <span className="task-count-pill">{displayedTasks.length}</span>
            </div>
            <div className="controls-row">
              <div className="filter-tabs">
                {['all','active','completed'].map(f => (
                  <button
                    key={f}
                    className={`filter-btn ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>

          {/* Task List */}
          <div className="task-list">
            {displayedTasks.map((task) => (
              <div key={task._id} className={`task-item ${task.completed ? 'is-completed' : ''}`}>

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
                      placeholder="Description (optional)..."
                    />
                    <div className="edit-actions">
                      <button type="button" onClick={() => saveEdit(task._id)} className="btn-save">Save Changes</button>
                      <button type="button" onClick={() => setEditingId(null)} className="btn-cancel">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Checkbox */}
                    <div
                      className={`task-check ${task.completed ? 'checked' : ''}`}
                      onClick={() => toggleComplete(task._id, task.completed)}
                      title={task.completed ? 'Mark as pending' : 'Mark as complete'}
                    >
                      <IconCheck />
                    </div>

                    {/* Content */}
                    <div className="task-body">
                      <div className={`task-title ${task.completed ? 'completed' : ''}`}>
                        {task.title}
                      </div>
                      {task.description && (
                        <div className={`task-desc ${task.completed ? 'completed' : ''}`}>
                          {task.description}
                        </div>
                      )}
                      <div className="task-meta">
                        {task.createdAt && (
                          <span className="task-date-badge">
                            <IconClock />
                            {new Date(task.createdAt).toLocaleString(undefined, {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        )}
                        <span className={`task-status-badge ${task.completed ? 'done' : 'pending'}`}>
                          {task.completed ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="task-actions">
                      {!task.completed && (
                        <button
                          className="btn-icon edit"
                          title="Edit task"
                          onClick={() => startEdit(task)}
                        >
                          <IconEdit />
                        </button>
                      )}
                      <button
                        className="btn-icon delete"
                        title="Delete task"
                        onClick={() => deleteTask(task._id)}
                      >
                        <IconTrash />
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
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="8" y1="15" x2="11" y2="15" />
                </svg>
                <p>No tasks yet. Add one above to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

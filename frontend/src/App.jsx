import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://YOUR_PUBLIC_IP:5000/api/tasks';

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const LogoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const EmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="16" y1="2" x2="16" y2="6" />
  </svg>
);

function App() {
  const [tasks, setTasks]           = useState([]);
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter]         = useState('all');
  const [sort, setSort]             = useState('newest');
  const [editingId, setEditingId]   = useState(null);
  const [editTitle, setEditTitle]   = useState('');
  const [editDesc, setEditDesc]     = useState('');

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

  const toggleComplete = async (id, current) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !current });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDesc(task.description || '');
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) { setEditingId(null); return; }
    try {
      const res = await axios.put(`${API_URL}/${id}`, { title: editTitle, description: editDesc });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
      setEditingId(null);
    } catch (err) {
      console.error('Error saving edit:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const activeCount    = tasks.filter(t => !t.completed).length;

  let displayed = [...tasks];
  if (filter === 'active')    displayed = tasks.filter(t => !t.completed);
  if (filter === 'completed') displayed = tasks.filter(t => t.completed);
  if (sort === 'oldest')      displayed = [...displayed].reverse();

  const formatDate = (d) => new Date(d).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-brand-dot"><LogoIcon /></div>
          Taskflow
        </div>
        <div className="nav-stats">
          <span><strong>{tasks.length}</strong> Total</span>
          <span><strong>{activeCount}</strong> Pending</span>
          <span><strong style={{ color: '#16a34a' }}>{completedCount}</strong> Done</span>
        </div>
      </nav>

      {/* ── PAGE ── */}
      <div className="page">

        {/* Add Task */}
        <div className="add-card">
          <h2>New Task</h2>
          <form className="task-form" onSubmit={addTask}>
            <input
              type="text"
              placeholder="Task title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Add a description (optional)..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <div className="form-row">
              <button type="submit" className="btn-primary">
                + Add Task
              </button>
            </div>
          </form>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <span className="section-title">Tasks</span>
            <span className="count-badge">{displayed.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="filter-group">
              {['all', 'active', 'completed'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="task-list">
          {displayed.map(task => (
            <div key={task._id} className={`task-card ${task.completed ? 'done' : ''}`}>

              {editingId === task._id ? (
                <div className="edit-form">
                  <input
                    className="edit-input"
                    type="text"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    autoFocus
                  />
                  <textarea
                    className="edit-textarea"
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    placeholder="Description (optional)..."
                  />
                  <div className="edit-actions">
                    <button className="btn-save" onClick={() => saveEdit(task._id)}>Save</button>
                    <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Checkbox */}
                  <div
                    className={`check-box ${task.completed ? 'checked' : ''}`}
                    onClick={() => toggleComplete(task._id, task.completed)}
                    title={task.completed ? 'Mark as pending' : 'Mark as complete'}
                  >
                    <CheckIcon />
                  </div>

                  {/* Content */}
                  <div className="task-content">
                    <div className={`task-title ${task.completed ? 'done' : ''}`}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div className={`task-desc ${task.completed ? 'done' : ''}`}>
                        {task.description}
                      </div>
                    )}
                    <div className="task-footer">
                      {task.createdAt && (
                        <span className="task-date">
                          <ClockIcon />
                          {formatDate(task.createdAt)}
                        </span>
                      )}
                      <span className={`status-pill ${task.completed ? 'completed' : 'pending'}`}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="task-actions">
                    {!task.completed && (
                      <button className="btn-icon edit" title="Edit" onClick={() => startEdit(task)}>
                        <EditIcon />
                      </button>
                    )}
                    <button className="btn-icon delete" title="Delete" onClick={() => deleteTask(task._id)}>
                      <TrashIcon />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {tasks.length > 0 && displayed.length === 0 && (
            <div className="empty-state small">
              <p>No tasks match this filter.</p>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="empty-state">
              <EmptyIcon />
              <p>No tasks yet. Add one above to get started.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;

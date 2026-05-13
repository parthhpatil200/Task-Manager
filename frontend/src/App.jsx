import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://YOUR_PUBLIC_IP:5000/api/tasks';

// ── Constants ────────────────────────────────────────────────
const PRIORITIES = ['low', 'medium', 'high'];
const CATEGORIES = ['Work', 'Personal', 'Study', 'Health', 'Other'];
const STATUSES   = ['todo', 'in-progress', 'done'];

const STATUS_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };
const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

// ── SVG Icons ────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const LogoIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────
function getDueInfo(dueDate) {
  if (!dueDate) return null;
  const now  = new Date();
  const due  = new Date(dueDate);
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return { diff, due };
}

function DueBadge({ dueDate, status }) {
  const info = getDueInfo(dueDate);
  if (!info) return null;
  const { diff, due } = info;
  const isDone = status === 'done';

  let cls = 'due-badge';
  let label = '';

  if (isDone) {
    cls += ' due-done';
    label = `Due ${due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
  } else if (diff < 0) {
    cls += ' due-overdue';
    label = `Overdue by ${Math.abs(diff)}d`;
  } else if (diff === 0) {
    cls += ' due-today';
    label = 'Due Today';
  } else if (diff <= 3) {
    cls += ' due-soon';
    label = `${diff}d left`;
  } else {
    cls += ' due-ok';
    label = `${diff}d left`;
  }

  return (
    <span className={cls}>
      <CalendarIcon /> {label}
    </span>
  );
}

// ── Edit Modal ───────────────────────────────────────────────
function EditModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title:       task.title,
    description: task.description || '',
    priority:    task.priority    || 'medium',
    category:    task.category    || 'Other',
    status:      task.status      || 'todo',
    dueDate:     task.dueDate ? task.dueDate.split('T')[0] : '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      ...form,
      dueDate: form.dueDate || null,
    };
    await onSave(task._id, payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Task</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSave}>
          <div className="field">
            <label>Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows="3" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional details..." />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Task Card ────────────────────────────────────────────────
function TaskCard({ task, onDelete, onEdit, onStatusChange }) {
  const isDone = task.status === 'done';

  const cycleStatus = () => {
    const next = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' };
    onStatusChange(task._id, next[task.status || 'todo']);
  };

  return (
    <div className={`task-card priority-${task.priority || 'medium'} ${isDone ? 'done' : ''}`}>
      {/* Left priority stripe handled via CSS border */}

      <div className="task-card-inner">
        {/* Top row: title + actions */}
        <div className="card-top">
          <div className="card-title-wrap">
            <span className={`task-title ${isDone ? 'done' : ''}`}>{task.title}</span>
          </div>
          <div className="task-actions">
            <button className="btn-icon edit" title="Edit" onClick={() => onEdit(task)}><EditIcon /></button>
            <button className="btn-icon delete" title="Delete" onClick={() => onDelete(task._id)}><TrashIcon /></button>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className={`task-desc ${isDone ? 'done' : ''}`}>{task.description}</p>
        )}

        {/* Footer: meta tags + status control */}
        <div className="card-footer">
          <div className="card-meta">
            <span className={`priority-pill priority-${task.priority || 'medium'}`}>
              {PRIORITY_LABELS[task.priority || 'medium']}
            </span>
            <span className="category-pill">{task.category || 'Other'}</span>
            <DueBadge dueDate={task.dueDate} status={task.status} />
          </div>

          <button
            className={`status-btn status-${task.status || 'todo'}`}
            onClick={cycleStatus}
            title="Click to advance status"
          >
            {STATUS_LABELS[task.status || 'todo']}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────
function App() {
  const [tasks, setTasks]       = useState([]);
  const [filter, setFilter]     = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [sort, setSort]         = useState('newest');
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium',
    category: 'Other', dueDate: '',
  });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const res = await axios.post(API_URL, {
        ...form,
        status: 'todo',
        dueDate: form.dueDate || null,
      });
      setTasks(prev => [res.data, ...prev]);
      setForm({ title: '', description: '', priority: 'medium', category: 'Other', dueDate: '' });
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const saveEdit = async (id, payload) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, payload);
      setTasks(prev => prev.map(t => t._id === id ? res.data : t));
      setEditingTask(null);
    } catch (err) {
      console.error('Error saving edit:', err);
    }
  };

  const onStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === id ? res.data : t));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  // Stats
  const todoCount       = tasks.filter(t => (t.status || 'todo') === 'todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const doneCount       = tasks.filter(t => t.status === 'done').length;
  const overdueCount    = tasks.filter(t => {
    const info = getDueInfo(t.dueDate);
    return info && info.diff < 0 && t.status !== 'done';
  }).length;

  // Filter + sort
  let displayed = [...tasks];
  if (filter === 'todo')        displayed = displayed.filter(t => (t.status || 'todo') === 'todo');
  if (filter === 'in-progress') displayed = displayed.filter(t => t.status === 'in-progress');
  if (filter === 'done')        displayed = displayed.filter(t => t.status === 'done');
  if (filter === 'overdue')     displayed = displayed.filter(t => {
    const info = getDueInfo(t.dueDate);
    return info && info.diff < 0 && t.status !== 'done';
  });
  if (filter === 'high')        displayed = displayed.filter(t => t.priority === 'high');
  if (catFilter !== 'all')      displayed = displayed.filter(t => t.category === catFilter);
  if (sort === 'oldest')        displayed = [...displayed].reverse();
  if (sort === 'due')           displayed = [...displayed].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
  if (sort === 'priority') {
    const order = { high: 0, medium: 1, low: 2 };
    displayed = [...displayed].sort((a, b) => (order[a.priority] || 1) - (order[b.priority] || 1));
  }

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="nav-brand">
          <div className="nav-logo"><LogoIcon /></div>
          Taskflow
        </div>
        <div className="nav-stats">
          <span className="stat-chip todo-chip">📋 {todoCount} To Do</span>
          <span className="stat-chip prog-chip">⚡ {inProgressCount} In Progress</span>
          <span className="stat-chip done-chip">✅ {doneCount} Done</span>
          {overdueCount > 0 && <span className="stat-chip over-chip">🔴 {overdueCount} Overdue</span>}
        </div>
      </nav>

      <div className="page">

        {/* ── ADD TASK FORM ── */}
        <div className="add-card">
          <h2 className="section-label">Add New Task</h2>
          <form className="task-form" onSubmit={addTask}>
            <input
              type="text"
              placeholder="Task title *"
              value={form.title}
              onChange={e => setF('title', e.target.value)}
              required
            />
            <textarea
              placeholder="Description (optional)..."
              value={form.description}
              onChange={e => setF('description', e.target.value)}
            />
            <div className="form-grid">
              <div className="field-mini">
                <label>Priority</label>
                <select value={form.priority} onChange={e => setF('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                </select>
              </div>
              <div className="field-mini">
                <label>Category</label>
                <select value={form.category} onChange={e => setF('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="field-mini">
                <label>Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)} />
              </div>
              <div className="field-mini" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  + Add Task
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="toolbar">
          <div className="toolbar-left">
            <span className="section-title">Tasks</span>
            <span className="count-badge">{displayed.length}</span>
          </div>
          <div className="toolbar-right">
            {/* Status filter */}
            <div className="filter-group">
              {[
                { val: 'all',         label: 'All' },
                { val: 'todo',        label: 'To Do' },
                { val: 'in-progress', label: 'In Progress' },
                { val: 'done',        label: 'Done' },
                { val: 'overdue',     label: '🔴 Overdue' },
                { val: 'high',        label: '🔥 High' },
              ].map(f => (
                <button
                  key={f.val}
                  className={`filter-btn ${filter === f.val ? 'active' : ''}`}
                  onClick={() => setFilter(f.val)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Category + Sort */}
            <div className="toolbar-selects">
              <select className="sort-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="due">By Due Date</option>
                <option value="priority">By Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── TASK LIST ── */}
        <div className="task-list">
          {displayed.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={deleteTask}
              onEdit={setEditingTask}
              onStatusChange={onStatusChange}
            />
          ))}

          {tasks.length > 0 && displayed.length === 0 && (
            <div className="empty-state small">
              <p>No tasks match this filter.</p>
            </div>
          )}

          {tasks.length === 0 && (
            <div className="empty-state">
              <p>No tasks yet. Add one above to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── EDIT MODAL ── */}
      {editingTask && (
        <EditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={saveEdit}
        />
      )}
    </>
  );
}

export default App;

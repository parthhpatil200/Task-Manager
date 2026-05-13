import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://YOUR_PUBLIC_IP:5000/api/tasks';

// ── Constants ─────────────────────────────────────────────
const PRIORITIES      = ['low', 'medium', 'high'];
const CATEGORIES      = ['Work', 'Personal', 'Study', 'Health', 'Other'];
const STATUSES        = ['todo', 'in-progress', 'done'];
const STATUS_LABELS   = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };
const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

// ── Icons ─────────────────────────────────────────────────
const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CalIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// ── Due Date Helper ───────────────────────────────────────
function DueBadge({ dueDate, isDone }) {
  if (!dueDate) return null;
  const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
  const date = new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  let cls = 'due-badge';
  let text = '';

  if (isDone)        { cls += ' neutral';  text = date; }
  else if (diff < 0) { cls += ' overdue';  text = `Overdue ${Math.abs(diff)}d`; }
  else if (diff === 0){ cls += ' today';   text = 'Due Today'; }
  else if (diff <= 3) { cls += ' soon';    text = `${diff}d left`; }
  else               { cls += ' ok';       text = date; }

  return <span className={cls}><CalIcon /> {text}</span>;
}

// ── Edit Modal ────────────────────────────────────────────
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(task._id, { ...form, dueDate: form.dueDate || null });
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Edit Task</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mfield">
            <label>Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required autoFocus />
          </div>
          <div className="mfield">
            <label>Description</label>
            <textarea rows="3" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional..." />
          </div>
          <div className="mrow">
            <div className="mfield">
              <label>Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
            <div className="mfield">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mrow">
            <div className="mfield">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="mfield">
              <label>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-blue">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Task Card ─────────────────────────────────────────────
function TaskCard({ task, onDelete, onEdit, onComplete }) {
  const isDone = task.status === 'done';

  return (
    <div className={`task-card pri-${task.priority || 'medium'} ${isDone ? 'is-done' : ''}`}>

      {/* Complete Button */}
      <button
        className={`complete-btn ${isDone ? 'completed' : ''}`}
        onClick={() => onComplete(task._id, task.status)}
        title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isDone && <CheckIcon />}
      </button>

      {/* Content */}
      <div className="card-body">
        <div className="card-main">
          <span className={`card-title ${isDone ? 'struck' : ''}`}>{task.title}</span>
          {task.description && (
            <p className={`card-desc ${isDone ? 'struck' : ''}`}>{task.description}</p>
          )}
        </div>

        {/* Badges row */}
        <div className="card-tags">
          <span className={`pri-pill pri-${task.priority || 'medium'}`}>{PRIORITY_LABELS[task.priority || 'medium']}</span>
          <span className="cat-pill">{task.category || 'Other'}</span>
          <span className={`status-pill s-${task.status || 'todo'}`}>{STATUS_LABELS[task.status || 'todo']}</span>
          <DueBadge dueDate={task.dueDate} isDone={isDone} />
        </div>
      </div>

      {/* Actions */}
      <div className="card-actions">
        <button className="icon-btn edit-btn" onClick={() => onEdit(task)} title="Edit"><EditIcon /></button>
        <button className="icon-btn del-btn"  onClick={() => onDelete(task._id)} title="Delete"><TrashIcon /></button>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────
export default function App() {
  const [tasks, setTasks]         = useState([]);
  const [editTask, setEditTask]   = useState(null);
  const [filter, setFilter]       = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [sort, setSort]           = useState('newest');
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium', category: 'Other', dueDate: '',
  });

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try { const r = await axios.get(API_URL); setTasks(r.data); }
    catch (e) { console.error(e); }
  };

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      const r = await axios.post(API_URL, { ...form, status: 'todo', dueDate: form.dueDate || null });
      setTasks(p => [r.data, ...p]);
      setForm({ title: '', description: '', priority: 'medium', category: 'Other', dueDate: '' });
    } catch (e) { console.error(e); }
  };

  const handleComplete = async (id, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    try {
      const r = await axios.put(`${API_URL}/${id}`, { status: newStatus });
      setTasks(p => p.map(t => t._id === id ? r.data : t));
    } catch (e) { console.error(e); }
  };

  const saveEdit = async (id, payload) => {
    try {
      const r = await axios.put(`${API_URL}/${id}`, payload);
      setTasks(p => p.map(t => t._id === id ? r.data : t));
      setEditTask(null);
    } catch (e) { console.error(e); }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTasks(p => p.filter(t => t._id !== id));
    } catch (e) { console.error(e); }
  };

  // Stats
  const total    = tasks.length;
  const done     = tasks.filter(t => t.status === 'done').length;
  const inProg   = tasks.filter(t => t.status === 'in-progress').length;
  const overdue  = tasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  // Filter
  let list = [...tasks];
  if (filter === 'todo')        list = list.filter(t => (t.status || 'todo') === 'todo');
  if (filter === 'in-progress') list = list.filter(t => t.status === 'in-progress');
  if (filter === 'done')        list = list.filter(t => t.status === 'done');
  if (filter === 'overdue')     list = list.filter(t => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date());
  if (filter === 'high')        list = list.filter(t => t.priority === 'high');
  if (catFilter !== 'all')      list = list.filter(t => t.category === catFilter);

  // Sort
  if (sort === 'oldest')  list = [...list].reverse();
  if (sort === 'due')     list = [...list].sort((a, b) => !a.dueDate ? 1 : !b.dueDate ? -1 : new Date(a.dueDate) - new Date(b.dueDate));
  if (sort === 'priority'){ const o = { high:0, medium:1, low:2 }; list = [...list].sort((a,b) => (o[a.priority]||1)-(o[b.priority]||1)); }

  return (
    <>
      {/* Navbar */}
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">✓</div>
          <span>Taskflow</span>
        </div>
        <div className="nav-chips">
          <span className="chip chip-blue">{total} Total</span>
          <span className="chip chip-amber">{inProg} In Progress</span>
          <span className="chip chip-green">{done} Done</span>
          {overdue > 0 && <span className="chip chip-red">{overdue} Overdue</span>}
        </div>
      </nav>

      <div className="page">

        {/* Add Task */}
        <section className="add-section">
          <h2 className="section-label">New Task</h2>
          <form onSubmit={addTask} className="add-form">
            <input
              className="input-full"
              type="text"
              placeholder="Task title *"
              value={form.title}
              onChange={e => setF('title', e.target.value)}
              required
            />
            <textarea
              className="input-full"
              placeholder="Description (optional)..."
              rows="2"
              value={form.description}
              onChange={e => setF('description', e.target.value)}
            />
            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={e => setF('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setF('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)} />
              </div>
              <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                <button type="submit" className="btn-blue add-btn">+ Add Task</button>
              </div>
            </div>
          </form>
        </section>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <span className="list-title">Tasks</span>
            <span className="count-chip">{list.length}</span>
          </div>
          <div className="toolbar-right">
            <div className="filter-tabs">
              {[
                { val: 'all',         label: 'All' },
                { val: 'todo',        label: 'To Do' },
                { val: 'in-progress', label: 'In Progress' },
                { val: 'done',        label: 'Done' },
                { val: 'overdue',     label: '⚠ Overdue' },
                { val: 'high',        label: '↑ High' },
              ].map(f => (
                <button key={f.val} className={`tab-btn ${filter === f.val ? 'active' : ''}`} onClick={() => setFilter(f.val)}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="selects-row">
              <select className="sel" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="sel" value={sort} onChange={e => setSort(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="due">By Due Date</option>
                <option value="priority">By Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="task-list">
          {list.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onDelete={deleteTask}
              onEdit={setEditTask}
              onComplete={handleComplete}
            />
          ))}
          {tasks.length > 0 && list.length === 0 && (
            <div className="empty">No tasks match this filter.</div>
          )}
          {tasks.length === 0 && (
            <div className="empty">No tasks yet. Add one above to get started.</div>
          )}
        </div>
      </div>

      {editTask && (
        <EditModal task={editTask} onClose={() => setEditTask(null)} onSave={saveEdit} />
      )}
    </>
  );
}

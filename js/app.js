/**
 * app.js — Gnoke Organizer
 * Bootstrap file. Runs after ALL other scripts are loaded.
 * Owns: DOMContentLoaded init, page routing, event wiring, task CRUD.
 *
 * Storage: localStorage (TYPE A — Simple CRUD, no SQLite needed)
 * Key: gnoke_organizer_tasks
 */

document.addEventListener('DOMContentLoaded', () => {

  const STORAGE_KEY = 'gnoke_organizer_tasks';

  /* ── 1. Init shared modules ── */
  Theme.init();
  UI.init();
  UI.loading(false);

  /* ── 2. Load tasks from localStorage ── */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(State.get('tasks')));
      UI.status('saved');
    } catch (_) {
      UI.toast('Could not save tasks.', 'err');
    }
  }

  State.set('tasks', loadTasks());

  /* ── 3. Populate About tech table ── */
  renderAboutTech([
    ['Database',    'localStorage'],
    ['Persistence', 'Browser Storage'],
    ['Network',     'None required'],
    ['Stack',       'HTML · CSS · Vanilla JS'],
    ['Version',     'v1.0'],
  ]);

  /* ── 4. Initial render ── */
  loadPage('main-page');
  renderTasks();
  updateStats();
  updateContextInfo();

  /* ═══════════════════════════════════════════════════════════
     PAGE ROUTING
  ═══════════════════════════════════════════════════════════ */

  function loadPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');
    State.set('activePage', pageId);
    updateContextInfo();
  }

  /* ═══════════════════════════════════════════════════════════
     CONTEXT INFO
  ═══════════════════════════════════════════════════════════ */

  function updateContextInfo() {
    const tasks  = State.get('tasks');
    const active = tasks.filter(t => !t.completed).length;
    const el     = document.getElementById('context-info');
    if (!el) return;
    if (State.get('activePage') === 'main-page') {
      el.textContent = active > 0 ? `${active} active` : 'all clear';
    } else {
      el.textContent = '';
    }
  }

  /* ═══════════════════════════════════════════════════════════
     TASK CRUD
  ═══════════════════════════════════════════════════════════ */

  function addTask() {
    const titleEl = document.getElementById('task-title');
    const title   = titleEl.value.trim();
    if (!title) {
      UI.toast('Enter a task title.', 'err');
      titleEl.focus();
      return;
    }

    const task = {
      id       : Date.now(),
      title,
      notes    : document.getElementById('task-notes').value.trim(),
      date     : document.getElementById('task-date').value,
      time     : document.getElementById('task-time').value,
      priority : State.get('selectedPriority'),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const tasks = State.get('tasks');
    tasks.unshift(task);
    State.set('tasks', tasks);
    saveTasks();

    /* Reset form */
    titleEl.value = '';
    document.getElementById('task-notes').value = '';
    document.getElementById('task-date').value  = '';
    document.getElementById('task-time').value  = '';
    setPriority('medium', 'add');

    UI.closeModal('add-task-modal');
    renderTasks();
    updateStats();
    updateContextInfo();
    UI.toast('Task added.', 'ok');
  }

  function toggleTask(id) {
    const tasks = State.get('tasks');
    const task  = tasks.find(t => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    State.set('tasks', tasks);
    saveTasks();
    renderTasks();
    updateStats();
    updateContextInfo();
    UI.toast(task.completed ? 'Task completed ✓' : 'Task reopened.', 'ok');
  }

  function deleteTask(id) {
    const tasks   = State.get('tasks');
    const updated = tasks.filter(t => t.id !== id);
    State.set('tasks', updated);
    saveTasks();
    renderTasks();
    updateStats();
    updateContextInfo();
    UI.toast('Task deleted.', 'info');
  }

  function openEditModal(id) {
    const task = State.get('tasks').find(t => t.id === id);
    if (!task) return;
    State.set('editingTaskId', id);
    State.set('editPriority', task.priority);

    document.getElementById('edit-title').value = task.title;
    document.getElementById('edit-notes').value = task.notes || '';
    document.getElementById('edit-date').value  = task.date  || '';
    document.getElementById('edit-time').value  = task.time  || '';

    setPriority(task.priority, 'edit');
    UI.openModal('edit-task-modal');
  }

  function saveEdit() {
    const id    = State.get('editingTaskId');
    const tasks = State.get('tasks');
    const task  = tasks.find(t => t.id === id);
    if (!task) return;

    const title = document.getElementById('edit-title').value.trim();
    if (!title) {
      UI.toast('Title is required.', 'err');
      return;
    }

    task.title    = title;
    task.notes    = document.getElementById('edit-notes').value.trim();
    task.date     = document.getElementById('edit-date').value;
    task.time     = document.getElementById('edit-time').value;
    task.priority = State.get('editPriority');

    State.set('tasks', tasks);
    saveTasks();
    UI.closeModal('edit-task-modal');
    renderTasks();
    UI.status('saved');
    UI.toast('Task updated.', 'ok');
  }

  function clearCompleted() {
    const tasks   = State.get('tasks');
    const updated = tasks.filter(t => !t.completed);
    const removed = tasks.length - updated.length;
    if (removed === 0) { UI.toast('No completed tasks.', 'info'); return; }
    State.set('tasks', updated);
    saveTasks();
    renderTasks();
    updateStats();
    updateContextInfo();
    UI.toast(`${removed} task${removed > 1 ? 's' : ''} cleared.`, 'ok');
  }

  function clearAll() {
    State.set('tasks', []);
    saveTasks();
    UI.closeModal('clear-all-modal');
    renderTasks();
    updateStats();
    updateContextInfo();
    UI.toast('All tasks deleted.', 'info');
  }

  /* ═══════════════════════════════════════════════════════════
     PRIORITY SELECTOR
     context: 'add' | 'edit'
  ═══════════════════════════════════════════════════════════ */

  function setPriority(priority, context) {
    const stateKey = context === 'edit' ? 'editPriority' : 'selectedPriority';
    State.set(stateKey, priority);

    const selector = context === 'edit' ? '#edit-priority-btns' : '#add-priority-btns';
    document.querySelectorAll(`${selector} .pri-btn`).forEach(btn => {
      const active = btn.dataset.priority === priority;
      btn.classList.toggle('pri-btn--active', active);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     STATS BAR
  ═══════════════════════════════════════════════════════════ */

  function updateStats() {
    const tasks     = State.get('tasks');
    const total     = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active    = total - completed;

    document.getElementById('stat-total').textContent     = total;
    document.getElementById('stat-active').textContent    = active;
    document.getElementById('stat-done').textContent      = completed;

    const subtitle = document.getElementById('task-subtitle');
    if (subtitle) {
      if (total === 0) subtitle.textContent = 'No tasks yet';
      else if (active === 0) subtitle.textContent = 'All caught up 🎉';
      else subtitle.textContent = `${active} of ${total} remaining`;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     RENDER TASKS
  ═══════════════════════════════════════════════════════════ */

  function getFilteredTasks() {
    const tasks  = State.get('tasks');
    const filter = State.get('filter');
    const today  = State.get('today');

    let filtered = tasks.filter(t => {
      if (filter === 'active')    return !t.completed;
      if (filter === 'completed') return  t.completed;
      if (filter === 'today')     return  t.date === today;
      if (filter === 'high')      return  t.priority === 'high' && !t.completed;
      return true;
    });

    /* Sort: priority (high → low), then date asc, undated last */
    const pOrder = { high: 0, medium: 1, low: 2 };
    filtered.sort((a, b) => {
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return  1;
      if (pOrder[a.priority] !== pOrder[b.priority])
        return pOrder[a.priority] - pOrder[b.priority];
      if (a.date && b.date) {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || '00:00').localeCompare(b.time || '00:00');
      }
      return a.date ? -1 : (b.date ? 1 : 0);
    });

    return filtered;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const today    = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const d        = new Date(dateStr + 'T00:00:00');

    if (d.getTime() === today.getTime())    return 'Today';
    if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function taskCard(task) {
    const priLabel = { high: 'High', medium: 'Medium', low: 'Low' }[task.priority];
    const priClass = `pri-badge--${task.priority}`;

    const metaParts = [];
    if (task.date) metaParts.push(`<span>📅 ${formatDate(task.date)}</span>`);
    if (task.time) metaParts.push(`<span>⏰ ${task.time}</span>`);

    return `
      <div class="task-card${task.completed ? ' task-card--done' : ''}" data-id="${task.id}">
        <button class="task-check${task.completed ? ' task-check--done' : ''}"
                title="${task.completed ? 'Reopen' : 'Complete'}"
                data-action="toggle" data-id="${task.id}">
          ${task.completed ? '✓' : ''}
        </button>
        <div class="task-body">
          <div class="task-top">
            <span class="task-title">${escapeHtml(task.title)}</span>
            <span class="pri-badge ${priClass}">${priLabel}</span>
          </div>
          ${task.notes ? `<p class="task-notes">${escapeHtml(task.notes)}</p>` : ''}
          ${metaParts.length ? `<div class="task-meta">${metaParts.join('')}</div>` : ''}
          <div class="task-actions">
            <button class="btn btn-ghost btn-sm" data-action="edit" data-id="${task.id}">✏ Edit</button>
            <button class="btn btn-sm btn-del"   data-action="delete" data-id="${task.id}">✕ Delete</button>
          </div>
        </div>
      </div>`;
  }

  function renderTasks() {
    const list     = document.getElementById('task-list');
    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
      const msgs = {
        all      : 'No tasks yet. Hit <strong>+ New Task</strong> to get started.',
        active   : 'No active tasks. Nice work!',
        completed: 'No completed tasks yet.',
        today    : 'No tasks scheduled for today.',
        high     : 'No high-priority tasks.',
      };
      list.innerHTML = `<div class="task-empty">${msgs[State.get('filter')] || 'No tasks.'}</div>`;
      return;
    }

    list.innerHTML = filtered.map(taskCard).join('');

    /* Delegate events on the rendered list */
    list.querySelectorAll('[data-action]').forEach(el => {
      el.addEventListener('click', () => {
        const id = Number(el.dataset.id);
        if (el.dataset.action === 'toggle') toggleTask(id);
        if (el.dataset.action === 'edit')   openEditModal(id);
        if (el.dataset.action === 'delete') deleteTask(id);
      });
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ═══════════════════════════════════════════════════════════
     FILTER TABS
  ═══════════════════════════════════════════════════════════ */

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      State.set('filter', btn.dataset.filter);
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');
      renderTasks();
    });
  });

  /* ═══════════════════════════════════════════════════════════
     PRIORITY BUTTONS (add & edit modals)
  ═══════════════════════════════════════════════════════════ */

  document.querySelectorAll('#add-priority-btns .pri-btn').forEach(btn => {
    btn.addEventListener('click', () => setPriority(btn.dataset.priority, 'add'));
  });

  document.querySelectorAll('#edit-priority-btns .pri-btn').forEach(btn => {
    btn.addEventListener('click', () => setPriority(btn.dataset.priority, 'edit'));
  });

  /* Set defaults */
  setPriority('medium', 'add');

  /* ═══════════════════════════════════════════════════════════
     MODAL BUTTONS
  ═══════════════════════════════════════════════════════════ */

  document.getElementById('btn-new-task')?.addEventListener('click', () => {
    UI.openModal('add-task-modal');
    setTimeout(() => document.getElementById('task-title')?.focus(), 80);
  });

  document.getElementById('btn-add-task')?.addEventListener('click', addTask);

  document.getElementById('btn-save-edit')?.addEventListener('click', saveEdit);

  document.getElementById('btn-confirm-clear-all')?.addEventListener('click', clearAll);

  /* Enter key on task title inputs */
  document.getElementById('task-title')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });
  document.getElementById('edit-title')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveEdit();
  });

  /* ═══════════════════════════════════════════════════════════
     MENU ACTIONS
  ═══════════════════════════════════════════════════════════ */

  document.getElementById('menu-new-task')?.addEventListener('click', () => {
    UI.openModal('add-task-modal');
    setTimeout(() => document.getElementById('task-title')?.focus(), 80);
  });

  document.getElementById('menu-clear-completed')?.addEventListener('click', clearCompleted);

  document.getElementById('menu-clear-all')?.addEventListener('click', () => {
    if (State.get('tasks').length === 0) { UI.toast('No tasks to delete.', 'info'); return; }
    UI.openModal('clear-all-modal');
  });

  /* ═══════════════════════════════════════════════════════════
     MOBILE DRAWER
  ═══════════════════════════════════════════════════════════ */

  const Drawer = (() => {
    const panel   = () => document.getElementById('drawer');
    const overlay = () => document.getElementById('drawer-overlay');

    function open()  { panel()?.classList.add('open');    overlay()?.classList.add('open');    }
    function close() { panel()?.classList.remove('open'); overlay()?.classList.remove('open'); }

    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    document.getElementById('hamburger')?.addEventListener('click', open);
    document.getElementById('drawer-close')?.addEventListener('click', close);
    document.getElementById('drawer-overlay')?.addEventListener('click', close);

    return { open, close };
  })();

  /* Expose globals for inline onclick attributes */
  window.Drawer   = Drawer;
  window.loadPage = loadPage;
  window.UI       = UI;

});


/* ─────────────────────────────────────────────────────────────────
   renderAboutTech — populates the ⚙️ Under The Hood table.
──────────────────────────────────────────────────────────────── */
function renderAboutTech(rows) {
  const tbody = document.getElementById('about-tech-table');
  if (!tbody) return;
  tbody.innerHTML = rows.map(([k, v]) => `
    <tr><td>${k}</td><td>${v}</td></tr>`).join('');
}

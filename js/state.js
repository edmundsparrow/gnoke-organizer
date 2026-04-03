/**
 * state.js — Gnoke Organizer
 * Single source of truth for all runtime state.
 * No DOM. No DB. Just plain data + helpers.
 */

const State = (() => {

  const today = new Date().toISOString().split('T')[0];

  const DEFAULTS = {
    /* Navigation */
    activePage        : 'main-page',

    /* Date context */
    today             : today,

    /* Task list — loaded from localStorage on boot */
    tasks             : [],

    /* UI state */
    filter            : 'all',
    selectedPriority  : 'medium',

    /* Edit state */
    editingTaskId     : null,
    editPriority      : 'medium',
  };

  let _state       = { ...DEFAULTS };
  const _listeners = {};

  function get(key) {
    return _state[key];
  }

  function set(key, value) {
    _state[key] = value;
    (_listeners[key] || []).forEach(fn => fn(value));
  }

  function on(key, callback) {
    if (!_listeners[key]) _listeners[key] = [];
    _listeners[key].push(callback);
  }

  function reset() {
    _state = { ...DEFAULTS };
  }

  return { get, set, on, reset, DEFAULTS };

})();

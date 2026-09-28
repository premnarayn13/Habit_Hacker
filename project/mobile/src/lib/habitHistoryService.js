import { supabase } from './supabaseClient';
import { getApiBaseUrl } from './apiConfig';

const LOCAL_COMPLETION_HIST_KEY = 'hh_habit_completion_history';
const LOCAL_UPDATE_HIST_KEY = 'hh_habit_update_history';

const getLocalList = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalList = (key, list) => {
  try {
    localStorage.setItem(key, JSON.stringify(list.slice(0, 150)));
  } catch (e) {}
};

export const habitHistoryService = {
  /**
   * Log a habit completion record
   */
  async logCompletion({
    taskId,
    parentTaskId = null,
    taskTitle,
    userId,
    userName = 'User',
    measuredValue = 0,
    measureUnit = 'units',
    eventCount = 1,
    notes = ''
  }) {
    const record = {
      id: 'comp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      task_id: taskId,
      parent_task_id: parentTaskId,
      task_title: taskTitle || 'Habit Completion',
      user_id: userId,
      user_name: userName || userId?.split('@')[0] || 'User',
      completed_at: new Date().toISOString(),
      measured_value: Number(measuredValue || 0),
      measure_unit: measureUnit || 'units',
      event_count: Number(eventCount || 1),
      notes: notes || ''
    };

    // 1. Cache locally
    const local = getLocalList(LOCAL_COMPLETION_HIST_KEY);
    local.unshift(record);
    saveLocalList(LOCAL_COMPLETION_HIST_KEY, local);

    // 2. Persist to Supabase
    try {
      await supabase.from('habit_completion_history').insert([record]);
    } catch (e) {
      console.warn('Supabase habit completion history insert notice:', e.message);
    }

    // 3. Sync to Spring Boot backend
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/v1/habits/${taskId}/completion-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (e) {}

    return record;
  },

  /**
   * Log a habit update or change record
   */
  async logUpdate({
    taskId,
    parentTaskId = null,
    taskTitle,
    userId,
    userName = 'User',
    updateType = 'TASK_UPDATED',
    fieldName = null,
    oldValue = null,
    newValue = null,
    changeSummary
  }) {
    const record = {
      id: 'upd-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      task_id: taskId,
      parent_task_id: parentTaskId,
      task_title: taskTitle || 'Habit Update',
      user_id: userId,
      user_name: userName || userId?.split('@')[0] || 'User',
      update_type: updateType,
      field_name: fieldName,
      old_value: oldValue ? String(oldValue) : null,
      new_value: newValue ? String(newValue) : null,
      change_summary: changeSummary,
      created_at: new Date().toISOString()
    };

    // 1. Cache locally
    const local = getLocalList(LOCAL_UPDATE_HIST_KEY);
    local.unshift(record);
    saveLocalList(LOCAL_UPDATE_HIST_KEY, local);

    // 2. Persist to Supabase
    try {
      await supabase.from('habit_update_history').insert([record]);
    } catch (e) {
      console.warn('Supabase habit update history insert notice:', e.message);
    }

    // 3. Sync to Spring Boot backend
    try {
      const baseUrl = getApiBaseUrl();
      await fetch(`${baseUrl}/api/v1/habits/${taskId}/update-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      });
    } catch (e) {}

    return record;
  },

  /**
   * Fetch completion history for a habit and its child subhabits
   */
  async getCompletionHistory(taskId, childTaskIds = []) {
    const targetIds = [taskId, ...(childTaskIds || [])].filter(Boolean);
    let results = [];

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('habit_completion_history')
        .select('*')
        .or(`task_id.in.(${targetIds.join(',')}),parent_task_id.eq.${taskId}`)
        .order('completed_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        results = data;
      }
    } catch (e) {}

    // Merge with local fallback
    const local = getLocalList(LOCAL_COMPLETION_HIST_KEY).filter(r => 
      targetIds.includes(r.task_id) || r.parent_task_id === taskId
    );

    const merged = new Map();
    [...results, ...local].forEach(item => {
      merged.set(item.id, item);
    });

    return Array.from(merged.values()).sort((a, b) => 
      new Date(b.completed_at || b.created_at) - new Date(a.completed_at || a.created_at)
    );
  },

  /**
   * Fetch update history for a habit and its child subhabits
   */
  async getUpdateHistory(taskId, childTaskIds = []) {
    const targetIds = [taskId, ...(childTaskIds || [])].filter(Boolean);
    let results = [];

    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('habit_update_history')
        .select('*')
        .or(`task_id.in.(${targetIds.join(',')}),parent_task_id.eq.${taskId}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        results = data;
      }
    } catch (e) {}

    // Merge with local fallback
    const local = getLocalList(LOCAL_UPDATE_HIST_KEY).filter(r => 
      targetIds.includes(r.task_id) || r.parent_task_id === taskId
    );

    const merged = new Map();
    [...results, ...local].forEach(item => {
      merged.set(item.id, item);
    });

    return Array.from(merged.values()).sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  }
};

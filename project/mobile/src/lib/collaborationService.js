import { getApiBaseUrl } from './apiConfig';
import { supabase } from './supabaseClient';

const LOCAL_COLLAB_KEY = 'hh_task_collaborations';

function getLocalCollabs() {
  try {
    if (typeof window === 'undefined') return [];
    const raw = window.localStorage.getItem(LOCAL_COLLAB_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalCollabs(list) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LOCAL_COLLAB_KEY, JSON.stringify(list));
    }
  } catch (e) {}
}

export const collaborationService = {
  async sendTaskInvite({ taskId, taskTitle, category, priority, senderEmail, senderName, receiverEmail }) {
    if (!receiverEmail || !receiverEmail.trim()) return null;

    // Split multiple comma/space/semicolon-separated emails
    const rawEmails = receiverEmail.split(/[,;\s]+/).map(e => e.trim().toLowerCase()).filter(Boolean);
    if (rawEmails.length === 0) return null;

    const cleanSender = (senderEmail || '').trim().toLowerCase();
    const createdInvites = [];

    for (const cleanReceiver of rawEmails) {
      const inviteData = {
        id: 'collab-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
        taskId: taskId || 'task-' + Date.now(),
        taskTitle: taskTitle || 'Collaborative Task',
        category: category || 'General',
        priority: priority || 'HIGH',
        senderEmail: cleanSender || 'user@habithacker.app',
        senderName: senderName || cleanSender.split('@')[0] || 'User',
        receiverEmail: cleanReceiver,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save locally first (ensures 100% offline & local reliability)
      const local = getLocalCollabs();
      const existingIdx = local.findIndex(c => c.taskId === inviteData.taskId && c.receiverEmail.toLowerCase() === cleanReceiver);
      if (existingIdx >= 0) {
        local[existingIdx] = { ...local[existingIdx], status: 'PENDING', updatedAt: new Date().toISOString() };
      } else {
        local.unshift(inviteData);
      }
      saveLocalCollabs(local);

      // Try persisting to Supabase task_collaborations table
      try {
        await supabase.from('task_collaborations').insert([{
          id: inviteData.id,
          task_id: inviteData.taskId,
          task_title: inviteData.taskTitle,
          category: inviteData.category,
          priority: inviteData.priority,
          sender_email: inviteData.senderEmail,
          sender_name: inviteData.senderName,
          receiver_email: inviteData.receiverEmail,
          status: 'PENDING',
          created_at: inviteData.createdAt
        }]);
      } catch (e) {}

      // Try posting to Spring Boot REST backend
      try {
        const baseUrl = getApiBaseUrl();
        await fetch(`${baseUrl}/api/v1/collaborations/invite`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inviteData)
        });
      } catch (e) {}

      createdInvites.push(inviteData);
    }

    return createdInvites;
  },

  async syncTaskCompletionStatus(taskId, completedByEmail, isDoneToday) {
    if (!taskId) return;
    const cleanEmail = (completedByEmail || '').trim().toLowerCase();
    const completedAt = new Date().toISOString();

    // 1. Update local collaborations
    const local = getLocalCollabs();
    local.forEach(c => {
      if (c.taskId === taskId) {
        c.lastCompletedBy = cleanEmail;
        c.isCompletedByAny = isDoneToday;
        c.updatedAt = completedAt;
      }
    });
    saveLocalCollabs(local);

    // 2. Sync to Supabase tasks table
    try {
      await supabase.from('tasks').update({
        is_done_today: isDoneToday,
        completed_by: isDoneToday ? cleanEmail : null,
        completed_at: isDoneToday ? completedAt : null
      }).eq('id', taskId);
    } catch (e) {}

    // 3. Sync to Supabase task_collaborations table
    try {
      await supabase.from('task_collaborations').update({
        status: isDoneToday ? `COMPLETED_BY_${cleanEmail}` : 'ACCEPTED'
      }).eq('task_id', taskId);
    } catch (e) {}
  },

  async getReceivedInvitations(receiverEmail) {
    if (!receiverEmail) return [];
    const cleanEmail = receiverEmail.trim().toLowerCase();
    let remoteInvites = [];

    // Try Supabase first
    try {
      const { data: supaCollabs } = await supabase
        .from('task_collaborations')
        .select('*')
        .eq('receiver_email', cleanEmail);

      if (supaCollabs && supaCollabs.length > 0) {
        remoteInvites = supaCollabs.map(c => ({
          id: c.id,
          taskId: c.task_id || c.taskId,
          taskTitle: c.task_title || c.taskTitle,
          category: c.category,
          priority: c.priority,
          senderEmail: c.sender_email || c.senderEmail,
          senderName: c.sender_name || c.senderName,
          receiverEmail: c.receiver_email || c.receiverEmail,
          status: c.status || 'PENDING',
          createdAt: c.created_at || c.createdAt
        }));
      }
    } catch (e) {}

    // Try Spring Boot REST API
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/collaborations/received?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const bootInvites = await res.json();
        remoteInvites.push(...bootInvites);
      }
    } catch (e) {}

    const local = getLocalCollabs().filter(c => c.receiverEmail && c.receiverEmail.toLowerCase() === cleanEmail);
    const combinedMap = new Map();
    [...remoteInvites, ...local].forEach(item => {
      combinedMap.set(item.id, item);
    });

    return Array.from(combinedMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getSentRequests(senderEmail) {
    if (!senderEmail) return [];
    const cleanEmail = senderEmail.trim().toLowerCase();
    let remoteSent = [];

    // Try Supabase first
    try {
      const { data: supaCollabs } = await supabase
        .from('task_collaborations')
        .select('*')
        .eq('sender_email', cleanEmail);

      if (supaCollabs && supaCollabs.length > 0) {
        remoteSent = supaCollabs.map(c => ({
          id: c.id,
          taskId: c.task_id || c.taskId,
          taskTitle: c.task_title || c.taskTitle,
          category: c.category,
          priority: c.priority,
          senderEmail: c.sender_email || c.senderEmail,
          senderName: c.sender_name || c.senderName,
          receiverEmail: c.receiver_email || c.receiverEmail,
          status: c.status || 'PENDING',
          createdAt: c.created_at || c.createdAt
        }));
      }
    } catch (e) {}

    // Try Spring Boot REST API
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/collaborations/sent?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        const bootSent = await res.json();
        remoteSent.push(...bootSent);
      }
    } catch (e) {}

    const local = getLocalCollabs().filter(c => c.senderEmail && c.senderEmail.toLowerCase() === cleanEmail);
    const combinedMap = new Map();
    [...remoteSent, ...local].forEach(item => {
      combinedMap.set(item.id, item);
    });

    return Array.from(combinedMap.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async respondToInvitation(inviteId, action, taskData, onAcceptTask) {
    const normalizedAction = action.toUpperCase(); // 'ACCEPT' or 'DECLINE'
    const newStatus = normalizedAction === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED';

    // Update local storage state
    const local = getLocalCollabs();
    const targetIdx = local.findIndex(c => c.id === inviteId);
    let updatedItem = null;
    if (targetIdx >= 0) {
      local[targetIdx].status = newStatus;
      local[targetIdx].updatedAt = new Date().toISOString();
      updatedItem = local[targetIdx];
      saveLocalCollabs(local);
    }

    // Try updating Supabase table
    try {
      await supabase.from('task_collaborations').update({ status: newStatus }).eq('id', inviteId);
    } catch (e) {}

    // Attempt updating Spring Boot backend
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/collaborations/${inviteId}/respond?action=${normalizedAction}`, {
        method: 'POST'
      });
      if (res.ok) {
        updatedItem = await res.json();
      }
    } catch (e) {
      console.log('Responded to invitation locally offline.');
    }

    // If accepted, add the collaborative task to acceptor's active task list
    if (normalizedAction === 'ACCEPT' && onAcceptTask && (taskData || updatedItem)) {
      const itemToUse = updatedItem || taskData;
      const newTask = {
        id: 'collab-task-' + Date.now(),
        title: itemToUse.taskTitle || 'Accepted Collaborative Habit',
        category: itemToUse.category || itemToUse.taskCategory || 'General',
        priority: itemToUse.priority || itemToUse.taskPriority || 'HIGH',
        collab: itemToUse.senderEmail || '',
        description: `Collaborative task accepted from ${itemToUse.senderName || itemToUse.senderEmail}`,
        estimatedMinutes: 30,
        actualMinutes: 0,
        progressPercent: 0,
        isDoneToday: false,
        trackingMode: 'end_date'
      };
      onAcceptTask(newTask);
    }

    return updatedItem;
  }
};


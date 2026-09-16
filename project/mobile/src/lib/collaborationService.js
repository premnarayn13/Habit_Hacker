import { getApiBaseUrl } from './apiConfig';

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
    const cleanReceiver = receiverEmail.trim().toLowerCase();

    const inviteData = {
      id: 'collab-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      taskId: taskId || 'task-' + Date.now(),
      taskTitle: taskTitle || 'Collaborative Task',
      category: category || 'General',
      priority: priority || 'HIGH',
      senderEmail: senderEmail || 'prem.narayn@habithacker.app',
      senderName: senderName || 'Prem Narayn',
      receiverEmail: cleanReceiver,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save locally first (ensures 100% offline & local reliability)
    const local = getLocalCollabs();
    const existingIdx = local.findIndex(c => c.taskId === inviteData.taskId && c.receiverEmail === cleanReceiver);
    if (existingIdx >= 0) {
      local[existingIdx] = { ...local[existingIdx], status: 'PENDING', updatedAt: new Date().toISOString() };
    } else {
      local.unshift(inviteData);
    }
    saveLocalCollabs(local);

    // Try posting to Spring Boot REST backend
    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/collaborations/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteData)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.log('Saved collaboration invite locally offline.');
    }

    return inviteData;
  },

  async getReceivedInvitations(receiverEmail) {
    if (!receiverEmail) return [];
    const cleanEmail = receiverEmail.trim().toLowerCase();
    let remoteInvites = [];

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/collaborations/received?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        remoteInvites = await res.json();
      }
    } catch (e) {}

    const local = getLocalCollabs().filter(c => c.receiverEmail.toLowerCase() === cleanEmail);
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

    try {
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/api/v1/collaborations/sent?email=${encodeURIComponent(cleanEmail)}`);
      if (res.ok) {
        remoteSent = await res.json();
      }
    } catch (e) {}

    const local = getLocalCollabs().filter(c => c.senderEmail.toLowerCase() === cleanEmail);
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
        category: itemToUse.taskCategory || 'General',
        priority: itemToUse.taskPriority || 'HIGH',
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

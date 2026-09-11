// Local Notification Scheduler for Todo Reminders

export async function scheduleTodoNotification(todo) {
  if (!todo || !todo.reminderDate || !todo.reminderTime) return null;

  const reminderDateTimeStr = `${todo.reminderDate}T${todo.reminderTime}:00`;
  const reminderTimeMs = new Date(reminderDateTimeStr).getTime();
  const nowMs = Date.now();
  const delayMs = reminderTimeMs - nowMs;

  if (delayMs <= 0) return null;

  if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    await Notification.requestPermission();
  }

  const timerId = setTimeout(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Habit Hacker Reminder 🔔', {
        body: todo.title,
        icon: '/icon-192.png',
        tag: todo.id,
        requireInteraction: true
      });
    } else {
      console.log('Local Reminder Alert:', todo.title);
    }
  }, Math.min(delayMs, 2147483647)); // Cap to max 32-bit int for setTimeout

  return timerId;
}

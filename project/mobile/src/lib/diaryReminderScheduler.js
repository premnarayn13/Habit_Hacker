// Local Notification Scheduler for Todo Reminders (React Native & Expo compatible)
export async function scheduleTodoNotification(todo) {
  if (!todo || !todo.reminderDate || !todo.reminderTime) return null;

  const reminderDateTimeStr = `${todo.reminderDate}T${todo.reminderTime}:00`;
  const reminderTimeMs = new Date(reminderDateTimeStr).getTime();
  const nowMs = Date.now();
  const delayMs = reminderTimeMs - nowMs;

  if (delayMs <= 0) return null;

  const timerId = setTimeout(() => {
    console.log('Habit Hacker Local Reminder:', todo.title);
  }, Math.min(delayMs, 2147483647));

  return timerId;
}

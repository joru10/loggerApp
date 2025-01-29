const INTERVAL_KEY = 'notification_interval';

export const checkNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const scheduleNotification = (intervalMinutes: number) => {
  localStorage.setItem(INTERVAL_KEY, intervalMinutes.toString());
  
  if (Notification.permission === 'granted') {
    const intervalId = setInterval(() => {
      new Notification('Audio Logger Reminder', {
        body: 'Time to record your activities!',
        icon: '/logo192.png'
      });
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(intervalId);
  }
};

export const getStoredInterval = (): number | null => {
  const stored = localStorage.getItem(INTERVAL_KEY);
  return stored ? parseInt(stored, 10) : null;
};
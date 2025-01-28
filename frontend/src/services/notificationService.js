let notificationTimer = null;
let audioContext = null;
let audioContextInitialized = false;

const initAudioContext = async () => {
  if (!audioContextInitialized) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    await audioContext.resume();
    audioContextInitialized = true;
  }
  return audioContext;
};

const playNotificationSound = async () => {
  try {
    const context = await initAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.1;
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 200);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

const checkNotificationPermission = async () => {
  console.log('Current notification permission:', Notification.permission);
  
  if (!("Notification" in window)) {
    alert("This browser doesn't support notifications");
    return false;
  }

  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('ServiceWorker registration successful:', registration);
    } catch (err) {
      console.error('ServiceWorker registration failed:', err);
    }
  }

  if (Notification.permission === "granted") {
    console.log('Notifications already granted');
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('New permission status:', permission);
    return permission === "granted";
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

// Update the scheduleNotification function
const scheduleNotification = (intervalMinutes = 60) => {
  if (notificationTimer) {
    clearInterval(notificationTimer);
  }

  const interval = intervalMinutes * 60 * 1000;
  console.log(`Setting up notifications every ${interval}ms`);

  const sendNotification = async () => {
    try {
      if (Notification.permission !== "granted") return;
      const registration = await navigator.serviceWorker.ready;

      // Only play sound if there was user interaction
      if (audioContextInitialized && document.hasFocus()) {
        await playNotificationSound();
      }

      await registration.showNotification("Audio Logger Reminder", {
        body: "Time to record your activity!",
        icon: "/logo192.png",
        requireInteraction: true,
        tag: 'audio-logger-reminder',
        renotify: true,
        silent: true
      });
    } catch (error) {
      console.error('Notification failed:', error);
    }
  };

  // Set up new timer
  notificationTimer = setInterval(sendNotification, interval);
  
  // Delay first notification
  setTimeout(sendNotification, 1000);

  return () => {
    if (notificationTimer) {
      clearInterval(notificationTimer);
    }
  };
};

const getStoredInterval = () => {
  return parseInt(localStorage.getItem('notificationInterval')) || 60;
};

export { checkNotificationPermission, scheduleNotification, getStoredInterval };
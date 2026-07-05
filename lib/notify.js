// Browser notification helper
export function requestNotifPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(() => {});
  }
  return Notification.permission === 'granted';
}

export function browserNotify(title, body, icon = '/logo.png') {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon, badge: icon, tag: 'zts-crm' });
    } catch (e) { /* ignore */ }
  }
}

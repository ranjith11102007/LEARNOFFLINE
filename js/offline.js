let isOnline = navigator.onLine;
let connectionIndicator = null;
let toastContainer = null;

function initOffline() {
  connectionIndicator = document.getElementById('connection-status');
  toastContainer = document.getElementById('toast-container');

  updateOnlineStatus();
  window.addEventListener('online', () => {
    isOnline = true;
    updateOnlineStatus();
    showToast('Connection restored. Local progress is up to date.', 'success');
    processSyncQueue();
  });
  window.addEventListener('offline', () => {
    isOnline = false;
    updateOnlineStatus();
    showToast("You're offline. Your downloaded lessons are still available.", 'warning');
  });
}

function updateOnlineStatus() {
  const pill = document.getElementById('connection-pill');
  if (pill) {
    pill.className = `connection-pill ${isOnline ? 'online' : 'offline'}`;
    pill.querySelector('.connection-text').textContent = isOnline ? 'Online' : 'Offline';
  }
  if (!connectionIndicator) return;
  if (isOnline) {
    connectionIndicator.innerHTML = '<span class="status-dot online"></span> Online';
    connectionIndicator.className = 'connection-status online';
  } else {
    connectionIndicator.innerHTML = '<span class="status-dot offline"></span> Offline';
    connectionIndicator.className = 'connection-status offline';
  }
}

function showToast(message, type = 'info') {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function showOfflineMessage() {
  return !navigator.onLine;
}

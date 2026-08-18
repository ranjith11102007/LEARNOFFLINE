async function addToSyncQueue(type, recordId) {
  const record = {
    type,
    recordId,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  await put('syncQueue', record);
}

async function processSyncQueue() {
  if (!navigator.onLine) return;
  const queue = await getAll('syncQueue');
  const pending = queue.filter(item => item.status === 'pending');
  if (pending.length === 0) return;

  for (const item of pending) {
    try {
      const storeName = getSyncStoreName(item.type);
      if (!storeName) continue;
      const record = await get(storeName, item.recordId);
      if (record) {
        record.status = 'completed';
        await put(storeName, record);
      }
      item.status = 'completed';
      await put('syncQueue', item);
    } catch (err) {
      console.error('Sync processing error:', err);
    }
  }
  updateSyncUI();
}

function getSyncStoreName(type) {
  switch (type) {
    case 'QUIZ_RESULT':
      return 'quizResults';
    case 'ASSIGNMENT_PROGRESS':
      return 'assignmentProgress';
    case 'LESSON_PROGRESS':
      return 'lessonProgress';
    default:
      return null;
  }
}

async function getPendingSyncCount() {
  const queue = await getAll('syncQueue');
  return queue.filter(item => item.status === 'pending').length;
}

async function updateSyncUI() {
  const pendingEl = document.getElementById('pending-sync-count');
  if (!pendingEl) return;
  const count = await getPendingSyncCount();
  pendingEl.textContent = count;
}

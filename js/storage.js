function getStorageUsed() {
  if (navigator.storage && navigator.storage.estimate) {
    return navigator.storage.estimate();
  }
  return Promise.resolve({ usage: 0, quota: 0 });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function getStorageInfo() {
  const estimate = await getStorageUsed();
  const lessons = await getAll('downloadedLessons');
  const results = await getAll('quizResults');
  const assignments = await getAll('assignmentProgress');
  return {
    totalBytes: estimate.usage || 0,
    quota: estimate.quota || 0,
    lessonCount: lessons.length,
    quizCount: results.length,
    assignmentCount: assignments.length,
    formattedUsage: formatBytes(estimate.usage || 0),
    formattedQuota: formatBytes(estimate.quota || 0)
  };
}

async function getDownloadedLessons() {
  return getAll('downloadedLessons');
}

async function deleteDownloadedLesson(lessonId) {
  await deleteItem('downloadedLessons', lessonId);
}

async function getSettings() {
  const all = await getAll('settings');
  const settings = {};
  all.forEach(s => { settings[s.key] = s.value; });
  return settings;
}

async function setSetting(key, value) {
  await put('settings', { key, value });
}

async function getLowDataMode() {
  const settings = await getSettings();
  return settings.lowDataMode === true;
}

async function setLowDataMode(enabled) {
  await setSetting('lowDataMode', enabled);
}

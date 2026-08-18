function getCourses() {
  return getAll('courses');
}

function getCourseById(id) {
  return get('courses', id);
}

function getLessonsByCourse(courseId) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));
    const tx = db.transaction('lessons', 'readonly');
    const store = tx.objectStore('lessons');
    const index = store.index('courseId');
    const req = index.getAll(courseId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function getLessonById(id) {
  return get('lessons', id);
}

function isLessonDownloaded(lessonId) {
  return get('downloadedLessons', lessonId).then(r => !!r);
}

async function getDownloadedLessonContent(lessonId) {
  return get('downloadedLessons', lessonId);
}

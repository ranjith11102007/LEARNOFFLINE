function getQuizById(id) {
  return get('quizzes', id);
}

function submitQuizResult(quizId, answers, score, total) {
  return new Promise((resolve, reject) => {
    const result = {
      id: 'qr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9),
      quizId,
      answers,
      score,
      total,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    put('quizResults', result)
      .then((res) => addToSyncQueue('QUIZ_RESULT', res.id))
      .then(() => resolve(result))
      .catch(reject);
  });
}

function getQuizResults(quizId) {
  return new Promise((resolve, reject) => {
    if (!db) return reject(new Error('Database not initialized'));
    const tx = db.transaction('quizResults', 'readonly');
    const store = tx.objectStore('quizResults');
    const index = store.index('quizId');
    const req = index.getAll(quizId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

function getAllQuizResults() {
  return getAll('quizResults');
}

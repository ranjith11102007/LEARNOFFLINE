function startLesson(lessonId) {
  return new Promise((resolve, reject) => {
    get('lessonProgress', lessonId).then(existing => {
      const progress = {
        id: lessonId,
        started: true,
        startedAt: existing?.startedAt || new Date().toISOString(),
        completed: existing?.completed || false,
        completedAt: existing?.completedAt || null
      };
      put('lessonProgress', progress).then(resolve).catch(reject);
    }).catch(() => {
      const progress = {
        id: lessonId,
        started: true,
        startedAt: new Date().toISOString(),
        completed: false,
        completedAt: null
      };
      put('lessonProgress', progress).then(resolve).catch(reject);
    });
  });
}

function completeLesson(lessonId) {
  return new Promise((resolve, reject) => {
    get('lessonProgress', lessonId).then(existing => {
      const progress = {
        id: lessonId,
        started: true,
        startedAt: existing?.startedAt || new Date().toISOString(),
        completed: true,
        completedAt: new Date().toISOString()
      };
      put('lessonProgress', progress).then(resolve).catch(reject);
    }).catch(() => {
      const progress = {
        id: lessonId,
        started: true,
        startedAt: new Date().toISOString(),
        completed: true,
        completedAt: new Date().toISOString()
      };
      put('lessonProgress', progress).then(resolve).catch(reject);
    });
  });
}

function getLessonProgress(lessonId) {
  return get('lessonProgress', lessonId);
}

function getAllLessonProgress() {
  return getAll('lessonProgress');
}

async function getCourseProgress(courseId) {
  const lessons = await getLessonsByCourse(courseId);
  if (lessons.length === 0) return 0;
  const progresses = await getAllLessonProgress();
  const completed = progresses.filter(p => p.completed && lessons.some(l => l.id === p.id)).length;
  return Math.round((completed / lessons.length) * 100);
}

async function getOverallProgress() {
  const courses = await getCourses();
  let totalLessons = 0;
  let completedLessons = 0;
  const progresses = await getAllLessonProgress();
  for (const course of courses) {
    const lessons = await getLessonsByCourse(course.id);
    totalLessons += lessons.length;
    const courseCompleted = progresses.filter(p => p.completed && lessons.some(l => l.id === p.id)).length;
    completedLessons += courseCompleted;
  }
  return totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
}

async function getStats() {
  const profile = await getProfile();
  const courses = await getCourses();
  const downloaded = await getDownloadedLessons();
  const progresses = await getAllLessonProgress();
  const quizResults = await getAllQuizResults();
  const assignmentProgress = await getAllAssignmentProgress();
  const syncQueue = await getAll('syncQueue');
  const completedLessons = progresses.filter(p => p.completed).length;
  const pendingSync = syncQueue.filter(s => s.status === 'pending').length;

  let totalLessons = 0;
  for (const course of courses) {
    const lessons = await getLessonsByCourse(course.id);
    totalLessons += lessons.length;
  }

  const lastProgress = progresses
    .filter(p => p.startedAt)
    .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))[0];

  return {
    studentName: profile?.name || 'Student',
    online: navigator.onLine,
    overallProgress: await getOverallProgress(),
    downloadedCount: downloaded.length,
    completedLessons,
    quizCount: quizResults.length,
    pendingSync,
    totalLessons,
    lastLesson: lastProgress
  };
}

async function getProfile() {
  if (typeof getCurrentStudent === 'function') {
    const student = await getCurrentStudent();
    if (student) return student;
  }
  const all = await getAll('profile');
  return all[0] || null;
}

async function saveProfile(profile) {
  if (typeof updateCurrentStudent === 'function' && await getCurrentStudent()) {
    return updateCurrentStudent(profile);
  }
  await put('profile', profile);
}

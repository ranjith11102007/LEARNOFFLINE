async function downloadLesson(lessonId) {
  const lesson = await getLessonById(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }
  const downloaded = {
    id: lesson.id,
    courseId: lesson.courseId,
    title: lesson.title,
    objectives: lesson.objectives,
    content: lesson.content,
    examples: lesson.examples,
    keyPoints: lesson.keyPoints,
    downloadedAt: new Date().toISOString(),
    offlineAvailable: true
  };
  await put('downloadedLessons', downloaded);
  const quizzes = (await getAll('quizzes')).filter(quiz => quiz.lessonId === lessonId);
  for (const quiz of quizzes) await put('downloadedQuizzes', { ...quiz, downloadedAt: downloaded.downloadedAt, offlineAvailable: true });
  return downloaded;
}

async function removeDownloadedLesson(lessonId) {
  await deleteItem('downloadedLessons', lessonId);
}

async function getDownloadedLessons() {
  return getAll('downloadedLessons');
}

async function downloadCourse(courseId) {
  const lessons = await getLessonsByCourse(courseId);
  const downloads = [];
  for (const lesson of lessons) downloads.push(await downloadLesson(lesson.id));
  return downloads;
}

async function getDownloadedQuiz(quizId) {
  return get('downloadedQuizzes', quizId);
}

async function getDownloadedQuizzes() {
  return getAll('downloadedQuizzes');
}

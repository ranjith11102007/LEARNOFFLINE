let currentView = 'landing';
let currentCourseId = null;
let currentLessonId = null;
let currentQuizId = null;
let currentAssignmentId = null;

async function navigateTo(view, data = {}) {
  // normalize aliases
  if (view === 'downloads') view = 'storage';

  // protect certain views behind a local profile
  const protectedViews = ['courses', 'course-detail', 'lesson', 'quiz', 'assignment', 'storage', 'downloads'];
  if (protectedViews.includes(view)) {
    const profile = await getProfile();
    if (!profile) {
      showToast('Please create an account or log in to access this section.', 'warning');
      // navigate to profile/login screen
      return navigateTo('profile');
    }
  }

  currentView = view;
  if (data.courseId) currentCourseId = data.courseId;
  if (data.lessonId) currentLessonId = data.lessonId;
  if (data.quizId) currentQuizId = data.quizId;
  if (data.assignmentId) currentAssignmentId = data.assignmentId;

  const main = document.getElementById('main-content');
  main.innerHTML = '';

  switch (view) {
    case 'landing':
      renderLanding(main);
      break;
    case 'profile':
      renderAuth(main);
      break;
    case 'dashboard':
      renderDashboardRedesigned(main);
      break;
    case 'courses':
      renderCourses(main);
      break;
    case 'course-detail':
      renderCourseDetail(main, currentCourseId);
      break;
    case 'lesson':
      renderLesson(main, currentLessonId);
      break;
    case 'quiz':
      renderQuiz(main, currentQuizId);
      break;
    case 'assignment':
      renderAssignment(main, currentAssignmentId);
      break;
    case 'search':
      renderSearch(main);
      break;
    case 'storage':
      renderStorage(main);
      break;
    default:
      renderLanding(main);
  }
  updateNavigation();
}

function updateNavigation() {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const view = currentView === 'course-detail' || currentView === 'lesson' || currentView === 'quiz' || currentView === 'assignment'
    ? 'courses'
    : currentView === 'storage' ? 'downloads' : currentView;
  document.querySelector(`.nav-item[data-view="${view}"]`)?.classList.add('active');
}

function renderLanding(container) {
  const profile = document.getElementById('profile-data');
  const hasProfile = profile && profile.dataset.hasProfile === 'true';

  container.innerHTML = `
    <section class="landing">
      <div class="landing-hero">
        <div class="hero-content">
          <h1 class="hero-title">Learn Anywhere.<br>Even Without Internet.</h1>
          <p class="hero-subtitle">EduReach helps students learn, practice and track their progress even in low-connectivity areas.</p>
          <div class="hero-buttons">
            <button class="btn btn-primary btn-lg" id="btn-start">
              ${hasProfile ? 'Go to Dashboard' : 'Start Learning'}
            </button>
            <button class="btn btn-secondary btn-lg" id="btn-explore">Explore Courses</button>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-icon">📚</div>
        </div>
      </div>

      <div class="connection-banner">
        <div id="connection-status-landing"></div>
      </div>

      <section class="features">
        <h2 class="section-title">Why EduReach?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">📴</div>
            <h3>Offline Learning</h3>
            <p>Access lessons, quizzes and assignments without internet.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📥</div>
            <h3>Downloadable Lessons</h3>
            <p>Download lessons once and study them anytime, anywhere.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💾</div>
            <h3>Persistent Progress</h3>
            <p>Your progress is saved locally and survives browser restarts.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Offline Quizzes</h3>
            <p>Take quizzes offline and see your scores calculated locally.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Low Data Usage</h3>
            <p>Lightweight design works on low-end devices and slow networks.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>Local Sync Queue</h3>
            <p>Changes made offline are queued and processed when you reconnect.</p>
          </div>
        </div>
      </section>
    </section>
  `;

  document.getElementById('btn-start').addEventListener('click', async () => {
    const profile = await getProfile();
    if (profile) {
      navigateTo('dashboard');
    } else {
      navigateTo('profile');
    }
  });

  document.getElementById('btn-explore').addEventListener('click', () => {
    navigateTo('courses');
  });

  const landingStatus = document.getElementById('connection-status-landing');
  if (landingStatus) {
    if (navigator.onLine) {
      landingStatus.innerHTML = '<span class="status-dot online"></span> Online';
    } else {
      landingStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
    }
  }
}

async function renderAuth(container) {
  const student = await getCurrentStudent();
  if (student) {
    container.innerHTML = `<section class="profile-page page"><div class="page-header"><div><p class="eyebrow">STUDENT PROFILE</p><h1>${student.name}</h1><p>${student.class}</p></div></div><div class="card profile-info"><p><strong>Student ID</strong><br>${student.studentId}</p><p><strong>Email</strong><br>${student.email}</p><button class="btn btn-primary btn-full" id="edit-profile">Edit profile</button><button class="btn btn-secondary btn-full" id="logout">Log out</button></div></section>`;
    document.getElementById('logout').addEventListener('click', async () => { await logoutStudent(); navigateTo('profile'); });
    document.getElementById('edit-profile').addEventListener('click', () => renderAuthForm(container, 'edit', student));
    return;
  }
  renderAuthForm(container, 'login');
}

function renderAuthForm(container, mode = 'login', student = null) {
  const signup = mode === 'signup';
  const edit = mode === 'edit';
  container.innerHTML = `<section class="profile-page page"><div class="page-header"><div><p class="eyebrow">LEARNOFFLINE</p><h1>${edit ? 'Edit your profile' : signup ? 'Create your account' : 'Welcome back'}</h1><p>${edit ? 'Keep your student details up to date.' : signup ? 'Your account stays securely on this device.' : 'Continue your learning journey.'}</p></div></div><form id="auth-form" class="card">${signup || edit ? `<div class="form-group"><label for="auth-name">Full name</label><input class="form-input" id="auth-name" required value="${student?.name || ''}"></div><div class="form-group"><label for="auth-id">Student ID</label><input class="form-input" id="auth-id" required value="${student?.studentId || ''}" ${edit ? 'readonly' : ''}></div>` : ''}<div class="form-group"><label for="auth-email">${signup || edit ? 'Email' : 'Email or Student ID'}</label><input class="form-input" id="auth-email" required value="${student?.email || ''}"></div>${signup || edit ? `<div class="form-group"><label for="auth-class">Class</label><input class="form-input" id="auth-class" required value="${student?.class || ''}" placeholder="e.g. Grade 8"></div>` : ''}${!edit ? `<div class="form-group"><label for="auth-password">Password</label><input class="form-input" id="auth-password" type="password" required minlength="6" placeholder="At least 6 characters"></div>` : ''}<button class="btn btn-primary btn-lg" type="submit">${edit ? 'Save changes' : signup ? 'Create account' : 'Log in'}</button>${!edit ? `<button class="btn btn-ghost btn-full" type="button" id="auth-switch">${signup ? 'Already have an account? Log in' : 'New here? Create a student account'}</button><button class="btn btn-ghost btn-full" type="button" id="forgot-password">Forgot password?</button>` : `<button class="btn btn-ghost btn-full" type="button" id="cancel-edit">Cancel</button>`}</form></section>`;
  document.getElementById('auth-form').addEventListener('submit', async event => { event.preventDefault(); try { if (edit) await updateCurrentStudent({ name: document.getElementById('auth-name').value, email: document.getElementById('auth-email').value, class: document.getElementById('auth-class').value }); else if (signup) await createStudentAccount({ name: document.getElementById('auth-name').value, studentId: document.getElementById('auth-id').value, email: document.getElementById('auth-email').value, password: document.getElementById('auth-password').value, class: document.getElementById('auth-class').value }); else await loginStudent(document.getElementById('auth-email').value, document.getElementById('auth-password').value); showToast(edit ? 'Profile updated.' : 'Welcome to LearnOffline!', 'success'); navigateTo(edit ? 'profile' : 'dashboard'); } catch (error) { showToast(error.message, 'error'); } });
  document.getElementById('auth-switch')?.addEventListener('click', () => renderAuthForm(container, signup ? 'login' : 'signup'));
  document.getElementById('forgot-password')?.addEventListener('click', () => showToast('Password recovery is device-local. Create a new account if this password is lost.', 'info'));
  document.getElementById('cancel-edit')?.addEventListener('click', () => navigateTo('profile'));
}

function renderProfile(container) {
  getProfile().then(profile => {
    container.innerHTML = `
      <section class="profile-page">
        <div class="page-header">
          <h1>Student Profile</h1>
          <p>Create your profile to start learning</p>
        </div>
        <div class="form-container">
          <form id="profile-form" class="card">
            <div class="form-group">
              <label for="student-name">Student Name</label>
              <input type="text" id="student-name" required placeholder="Enter your full name">
            </div>
            <div class="form-group">
              <label for="student-id">Student ID</label>
              <input type="text" id="student-id" required placeholder="Enter your student ID">
            </div>
            <div class="form-group">
              <label for="student-class">Class</label>
              <input type="text" id="student-class" required placeholder="e.g. 10th Grade">
            </div>
            <button type="submit" class="btn btn-primary btn-lg">Create Profile</button>
          </form>
          ${profile ? `<div class="profile-info card"><h3>Current Profile</h3><p><strong>Name:</strong> ${profile.name}</p><p><strong>ID:</strong> ${profile.studentId}</p><p><strong>Class:</strong> ${profile.class}</p></div>` : ''}
        </div>
      </section>
    `;

    document.getElementById('profile-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('student-name').value.trim();
      const studentId = document.getElementById('student-id').value.trim();
      const studentClass = document.getElementById('student-class').value.trim();
      if (!name || !studentId || !studentClass) {
        showToast('Please fill all fields', 'error');
        return;
      }
      await saveProfile({ id: 'student', name, studentId, class: studentClass });
      showToast('Profile created successfully!', 'success');
      navigateTo('dashboard');
    });
  });
}

async function renderDashboard(container) {
  const stats = await getStats();
  const profile = await getProfile();

  if (!profile) {
    navigateTo('profile');
    return;
  }

  const courses = await getCourses();
  let courseCards = '';
  for (const course of courses) {
    const progress = await getCourseProgress(course.id);
    courseCards += `
      <div class="course-mini-card" onclick="navigateTo('course-detail', {courseId: '${course.id}'})">
        <div class="course-mini-icon">${course.icon}</div>
        <div class="course-mini-info">
          <h4>${course.title}</h4>
          <div class="progress-bar-mini">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <span class="progress-text">${progress}% complete</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <section class="dashboard">
      <div class="page-header">
        <h1>Welcome, ${stats.studentName}</h1>
        <div id="connection-status-dashboard"></div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <span class="stat-value">${stats.overallProgress}%</span>
            <span class="stat-label">Overall Progress</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📥</div>
          <div class="stat-info">
            <span class="stat-value">${stats.downloadedCount}</span>
            <span class="stat-label">Downloaded Lessons</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <span class="stat-value">${stats.completedLessons}</span>
            <span class="stat-label">Completed Lessons</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-info">
            <span class="stat-value">${stats.quizCount}</span>
            <span class="stat-label">Quiz Results</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <span class="stat-value" id="pending-sync-count">${stats.pendingSync}</span>
            <span class="stat-label">Pending Changes</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-info">
            <span class="stat-value">${stats.totalLessons}</span>
            <span class="stat-label">Total Lessons</span>
          </div>
        </div>
      </div>

      <div class="dashboard-section">
        <h2>Your Courses</h2>
        <div class="courses-grid">
          ${courseCards}
        </div>
      </div>

      <div class="dashboard-actions">
        <button class="btn btn-primary" onclick="navigateTo('courses')">Browse Courses</button>
        <button class="btn btn-secondary" onclick="navigateTo('search')">Search Lessons</button>
        <button class="btn btn-secondary" onclick="navigateTo('storage')">Manage Storage</button>
      </div>
    </section>
  `;

  const dashStatus = document.getElementById('connection-status-dashboard');
  if (dashStatus) {
    if (navigator.onLine) {
      dashStatus.innerHTML = '<span class="status-dot online"></span> Online';
    } else {
      dashStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
    }
  }
}

async function renderDashboardRedesigned(container) {
  const [stats, profile, courses] = await Promise.all([getStats(), getProfile(), getCourses()]);
  if (!profile) { navigateTo('profile'); return; }

  const courseData = await Promise.all(courses.map(async course => ({
    course,
    progress: await getCourseProgress(course.id),
    lessons: await getLessonsByCourse(course.id)
  })));
  const current = courseData.reduce((best, item) => item.progress > best.progress ? item : best, courseData[0]);
  const lessonIndex = current ? Math.min(Math.floor(current.progress / 100 * current.lessons.length), Math.max(0, current.lessons.length - 1)) : 0;
  const lesson = current?.lessons[lessonIndex];
  const courseCards = courseData.map(({course, progress}) => `
    <button class="course-mini-card card-interactive" onclick="navigateTo('course-detail', {courseId: '${course.id}'})">
      <span class="course-mini-icon" aria-hidden="true">${course.icon}</span>
      <span class="course-mini-info"><span class="eyebrow">${course.lessons} lessons</span><strong>${course.title}</strong><span class="progress-bar-mini"><span class="progress-fill" style="width:${progress}%"></span></span><span class="progress-text">${progress}% complete</span></span><span class="course-arrow" aria-hidden="true">›</span>
    </button>`).join('');

  container.innerHTML = `
    <section class="dashboard page">
      <div class="dashboard-greeting"><div><p class="eyebrow">YOUR LEARNING SPACE</p><h1>Good morning, ${stats.studentName || 'Asha'} &#128075;</h1><p>Small steps today make a real difference.</p></div><div id="connection-status-dashboard" class="inline-status"></div></div>
      <section class="continue-card"><div class="continue-card-top"><span class="eyebrow">CONTINUE LEARNING</span><span class="saved-label">Saved offline</span></div><div class="continue-content"><div class="continue-subject">${current?.course.title || 'Your first course'}</div><h2>${lesson?.title || 'Ready to start learning?'}</h2><div class="progress-row"><span>${current?.progress || 0}% complete</span><span>${current?.lessons.length || 0} lessons</span></div><div class="progress-bar progress-bar-lg"><div class="progress-fill" style="width:${current?.progress || 0}%"></div></div></div><button class="btn btn-primary" onclick="navigateTo('${lesson ? 'lesson' : 'courses'}', ${lesson ? `{lessonId:'${lesson.id}', courseId:'${current.course.id}'}` : '{}'})">${lesson ? 'Continue lesson' : 'Browse courses'} <span aria-hidden="true">→</span></button></section>
      <section class="dashboard-section"><div class="section-heading"><div><p class="eyebrow">MY COURSES</p><h2>Keep your momentum</h2></div><button class="text-action" onclick="navigateTo('courses')">View all</button></div><div class="courses-grid">${courseCards}</div></section>
      <section class="dashboard-section"><div class="section-heading"><div><p class="eyebrow">YOUR OFFLINE KIT</p><h2>Ready wherever you are</h2></div></div><div class="offline-kit"><div class="kit-item"><strong>${stats.downloadedCount}</strong><span>Downloaded lessons</span></div><div class="kit-item"><strong>${stats.quizCount}</strong><span>Available quizzes</span></div><div class="kit-item"><strong>${stats.completedLessons}</strong><span>Lessons completed</span></div><div class="kit-item"><strong id="pending-sync-count">${stats.pendingSync}</strong><span>Activities to sync</span></div></div></section>
      <section class="dashboard-section recent-activity"><div class="section-heading"><div><p class="eyebrow">RECENT ACTIVITY</p><h2>Your progress</h2></div></div><div class="activity-card"><span class="activity-mark"></span><div><strong>${stats.completedLessons ? `${stats.completedLessons} lessons completed` : 'Your learning journey starts here'}</strong><p>${stats.completedLessons ? 'Keep building a steady learning habit.' : 'Choose a course and take your first small step.'}</p></div></div><button class="btn btn-secondary btn-full" onclick="navigateTo('storage')">Manage offline downloads</button></section>
    </section>`;

  const status = document.getElementById('connection-status-dashboard');
  if (status) status.innerHTML = navigator.onLine
    ? '<span class="status-dot online"></span><span><strong>Online</strong><small>Everything is synced</small></span>'
    : '<span class="status-dot offline"></span><span><strong>Offline Mode</strong><small>Lessons are still available</small></span>';
}

async function renderCourses(container) {
  const courses = await getCourses();
  let html = `
    <section class="courses-page">
      <div class="page-header">
        <h1>Courses</h1>
        <div id="connection-status-courses"></div>
        <button class="btn btn-ghost" id="btn-sample-test">Try a quick test</button>
      </div>
      <div class="courses-grid">
  `;

  for (const course of courses) {
    const progress = await getCourseProgress(course.id);
    const downloaded = await getDownloadedLessons();
    const downloadedCount = downloaded.filter(d => d.courseId === course.id).length;

    html += `
      <div class="course-card" onclick="navigateTo('course-detail', {courseId: '${course.id}'})">
        <div class="course-header" style="background-color: ${course.color}">
          <div class="course-icon">${course.icon}</div>
          <div class="course-badge">${course.lessons} lessons</div>
        </div>
        <div class="course-body">
          <h3>${course.title}</h3>
          <p>${course.description}</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="course-meta">
            <span>${progress}% complete</span>
            <span>${downloadedCount} downloaded</span>
          </div>
        </div>
      </div>
    `;
  }

  html += '</div></section>';
  container.innerHTML = html;

  const coursesStatus = document.getElementById('connection-status-courses');
  if (coursesStatus) {
    if (navigator.onLine) {
      coursesStatus.innerHTML = '<span class="status-dot online"></span> Online';
    } else {
      coursesStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
    }
  }

  // sample test button
  const sampleBtn = document.getElementById('btn-sample-test');
  if (sampleBtn) sampleBtn.addEventListener('click', () => navigateTo('sample-test'));
}

async function renderSampleTest(container) {
  // a small attractive quick test embedded in the Learn screen
  const quiz = {
    id: 'sample-quick-test',
    title: 'Quick Practice Test',
    courseId: '',
    questions: [
      { id: 's-q1', text: 'What is 5 + 7?', options: ['10','11','12','13'], answer: '12' },
      { id: 's-q2', text: 'Capital of India?', options: ['Mumbai','Kolkata','New Delhi','Chennai'], answer: 'New Delhi' },
      { id: 's-q3', text: 'Which is a prime number?', options: ['4','6','9','7'], answer: '7' }
    ]
  };

  const containerInner = `
    <section class="quiz-page">
      <div class="page-header">
        <button class="btn btn-back" onclick="navigateTo('courses')">← Back</button>
        <h1>${quiz.title}</h1>
      </div>
      <div class="quiz-container" id="sample-quiz-container"></div>
    </section>
  `;

  container.innerHTML = containerInner;

  const state = { current: 0, answers: {}, submitted: false, score: 0 };

  function renderQuestion() {
    const q = quiz.questions[state.current];
    const selected = state.answers[q.id] || '';
    return `
      <div class="quiz-question">
        <div class="quiz-progress">
          <span>Question ${state.current + 1} of ${quiz.questions.length}</span>
          <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width: ${((state.current + 1) / quiz.questions.length) * 100}%"></div></div>
        </div>
        <h2>${q.text}</h2>
        <div class="quiz-options">
          ${q.options.map(opt => `
            <label class="quiz-option ${selected === opt ? 'selected' : ''}">
              <input type="radio" name="sample-answer" value="${opt}" ${selected === opt ? 'checked' : ''}>
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
        <div class="quiz-nav">
          <button class="btn btn-secondary" id="s-quiz-prev" ${state.current === 0 ? 'disabled' : ''}>Previous</button>
          ${state.current < quiz.questions.length - 1 ? `<button class="btn btn-primary" id="s-quiz-next">Next</button>` : `<button class="btn btn-success" id="s-quiz-submit">Submit</button>`}
        </div>
      </div>
    `;
  }

  function renderResult() {
    const total = quiz.questions.length;
    const score = state.score;
    const percentage = Math.round((score / total) * 100);
    return `
      <div class="quiz-result">
        <div class="result-icon">${percentage >= 70 ? '🎉' : '📚'}</div>
        <h2>Test Complete!</h2>
        <div class="result-score">${score} / ${total}</div>
        <div class="result-percentage">${percentage}%</div>
        <p class="result-message">${percentage >= 70 ? 'Great job! Keep going.' : 'Keep practicing — you can improve!'}</p>
        <button class="btn btn-primary" id="s-quiz-retry">Retake</button>
        <button class="btn btn-secondary" onclick="navigateTo('courses')">Back to Courses</button>
      </div>
    `;
  }

  function attach() {
    const containerEl = document.getElementById('sample-quiz-container');
    containerEl.innerHTML = state.submitted ? renderResult() : renderQuestion();

    if (!state.submitted) {
      const prev = containerEl.querySelector('#s-quiz-prev');
      const next = containerEl.querySelector('#s-quiz-next');
      const submit = containerEl.querySelector('#s-quiz-submit');

      if (prev) prev.addEventListener('click', () => { state.current--; attach(); });
      if (next) next.addEventListener('click', () => {
        const sel = containerEl.querySelector('input[name="sample-answer"]:checked');
        if (!sel) { showToast('Please select an answer', 'warning'); return; }
        state.answers[quiz.questions[state.current].id] = sel.value;
        state.current++; attach();
      });
      if (submit) submit.addEventListener('click', () => {
        const sel = containerEl.querySelector('input[name="sample-answer"]:checked');
        if (!sel) { showToast('Please select an answer', 'warning'); return; }
        state.answers[quiz.questions[state.current].id] = sel.value;
        let score = 0; quiz.questions.forEach(q => { if (state.answers[q.id] === q.answer) score++; });
        state.score = score; state.submitted = true; attach();
      });

      containerEl.querySelectorAll('input[name="sample-answer"]').forEach(input => {
        input.addEventListener('change', () => {
          containerEl.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
          input.closest('.quiz-option')?.classList.add('selected');
        });
      });
    } else {
      const retry = document.getElementById('s-quiz-retry');
      if (retry) retry.addEventListener('click', () => { state.current = 0; state.answers = {}; state.submitted = false; state.score = 0; attach(); });
    }
  }

  attach();
}

async function renderCourseDetail(container, courseId) {
  const course = await getCourseById(courseId);
  if (!course) {
    navigateTo('courses');
    return;
  }
  const lessons = await getLessonsByCourse(courseId);
  const downloaded = await getDownloadedLessons();
  const courseQuizzes = (await getAll('quizzes')).filter(quiz => quiz.courseId === courseId);
  const courseAssignments = (await getAll('assignments')).filter(assignment => assignment.courseId === courseId);
  const progress = await getCourseProgress(courseId);
  const progresses = await getAllLessonProgress();

  let lessonsHtml = '';
  for (const lesson of lessons) {
    const dl = downloaded.find(d => d.id === lesson.id);
    const lp = progresses.find(p => p.id === lesson.id);
    lessonsHtml += `
      <div class="lesson-item" data-lesson-id="${lesson.id}">
        <div class="lesson-info">
          <h4>${lesson.title}</h4>
          <span class="lesson-status">
            ${dl ? '<span class="badge badge-success">✓ Available Offline</span>' : ''}
            ${lp?.completed ? '<span class="badge badge-primary">Completed</span>' : ''}
            ${lp?.started && !lp?.completed ? '<span class="badge badge-warning">In Progress</span>' : ''}
          </span>
        </div>
        <div class="lesson-actions">
          <button class="btn btn-sm btn-primary btn-open-lesson" data-id="${lesson.id}">Open</button>
          <button class="btn btn-sm btn-secondary btn-download-lesson" data-id="${lesson.id}" ${dl ? 'disabled' : ''}>
            ${dl ? '✓ Saved' : 'Download'}
          </button>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <section class="course-detail">
      <div class="page-header">
        <button class="btn btn-back" onclick="navigateTo('courses')">← Back to Courses</button>
        <div id="connection-status-course"></div>
      </div>
      <div class="course-detail-header" style="border-left-color: ${course.color}">
        <div class="course-detail-icon">${course.icon}</div>
        <div>
          <h1>${course.title}</h1>
          <p>${course.description}</p>
        </div>
      </div>
      <div class="course-progress-section">
        <div class="progress-bar-large">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
        <span class="progress-text-large">${progress}% complete</span>
      </div>
      <div class="lessons-list">
        <h2>Lessons</h2>
        ${lessonsHtml}
      </div>
      <div class="learning-extras">
        <h2>Practice</h2>
        ${courseQuizzes.map(quiz => `<button class="lesson-item" onclick="navigateTo('quiz', {quizId: '${quiz.id}', courseId: '${courseId}'})"><span class="lesson-info"><h4>${quiz.title}</h4><span class="text-xs">Offline quiz</span></span><span class="course-arrow">›</span></button>`).join('')}
        ${courseAssignments.map(assignment => `<button class="lesson-item" onclick="navigateTo('assignment', {assignmentId: '${assignment.id}', courseId: '${courseId}'})"><span class="lesson-info"><h4>${assignment.title}</h4><span class="text-xs">Practice assignment</span></span><span class="course-arrow">›</span></button>`).join('')}
      </div>
    </section>
  `;

  const courseStatus = document.getElementById('connection-status-course');
  if (courseStatus) {
    if (navigator.onLine) {
      courseStatus.innerHTML = '<span class="status-dot online"></span> Online';
    } else {
      courseStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
    }
  }

  container.querySelectorAll('.btn-open-lesson').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      navigateTo('lesson', { lessonId: id, courseId });
    });
  });

  container.querySelectorAll('.btn-download-lesson').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const btnEl = e.target;
      try {
        btnEl.disabled = true;
        btnEl.textContent = 'Downloading...';
        await downloadLesson(id);
        showToast('✓ Available Offline', 'success');
        renderCourseDetail(container, courseId);
      } catch (err) {
        btnEl.disabled = false;
        btnEl.textContent = 'Download';
        showToast('Download failed. Please try again.', 'error');
      }
    });
  });
}

async function renderLesson(container, lessonId) {
  const courseId = currentCourseId;
  const downloaded = await getDownloadedLessonContent(lessonId);
  let lesson = null;

  if (downloaded && downloaded.offlineAvailable) {
    lesson = downloaded;
  } else {
    lesson = await getLessonById(lessonId);
  }

  if (!lesson) {
    showToast('Lesson not found', 'error');
    navigateTo('courses');
    return;
  }

  const course = courseId ? await getCourseById(courseId) : null;
  const allLessons = courseId ? await getLessonsByCourse(courseId) : [];
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  await startLesson(lessonId);

  container.innerHTML = `
    <section class="lesson-page">
      <div class="page-header">
        <button class="btn btn-back" onclick="navigateTo('course-detail', {courseId: '${courseId || ''}'})">← Back</button>
        <div id="connection-status-lesson"></div>
      </div>
      <article class="lesson-content">
        <div class="lesson-header">
          <h1>${lesson.title}</h1>
          ${course ? `<span class="lesson-course">${course.title}</span>` : ''}
          ${downloaded?.offlineAvailable ? '<span class="badge badge-success">✓ Available Offline</span>' : ''}
        </div>
        <div class="lesson-objectives">
          <h3>Learning Objectives</h3>
          <ul>
            ${lesson.objectives.map(o => `<li>${o}</li>`).join('')}
          </ul>
        </div>
        <div class="lesson-body">
          <h3>Content</h3>
          <p>${lesson.content}</p>
        </div>
        ${lesson.examples ? `
        <div class="lesson-examples">
          <h3>Examples</h3>
          <div class="examples-box">${lesson.examples}</div>
        </div>
        ` : ''}
        <div class="lesson-key-points">
          <h3>Key Points</h3>
          <ul>
            ${lesson.keyPoints.map(k => `<li>${k}</li>`).join('')}
          </ul>
        </div>
        <button class="btn btn-primary btn-full" id="complete-lesson">Mark lesson complete</button>
        <div class="lesson-navigation">
          ${prevLesson ? `<button class="btn btn-secondary" onclick="navigateTo('lesson', {lessonId: '${prevLesson.id}', courseId: '${courseId || ''}'})">← Previous</button>` : '<span></span>'}
          ${nextLesson ? `<button class="btn btn-primary" onclick="navigateTo('lesson', {lessonId: '${nextLesson.id}', courseId: '${courseId || ''}'})">Next →</button>` : '<span></span>'}
        </div>
      </article>
    </section>
  `;

  const lessonStatus = document.getElementById('connection-status-lesson');
  if (lessonStatus) {
    if (navigator.onLine) {
      lessonStatus.innerHTML = '<span class="status-dot online"></span> Online';
    } else {
      lessonStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
    }
  }
  document.getElementById('complete-lesson')?.addEventListener('click', async () => {
    await completeLesson(lessonId);
    await addToSyncQueue('LESSON_PROGRESS', lessonId);
    showToast('Lesson marked complete.', 'success');
  });
}

async function renderQuiz(container, quizId) {
  const quiz = await getQuizById(quizId);
  if (!quiz) {
    showToast('Quiz not found', 'error');
    navigateTo('courses');
    return;
  }

  const quizState = {
    current: 0,
    answers: {},
    submitted: false,
    score: 0
  };

  function renderQuestion() {
    const q = quiz.questions[quizState.current];
    const selected = quizState.answers[q.id] || '';
    return `
      <div class="quiz-question">
        <div class="quiz-progress">
          <span>Question ${quizState.current + 1} of ${quiz.questions.length}</span>
          <div class="quiz-progress-bar">
            <div class="quiz-progress-fill" style="width: ${((quizState.current + 1) / quiz.questions.length) * 100}%"></div>
          </div>
        </div>
        <h2>${q.text}</h2>
        <div class="quiz-options">
          ${q.options.map(opt => `
            <label class="quiz-option ${selected === opt ? 'selected' : ''}">
              <input type="radio" name="quiz-answer" value="${opt}" ${selected === opt ? 'checked' : ''}>
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
        <div class="quiz-nav">
          <button class="btn btn-secondary" id="quiz-prev" ${quizState.current === 0 ? 'disabled' : ''}>Previous</button>
          ${quizState.current < quiz.questions.length - 1 ?
            `<button class="btn btn-primary" id="quiz-next">Next</button>` :
            `<button class="btn btn-success" id="quiz-submit">Submit Quiz</button>`
          }
        </div>
      </div>
    `;
  }

  function renderResult() {
    const total = quiz.questions.length;
    const score = quizState.score;
    const percentage = Math.round((score / total) * 100);
    return `
      <div class="quiz-result">
        <div class="result-icon">${percentage >= 70 ? '🎉' : '📚'}</div>
        <h2>Quiz Complete!</h2>
        <div class="result-score">${score} / ${total}</div>
        <div class="result-percentage">${percentage}%</div>
        <p class="result-message">${percentage >= 70 ? 'Great job!' : 'Keep practicing!'}</p>
        <button class="btn btn-primary" id="quiz-retry">Retake Quiz</button>
        <button class="btn btn-secondary" onclick="navigateTo('course-detail', {courseId: '${quiz.courseId || currentCourseId || ''}'})">Back to Course</button>
      </div>
    `;
  }

  container.innerHTML = `
    <section class="quiz-page">
      <div class="page-header">
        <button class="btn btn-back" onclick="navigateTo('course-detail', {courseId: '${quiz.courseId || currentCourseId || ''}'})">← Back</button>
        <h1>${quiz.title}</h1>
      </div>
      <div class="quiz-container" id="quiz-container">
        ${quizState.submitted ? renderResult() : renderQuestion()}
      </div>
    </section>
  `;

  if (quizState.submitted) {
    container.querySelector('#quiz-retry').addEventListener('click', () => {
      quizState.current = 0;
      quizState.answers = {};
      quizState.submitted = false;
      quizState.score = 0;
      container.querySelector('#quiz-container').innerHTML = renderQuestion();
      attachQuizListeners();
    });
    return;
  }

  function attachQuizListeners() {
    const prevBtn = container.querySelector('#quiz-prev');
    const nextBtn = container.querySelector('#quiz-next');
    const submitBtn = container.querySelector('#quiz-submit');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        quizState.current--;
        container.querySelector('#quiz-container').innerHTML = renderQuestion();
        attachQuizListeners();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const selected = container.querySelector('input[name="quiz-answer"]:checked');
        if (!selected) {
          showToast('Please select an answer', 'warning');
          return;
        }
        const q = quiz.questions[quizState.current];
        quizState.answers[q.id] = selected.value;
        quizState.current++;
        container.querySelector('#quiz-container').innerHTML = renderQuestion();
        attachQuizListeners();
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const selected = container.querySelector('input[name="quiz-answer"]:checked');
        if (!selected) {
          showToast('Please select an answer', 'warning');
          return;
        }
        const q = quiz.questions[quizState.current];
        quizState.answers[q.id] = selected.value;
        let score = 0;
        quiz.questions.forEach(question => {
          if (quizState.answers[question.id] === question.answer) {
            score++;
          }
        });
        quizState.score = score;
        quizState.submitted = true;

        submitQuizResult(quiz.id, quizState.answers, score, quiz.questions.length).then(() => {
          container.querySelector('#quiz-container').innerHTML = renderResult();
          container.querySelector('#quiz-retry').addEventListener('click', () => {
            quizState.current = 0;
            quizState.answers = {};
            quizState.submitted = false;
            quizState.score = 0;
            container.querySelector('#quiz-container').innerHTML = renderQuestion();
            attachQuizListeners();
          });
        });
      });
    }

    container.querySelectorAll('input[name="quiz-answer"]').forEach(input => {
      input.addEventListener('change', () => {
        container.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
        input.closest('.quiz-option').classList.add('selected');
      });
    });
  }

  attachQuizListeners();
}

async function renderAssignment(container, assignmentId) {
  const assignment = await getAssignmentById(assignmentId);
  if (!assignment) {
    showToast('Assignment not found', 'error');
    navigateTo('courses');
    return;
  }

  let progress = await getAssignmentProgress(assignmentId);
  if (!progress) {
    progress = await startAssignment(assignmentId);
  }

  function renderAssignmentContent() {
    if (progress.completed) {
      return `
        <div class="assignment-completed">
          <div class="result-icon">✅</div>
          <h2>Assignment Completed!</h2>
          <p>You have completed this assignment.</p>
          <button class="btn btn-primary" onclick="navigateTo('course-detail', {courseId: '${assignment.courseId || currentCourseId || ''}'})">Back to Course</button>
        </div>
      `;
    }

    return `
      <div class="assignment-form">
        <h2>${assignment.title}</h2>
        <p class="assignment-instructions">${assignment.instructions}</p>
        <form id="assignment-form">
          ${assignment.tasks.map(task => `
            <div class="form-group">
              <label>${task.text}</label>
              <textarea name="task-${task.id}" rows="3" placeholder="Write your answer here..." required></textarea>
            </div>
          `).join('')}
          <button type="submit" class="btn btn-success btn-lg">Mark as Complete</button>
        </form>
      </div>
    `;
  }

  container.innerHTML = `
    <section class="assignment-page">
      <div class="page-header">
        <button class="btn btn-back" onclick="navigateTo('course-detail', {courseId: '${assignment.courseId || currentCourseId || ''}'})">← Back</button>
        <h1>${assignment.title}</h1>
      </div>
      <div class="assignment-container">
        ${renderAssignmentContent()}
      </div>
    </section>
  `;

  if (!progress.completed) {
    const form = container.querySelector('#assignment-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const answers = {};
        assignment.tasks.forEach(task => {
          const textarea = form.querySelector(`[name="task-${task.id}"]`);
          if (textarea) {
            answers[task.id] = textarea.value.trim();
          }
        });
        await completeAssignment(assignmentId, answers);
        progress = await getAssignmentProgress(assignmentId);
        showToast('Assignment completed!', 'success');
        container.querySelector('.assignment-container').innerHTML = renderAssignmentContent();
      });
    }
  }
}

async function renderSearch(container) {
  const downloaded = await getDownloadedLessons();

  container.innerHTML = `
    <section class="search-page">
      <div class="page-header">
        <h1>Search Lessons</h1>
        <div id="connection-status-search"></div>
      </div>
      <div class="search-box">
        <input type="text" id="search-input" placeholder="Search downloaded lessons...">
        <button class="btn btn-primary" id="search-btn">Search</button>
      </div>
      <div id="search-results" class="search-results">
        <p class="search-hint">Search works offline for downloaded lessons.</p>
      </div>
    </section>
  `;

  const searchStatus = document.getElementById('connection-status-search');
  if (searchStatus) {
    if (navigator.onLine) {
      searchStatus.innerHTML = '<span class="status-dot online"></span> Online';
    } else {
      searchStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
    }
  }

  function performSearch() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    if (!query) {
      resultsContainer.innerHTML = '<p class="search-hint">Enter a search term to find lessons.</p>';
      return;
    }
    const results = downloaded.filter(lesson => {
      return lesson.title.toLowerCase().includes(query) ||
        lesson.content.toLowerCase().includes(query) ||
        lesson.objectives.some(o => o.toLowerCase().includes(query));
    });

    if (results.length === 0) {
      resultsContainer.innerHTML = '<p class="search-hint">No downloaded lessons match your search.</p>';
      return;
    }

    resultsContainer.innerHTML = results.map(lesson => `
      <div class="search-result-item" data-id="${lesson.id}">
        <h4>${lesson.title}</h4>
        <span class="badge badge-success">✓ Available Offline</span>
        <p>${lesson.content.slice(0, 150)}...</p>
        <button class="btn btn-sm btn-primary btn-open-search-lesson" data-id="${lesson.id}">Open</button>
      </div>
    `).join('');

    resultsContainer.querySelectorAll('.btn-open-search-lesson').forEach(btn => {
      btn.addEventListener('click', () => {
        navigateTo('lesson', { lessonId: btn.dataset.id });
      });
    });
  }

  document.getElementById('search-btn').addEventListener('click', performSearch);
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
}

async function renderStorage(container) {
  const info = await getStorageInfo();
  const downloaded = await getDownloadedLessons();

  container.innerHTML = `
    <section class="storage-page">
      <div class="page-header">
        <h1>Offline Storage</h1>
        <div id="connection-status-storage"></div>
      </div>
      <div class="storage-info card">
        <h3>Storage Used</h3>
        <div class="progress-bar-large">
          <div class="progress-fill" style="width: ${info.quota ? Math.min((info.totalBytes / info.quota) * 100, 100) : 0}%"></div>
        </div>
        <p>${info.formattedUsage} used of ${info.formattedQuota}</p>
      </div>
      <div class="storage-stats">
        <div class="storage-stat">
          <span class="storage-stat-value">${info.lessonCount}</span>
          <span class="storage-stat-label">Downloaded Lessons</span>
        </div>
        <div class="storage-stat">
          <span class="storage-stat-value">${info.quizCount}</span>
          <span class="storage-stat-label">Quiz Results</span>
        </div>
        <div class="storage-stat">
          <span class="storage-stat-value">${info.assignmentCount}</span>
          <span class="storage-stat-label">Assignment Progress</span>
        </div>
      </div>
      <div class="storage-actions">
        <h3>Downloaded Lessons</h3>
        ${downloaded.length === 0 ? '<p>No downloaded lessons.</p>' : ''}
        <ul class="downloaded-list">
          ${downloaded.map(lesson => `
            <li class="downloaded-item">
              <div>
                <strong>${lesson.title}</strong>
                <small>Downloaded: ${new Date(lesson.downloadedAt).toLocaleDateString()}</small>
              </div>
              <button class="btn btn-sm btn-danger btn-delete-lesson" data-id="${lesson.id}">Delete</button>
            </li>
          `).join('')}
        </ul>
      </div>
      <div class="storage-actions">
        <h3>Settings</h3>
        <div class="setting-item">
          <label class="toggle-label">
            <input type="checkbox" id="low-data-toggle">
            <span>Low Data Mode</span>
          </label>
          <p class="setting-desc">Use lightweight content and avoid large images.</p>
        </div>
      </div>
    </section>
  `;

  const storageStatus = document.getElementById('connection-status-storage');
  if (storageStatus) {
    if (navigator.onLine) {
      storageStatus.innerHTML = '<span class="status-dot online"></span> Online';
    } else {
      storageStatus.innerHTML = '<span class="status-dot offline"></span> Offline';
    }
  }

  const lowDataToggle = document.getElementById('low-data-toggle');
  getLowDataMode().then(enabled => {
    lowDataToggle.checked = enabled;
  });
  lowDataToggle.addEventListener('change', async () => {
    await setLowDataMode(lowDataToggle.checked);
    showToast(lowDataToggle.checked ? 'Low Data Mode enabled' : 'Low Data Mode disabled', 'info');
  });

  container.querySelectorAll('.btn-delete-lesson').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      await removeDownloadedLesson(id);
      showToast('Lesson deleted from offline storage', 'info');
      renderStorage(container);
    });
  });
}

function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

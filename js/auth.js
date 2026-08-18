function localPasswordHash(password) {
  let hash = 2166136261;
  for (let index = 0; index < password.length; index++) {
    hash ^= password.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `local-${(hash >>> 0).toString(16)}`;
}

async function getCurrentStudent() {
  const session = await get('session', 'current');
  return session ? get('students', session.studentId) : null;
}

async function createStudentAccount({ name, studentId, email, password, class: studentClass }) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedId = studentId.trim();
  if (!name.trim() || !normalizedId || !normalizedEmail || !studentClass.trim()) throw new Error('Please complete every field.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) throw new Error('Enter a valid email address.');
  if (password.length < 6) throw new Error('Use a password with at least 6 characters.');
  const students = await getAll('students');
  if (students.some(student => student.email === normalizedEmail)) throw new Error('An account with this email already exists on this device.');
  if (students.some(student => student.studentId === normalizedId)) throw new Error('This Student ID already exists on this device.');
  const student = { id: `student-${Date.now()}`, name: name.trim(), studentId: normalizedId, email: normalizedEmail, class: studentClass.trim(), passwordHash: localPasswordHash(password), createdAt: new Date().toISOString() };
  await put('students', student);
  await put('session', { id: 'current', studentId: student.id, signedInAt: new Date().toISOString() });
  return student;
}

async function loginStudent(identifier, password) {
  const value = identifier.trim().toLowerCase();
  const students = await getAll('students');
  const student = students.find(item => item.email === value || item.studentId.toLowerCase() === value);
  if (!student || student.passwordHash !== localPasswordHash(password)) throw new Error('Incorrect email or Student ID, or password.');
  await put('session', { id: 'current', studentId: student.id, signedInAt: new Date().toISOString() });
  return student;
}

async function logoutStudent() { await deleteItem('session', 'current'); }

async function updateCurrentStudent(changes) {
  const student = await getCurrentStudent();
  if (!student) throw new Error('Please log in first.');
  const updated = { ...student, ...changes, email: changes.email ? changes.email.trim().toLowerCase() : student.email, updatedAt: new Date().toISOString() };
  await put('students', updated);
  return updated;
}

function getAssignmentById(id) {
  return get('assignments', id);
}

function startAssignment(assignmentId) {
  return new Promise((resolve, reject) => {
    const progress = {
      id: 'ap-' + assignmentId,
      assignmentId,
      started: true,
      startedAt: new Date().toISOString(),
      completed: false,
      completedAt: null,
      answers: {}
    };
    put('assignmentProgress', progress)
      .then((res) => addToSyncQueue('ASSIGNMENT_PROGRESS', res.id))
      .then(() => resolve(progress))
      .catch(reject);
  });
}

function completeAssignment(assignmentId, answers) {
  return new Promise((resolve, reject) => {
    const progress = {
      id: 'ap-' + assignmentId,
      assignmentId,
      started: true,
      startedAt: new Date().toISOString(),
      completed: true,
      completedAt: new Date().toISOString(),
      answers
    };
    put('assignmentProgress', progress)
      .then((res) => addToSyncQueue('ASSIGNMENT_PROGRESS', res.id))
      .then(() => resolve(progress))
      .catch(reject);
  });
}

function getAssignmentProgress(assignmentId) {
  return get('assignmentProgress', 'ap-' + assignmentId);
}

function getAllAssignmentProgress() {
  return getAll('assignmentProgress');
}

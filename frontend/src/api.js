const BASE = '/api';

function token() {
  return localStorage.getItem('ros_token');
}

function headers() {
  return {
    'Content-Type': 'application/json',
    ...(token() ? { Authorization: `Bearer ${token()}` } : {})
  };
}

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
}

export const api = {
  login: (username, password) => req('POST', '/auth/login', { username, password }),
  changePassword: (currentPassword, newPassword) => req('POST', '/auth/change-password', { currentPassword, newPassword }),

  getUsers: () => req('GET', '/users'),
  createUser: (body) => req('POST', '/users', body),
  deleteUser: (id) => req('DELETE', `/users/${id}`),

  getCompany: () => req('GET', '/company'),
  updateCompany: (body) => req('PUT', '/company', body),

  getAssessments: () => req('GET', '/assessments'),
  createAssessment: (body) => req('POST', '/assessments', body),
  deleteAssessment: (id) => req('DELETE', `/assessments/${id}`),

  getStats: () => req('GET', '/stats'),
};

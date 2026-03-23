const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('REACT_APP_API_BASE_URL 환경변수가 설정되어 있지 않습니다.');
}

function getStoredUser() {
  try {
    const user = localStorage.getItem('nearpet-user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
}

async function request(path, options = {}) {
  const user = getStoredUser();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  if (user?.id) {
    headers['X-User-Id'] = String(user.id);
  }

  if (user?.role) {
    headers['X-User-Role'] = user.role;
  }

  if (user?.username) {
    headers['X-Username'] = user.username;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = new Error(body?.message || '요청 처리에 실패했습니다.');
    error.status = response.status;
    throw error;
  }

  return body;
}

export { API_BASE_URL, getStoredUser, request };

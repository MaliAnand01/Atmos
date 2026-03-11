// authStore.js - Simplified localStorage-based auth state manager

/**
 * Stores the user object and base64 credentials in localStorage.
 * user: { id, username, email, role }
 * credentials: base64(username:password) or just a mock token
 */
export const saveAuth = (user) => {
  localStorage.setItem('atmos_user', JSON.stringify(user));
  // We already store atmos_token in AuthModal during login for Basic auth header
};

export const getUser = () => {
  const user = localStorage.getItem('atmos_user');
  return user ? JSON.parse(user) : null;
};

export const getRole = () => {
  const user = getUser();
  return user ? user.role : null;
};

export const isLoggedIn = () => {
  return !!localStorage.getItem('atmos_user');
};

export const logout = () => {
  localStorage.removeItem('atmos_user');
  localStorage.removeItem('atmos_token'); // Clear the Basic Auth token too
  window.location.href = '/'; // Redirect to home
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('atmos_token');
  return token ? `Basic ${token}` : '';
};

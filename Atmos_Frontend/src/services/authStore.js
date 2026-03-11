// LocalStorage Auth State Manager

/** Save user session */
export const saveAuth = (user) => {
  localStorage.setItem('atmos_user', JSON.stringify(user));
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

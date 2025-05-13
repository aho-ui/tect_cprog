export const getAccessToken = () => {
  const token = localStorage.getItem('access');
  return token || null;
};

export const isLoggedIn = () => {
  return !!getAccessToken();
};

export const logout = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
};

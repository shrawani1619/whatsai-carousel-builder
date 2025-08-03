// Get the access token from storage
export const getAccessToken = async (): Promise<string> => {
  // Check if token exists in localStorage/sessionStorage
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  
  if (token) {
    return token;
  }
  
  throw new Error('No access token found. Please log in.');
};

// Set the access token in storage
export const setAccessToken = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    localStorage.setItem('access_token', token);
  } else {
    sessionStorage.setItem('access_token', token);
  }
};

// Remove the access token from storage
export const removeAccessToken = (): void => {
  localStorage.removeItem('access_token');
  sessionStorage.removeItem('access_token');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!(localStorage.getItem('access_token') || sessionStorage.getItem('access_token'));
};

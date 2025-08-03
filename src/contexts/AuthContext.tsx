import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { removeAccessToken } from '@/utils/auth';
import { getApiUrl } from '@/config';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    console.log('Attempting login with email:', email);
    
    try {
      // Log the request being made
      const loginUrl = getApiUrl('auth/login');
      console.log('Sending login request to:', loginUrl);

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      console.log('Login response status:', response.status);
      
      // Try to parse the response even if it's not OK
      let responseData;
      try {
        responseData = await response.json();
        console.log('Login response data:', responseData);
      } catch (parseError) {
        console.error('Failed to parse login response:', parseError);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        // Log detailed error information
        console.error('Login failed with status:', response.status);
        console.error('Error details:', responseData);
        
        // Provide more specific error messages based on status code
        if (response.status === 401) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (response.status === 400) {
          throw new Error('Invalid request. Please check your input and try again.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(responseData.detail || 'Login failed. Please try again.');
        }
      }

      // If we get here, the login was successful
      console.log('Login successful, user data:', responseData);
      
      // Set user data from API response
      const user = {
        id: responseData.id || responseData.user_id,
        email: responseData.email || email,
        name: responseData.user_name || responseData.name || email.split('@')[0]
      };
      
      if (!user.id) {
        console.error('No user ID in response:', responseData);
        throw new Error('Invalid user data received from server');
      }
      
      // Store the access token if provided by the API
      if (responseData.access_token) {
        console.log('Storing access token in localStorage');
        localStorage.setItem('access_token', responseData.access_token);
      } else {
        console.warn('No access token in login response');
      }
      
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User logged in successfully:', user);
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('auth/signup'), {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: name,
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const userData = await response.json();
      console.log('userData from backend (register):', userData);
      // Set user data from API response
      const user = {
        id: userData.id || userData.user_id,
        email: userData.email || email,
        name: userData.user_name || name
      };
      if (!user.id) throw new Error('No user ID returned from backend');
      // Store the access token if provided by the API
      if (userData.access_token) {
        localStorage.setItem('access_token', userData.access_token);
      }
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    removeAccessToken();
  };

  const getAccessToken = (): string | null => {
    return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    getAccessToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
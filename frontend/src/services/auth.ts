import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Register a new user
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/register`, credentials);
  return response.data;
};

// Login user
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  return response.data;
};

// Set token in localStorage and axios headers
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Remove token from localStorage and axios headers
export const removeToken = (): void => {
  localStorage.removeItem('token');
  delete axios.defaults.headers.common['Authorization'];
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return localStorage.getItem('token') !== null;
};

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem('user');
  return userJson ? JSON.parse(userJson) : null;
};

// Set user in localStorage
export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
};

// Remove user from localStorage
export const removeUser = (): void => {
  localStorage.removeItem('user');
};

// Initialize auth state from localStorage
export const initializeAuth = (): void => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

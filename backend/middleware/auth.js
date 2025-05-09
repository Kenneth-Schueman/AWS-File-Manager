import jwt from 'jsonwebtoken';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secret key for JWT
const JWT_SECRET = 'aws-file-manager-secret-key';

// Users data file path
const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Ensure data directory exists
fs.ensureDirSync(path.join(__dirname, '..', 'data'));

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeJSONSync(USERS_FILE, []);
}

// Read users from file
export const getUsers = () => {
  try {
    return fs.readJSONSync(USERS_FILE);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

// Write users to file
export const saveUsers = (users) => {
  try {
    fs.writeJSONSync(USERS_FILE, users);
  } catch (error) {
    console.error('Error writing users file:', error);
  }
};

// Middleware to authenticate token
export const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1d' });
};

// Get user by ID
export const getUserById = (userId) => {
  const users = getUsers();
  return users.find(user => user.id === userId);
};

// Get user by email
export const getUserByEmail = (email) => {
  const users = getUsers();
  return users.find(user => user.email === email);
};

// Create a new user
export const createUser = (userData) => {
  const users = getUsers();
  users.push(userData);
  saveUsers(users);
  return userData;
};

// Update user
export const updateUser = (userId, userData) => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === userId);
  
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    saveUsers(users);
    return users[index];
  }
  
  return null;
};

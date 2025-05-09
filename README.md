# AWS File Manager

A local file manager with a web interface similar to Google Drive. This application allows you to:

- Upload files
- Create directories
- Star/favorite files and directories
- Share files with others
- Download files

## Project Structure

- `frontend/`: React application with TypeScript
- `backend/`: Node.js Express server

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm run dev
   ```

The server will run on http://localhost:5000

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

The frontend will run on http://localhost:5173

## Features

### File Management
- Upload files (drag and drop supported)
- Create new directories
- Navigate through directory structure
- Delete files and directories

### Organization
- Star important files and directories
- View all starred items in one place

### Sharing
- Generate shareable links for files
- Access shared files via links

## Technical Details

### Backend
- Node.js with Express
- File storage on local filesystem
- RESTful API for file operations

### Frontend
- React with TypeScript
- Modern UI with responsive design
- Material UI components for consistent styling

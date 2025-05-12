# AWS File Manager

A modern file management service similar to Google Drive, built to run on AWS serverless architecture.

## Features

- **File Management**: Upload, download, and organize files
- **Folder Structure**: Create and manage hierarchical folder structures
- **Sharing Capabilities**: Share files with customizable permissions
- **Preview Support**: Preview common file types directly in the browser
- **Search**: Powerful search functionality across your files and folders
- **Secure Authentication**: User authentication and authorization

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI component library
- React Router for navigation
- Redux for state management

### Backend
- Node.js with Express
- TypeScript for type safety
- RESTful API architecture

### AWS Services
- **Storage**: Amazon S3
- **Authentication**: Amazon Cognito
- **Database**: Amazon DynamoDB
- **Deployment**: AWS Amplify
- **API Gateway**: For RESTful endpoints

## Project Structure

```
aws-file-manager/
├── frontend/           # React frontend application
│   ├── public/         # Static files
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── config/     # Configuration files for AWS and app settings
│   │   ├── context/    # React context providers
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services and external integrations
│   │   ├── App.tsx     # Main application component
│   │   └── index.tsx   # Application entry point
│   ├── package.json    # Dependencies and scripts
│   └── tsconfig.json   # TypeScript configuration
└── backend/            # Node.js Express backend
    ├── src/
    │   ├── config/     # Configuration files for AWS and app settings
    │   ├── controllers/ # Request handlers for API endpoints
    │   ├── middleware/ # Express middleware (auth, error handling, uploads)
    │   ├── routes/     # API route definitions
    │   ├── services/   # Business logic and AWS service interactions
    │   ├── types/      # TypeScript type definitions
    │   ├── utils/      # Utility functions
    │   ├── app.ts      # Express application setup
    │   └── server.ts   # Server entry point
    ├── .env            # Environment variables (not in version control)
    ├── package.json    # Dependencies and scripts
    └── tsconfig.json   # TypeScript configuration
```

## Backend Implementation

### Setting Up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure AWS credentials:
   - Create a `.env` file in the backend directory
   - Add your AWS credentials and configuration:
     ```
     PORT=3001
     NODE_ENV=development
     AWS_REGION=us-east-1
     AWS_ACCESS_KEY_ID=your_access_key_id
     AWS_SECRET_ACCESS_KEY=your_secret_access_key
     S3_BUCKET_NAME=your-s3-bucket-name
     CORS_ORIGIN=http://localhost:3000
     ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### API Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/api/files` | GET | List files in a directory | `{ prefix?: string }` | Array of file objects |
| `/api/files/upload` | POST | Upload a file | Multipart form data | Uploaded file object |
| `/api/files/folder` | POST | Create a new folder | `{ name: string, path?: string }` | Created folder object |
| `/api/files/:key` | DELETE | Delete a file or folder | - | Success message |
| `/api/files/download/:key` | GET | Get download URL for a file | - | URL string |
| `/api/files/share/:key` | GET | Get share URL for a file | - | URL string |

## Frontend Implementation

The frontend is built with React and TypeScript, providing a clean and intuitive user interface for managing files.

### Setting Up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the frontend directory
   - Add your API endpoint:
     ```
     REACT_APP_API_URL=http://localhost:3001/api
     ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

## AWS Integration Details

### Amazon S3
- Used for storing and retrieving files
- Configured with proper CORS settings to allow browser uploads
- Lifecycle policies can be configured for cost optimization

### Amazon Cognito
- Manages user authentication and authorization
- Provides secure token-based authentication
- Integrates with social identity providers (Google, Facebook, etc.)

### Amazon DynamoDB
- Stores file metadata and user permissions
- Schema optimized for quick retrieval of file listings
- Supports searching and filtering capabilities

## Deployment Guide

### Deploying with AWS Amplify

1. Initialize Amplify in your project:
   ```bash
   amplify init
   ```

2. Add hosting:
   ```bash
   amplify add hosting
   ```

3. Deploy the application:
   ```bash
   amplify publish
   ```

### Alternative Deployment Options

- **Frontend**: Deploy to S3 + CloudFront for a scalable static website
- **Backend**: Deploy to AWS Elastic Beanstalk or as serverless functions with AWS Lambda + API Gateway

## Development

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- AWS account with appropriate permissions
- AWS CLI configured locally

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/aws-file-manager.git
   cd aws-file-manager
   ```

2. Install dependencies and start both frontend and backend:
   ```bash
   # In one terminal
   cd backend
   npm install
   npm run dev
   
   # In another terminal
   cd frontend
   npm install
   npm start
   ```

3. Access the application at http://localhost:3000

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- [AWS Documentation](https://docs.aws.amazon.com/)
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express Documentation](https://expressjs.com/)
- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)

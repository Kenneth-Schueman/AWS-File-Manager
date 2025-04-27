import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  port: number;
  nodeEnv: string;
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    s3BucketName: string;
  };
  cors: {
    origin: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3BucketName: process.env.S3_BUCKET_NAME || '',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },
};

export default config;

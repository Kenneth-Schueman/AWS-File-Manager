import AWS from 'aws-sdk';
import config from './config';

// Configure AWS SDK with credentials from environment variables
AWS.config.update({
  region: config.aws.region,
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
});

// Create S3 service object
const s3 = new AWS.S3();

export { s3 };

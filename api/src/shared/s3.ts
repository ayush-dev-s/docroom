import AWS from 'aws-sdk';
import { config } from './config.js';

export const s3 = new AWS.S3({
  endpoint: config.S3_ENDPOINT,
  region: config.S3_REGION,
  accessKeyId: config.S3_ACCESS_KEY,
  secretAccessKey: config.S3_SECRET_KEY,
  s3ForcePathStyle: config.S3_USE_PATH_STYLE,
  signatureVersion: 'v4',
});
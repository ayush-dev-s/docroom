export const config = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/docroom',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret',
  S3_ENDPOINT: process.env.S3_ENDPOINT,
  S3_REGION: process.env.S3_REGION || 'us-east-1',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
  S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  S3_BUCKET: process.env.S3_BUCKET || 'docroom',
  S3_USE_PATH_STYLE: process.env.S3_USE_PATH_STYLE === 'true',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
export default {
  BASE_URL: process.env.BASE_URL || '',
  EXTENSION: '.mp3',
  DOWNLOAD_DIR: 'tmp',
  BUCKET_NAME: 'better-zoo',
  MAX_ATTEMPTS: process.env.MAX_ATTEMPTS || 3,
  RETRY_INTERVAL_DOWNLOAD: process.env.RETRY_INTERVAL_DOWNLOAD || 15,
  RETRY_INTERVAL_CONVERSION: process.env.RETRY_INTERVAL_CONVERSION || 5
}

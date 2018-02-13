export default {
  BASE_URL: process.env.BASE_URL || '',
  EXTENSION: '.mp3',
  DOWNLOAD_DIR: 'tmp',
  BUCKET_NAME: 'better-zoo',
  MAX_ATTEMPTS: 3,
  RETRY_INTERVAL: 900
}

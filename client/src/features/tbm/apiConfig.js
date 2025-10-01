const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://your-production-tbm-api-url' // TODO: Add production URL
  : 'http://localhost:5287';

export default API_BASE_URL;

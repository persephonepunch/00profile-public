// Load environment variables from .env file
require('dotenv').config();

// Environment variables exposed to Eleventy templates
// Only include PUBLIC keys here - never expose secrets to client-side code

module.exports = function() {
  return {
    // Uploadcare public key (safe to expose - it's meant for client-side)
    UPLOADCARE_PUBLIC_KEY: process.env.UPLOADCARE_PUBLIC_KEY || '',

    // Xano API base URL (public endpoint for stories)
    XANO_API_BASE_URL: process.env.XANO_API_BASE_URL || '',

    // Xano Auth API URL (for authentication endpoints)
    XANO_AUTH_API_URL: process.env.XANO_AUTH_API_URL || '',

    // Auth0 public config (DEPRECATED - migrating to Xano Auth)
    // AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || '',
    // AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '',

    // Environment indicator
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
};

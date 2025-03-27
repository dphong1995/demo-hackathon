/**
 * Configuration file for test environment
 * Contains centralized configuration for all tests
 */

export const config = {
  // Base URL for application
  baseUrl: process.env.DOMAIN || 'https://staging.study.talosix.com',
  
  // Login credentials
  credentials: {
    username: process.env.USERNAME || 'talosix.qa+amxdo@gmail.com',
    password: process.env.PASSWORD || 'T@losix91'
  },
  
  // Study information
  study: {
    name: '3 Xuan Testing',
    siteName: 'Site 1'
  },
  
  // Timeouts
  timeouts: {
    navigation: 15000,
    element: 10000,
    action: 5000
  }
};

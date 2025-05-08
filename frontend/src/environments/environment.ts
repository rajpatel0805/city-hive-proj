export const environment = {
  production: false,
  apiUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : `https://city-hive-proj-production.up.railway.app`
}; 
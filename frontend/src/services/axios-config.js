import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // Add the base URL for all requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000, // 10 second timeout for all requests
  withCredentials: false // Set to false for cross-domain requests without credentials
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  config => {
    console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    
    // Don't add token here anymore, it's handled by authHeader
    // This ensures we don't have duplicate Authorization headers
    
    // Add cache-busting for GET requests to prevent browser caching
    if (config.method.toLowerCase() === 'get') {
      // Add timestamp parameter to URL
      const separator = config.url.includes('?') ? '&' : '?';
      config.url = `${config.url}${separator}_t=${Date.now()}`;
      console.log(`Added cache-busting to URL: ${config.url}`);
    }
    
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  response => {
    console.log(`✅ Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  error => {
    if (error?.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`❌ Error ${error.response.status} from ${error.config?.url}:`, 
                    error.response.data?.message || error.response.data);
      
      // Handle authentication errors
      if (error.response.status === 401 || error.response.status === 403) {
        console.error("Authentication error - redirecting to login");
        
        // Add a user-friendly message
        error.authError = "Your session has expired. Please login again.";
        
        // Clear user data from localStorage
        try {
          localStorage.removeItem('user');
          console.log("Cleared user data from localStorage due to auth error");
          
          // Reload the page after a short delay if not in development mode
          if (process.env.NODE_ENV !== 'development') {
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
          }
        } catch (err) {
          console.error("Error clearing user data:", err);
        }
      }
    } else if (error?.request) {
      // The request was made but no response was received
      console.error(`❌ No response received for ${error.config?.method} ${error.config?.url}`);
      console.error('Request timeout or network issue');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('❌ Error:', error?.message || 'Unknown error');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 
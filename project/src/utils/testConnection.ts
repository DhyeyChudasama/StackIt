const API_BASE_URL = 'http://localhost:5000/api';

export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    const healthData = await healthResponse.json();
    
    console.log('Backend health check:', healthData);
    
    if (healthResponse.ok) {
      console.log('✅ Backend is running and accessible');
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    return false;
  }
}; 
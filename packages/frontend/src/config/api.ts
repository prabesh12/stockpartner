export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchHealth = async () => {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

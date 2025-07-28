import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// Named export for fetch compatibility
export async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

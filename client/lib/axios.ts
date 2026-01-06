import axios from 'axios';
import { getSession } from 'next-auth/react';

// Client-side instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  async (config) => {
    // Note: getSession only works client-side. 
    // For server-side, we pass headers manually.
    if (typeof window !== 'undefined') {
      const session = await getSession();
      if (session?.user?.accessToken) {
        config.headers['Authorization'] = `Bearer ${session.user.accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh (Optional/Advanced)
// For simple usage, we just logout on 401. 
// Ideally we call Django's refresh endpoint here.

export default api;

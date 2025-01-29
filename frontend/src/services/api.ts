import axios from 'axios';
import { ActivityCategory, NewActivityCategory, UpdateActivityCategory } from '../types/activity';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const apiService = axios.create({
  baseURL,
  timeout: 30000, // Increase timeout for large audio files
  headers: {
    'Accept': 'application/json'
  }
});

// Add interceptor for error handling
apiService.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Backend server is not accessible. Please ensure the server is running at:', 
        process.env.REACT_APP_API_URL || 'http://localhost:3001');
    }
    return Promise.reject(error);
  }
);

// Add request interceptor to handle FormData
apiService.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    // Let the browser set the Content-Type header with boundary
    delete config.headers['Content-Type'];
  }
  return config;
});

// Create a wrapper object with all API methods
export const api = {
  // Categories
  getCategories: () => apiService.get<ActivityCategory[]>('/categories').then(res => res.data),
  createCategory: (category: NewActivityCategory) => apiService.post<ActivityCategory>('/categories', category).then(res => res.data),
  updateCategory: (id: string, category: UpdateActivityCategory) => apiService.put<ActivityCategory>(`/categories/${id}`, category).then(res => res.data),
  deleteCategory: (id: string) => apiService.delete(`/categories/${id}`).then(res => res.data),

  // Recordings
  getDailyRecordings: (date: string) => apiService.get(`/recordings/daily/${date}`).then(res => res.data),
  getMonthlyReport: (year: number, month: number) => apiService.get(`/recordings/monthly/${year}/${month}`).then(res => res.data),
  saveRecording: (formData: FormData) => apiService.post('/recordings', formData).then(res => res.data)
};
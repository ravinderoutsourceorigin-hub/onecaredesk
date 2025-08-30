import axios from 'axios';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://onecaredesk.onrender.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // In development, use dummy token for testing
    const token = localStorage.getItem('authToken') || 'dummy-token';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/auth';
    }
    
    // Log error for debugging
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    return Promise.reject(error);
  }
);

// API helper functions
export const api = {
  // Authentication
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    refresh: (token) => apiClient.post('/auth/refresh', { token }),
  },

  // Users
  users: {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data) => apiClient.put('/users/profile', data),
    getAll: () => apiClient.get('/users'),
  },

  // Agencies
  agencies: {
    getAll: () => apiClient.get('/agencies'),
    create: (data) => apiClient.post('/agencies', data),
    update: (id, data) => apiClient.put(`/agencies/${id}`, data),
    delete: (id) => apiClient.delete(`/agencies/${id}`),
  },

  // Leads
  leads: {
    getAll: () => apiClient.get('/leads'),
    create: (data) => apiClient.post('/leads', data),
    update: (id, data) => apiClient.put(`/leads/${id}`, data),
    delete: (id) => apiClient.delete(`/leads/${id}`),
    getById: (id) => apiClient.get(`/leads/${id}`),
  },

  // Patients
  patients: {
    getAll: () => apiClient.get('/patients'),
    create: (data) => apiClient.post('/patients', data),
    update: (id, data) => apiClient.put(`/patients/${id}`, data),
    delete: (id) => apiClient.delete(`/patients/${id}`),
    getById: (id) => apiClient.get(`/patients/${id}`),
  },

  // Caregivers
  caregivers: {
    getAll: () => apiClient.get('/caregivers'),
    create: (data) => apiClient.post('/caregivers', data),
    update: (id, data) => apiClient.put(`/caregivers/${id}`, data),
    delete: (id) => apiClient.delete(`/caregivers/${id}`),
    getById: (id) => apiClient.get(`/caregivers/${id}`),
  },

  // Documents
  documents: {
    getAll: () => apiClient.get('/documents'),
    create: (data) => apiClient.post('/documents', data),
    update: (id, data) => apiClient.put(`/documents/${id}`, data),
    delete: (id) => apiClient.delete(`/documents/${id}`),
    getById: (id) => apiClient.get(`/documents/${id}`),
    upload: (file, onProgress) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onProgress,
      });
    },
  },

  // Signatures
  signatures: {
    getAll: () => apiClient.get('/signatures'),
    create: (data) => apiClient.post('/signatures', data),
    update: (id, data) => apiClient.put(`/signatures/${id}`, data),
    delete: (id) => apiClient.delete(`/signatures/${id}`),
    getById: (id) => apiClient.get(`/signatures/${id}`),
  },

  // Appointments
  appointments: {
    getAll: () => apiClient.get('/appointments'),
    create: (data) => apiClient.post('/appointments', data),
    update: (id, data) => apiClient.put(`/appointments/${id}`, data),
    delete: (id) => apiClient.delete(`/appointments/${id}`),
    getById: (id) => apiClient.get(`/appointments/${id}`),
  },

  // Configurations
  configurations: {
    getAll: () => apiClient.get('/configurations'),
    save: (data) => apiClient.post('/configurations', data),
    getByKey: (key) => apiClient.get(`/configurations/${key}`),
  },

  // Tasks
  tasks: {
    getAll: () => apiClient.get('/tasks'),
    create: (data) => apiClient.post('/tasks', data),
    update: (id, data) => apiClient.put(`/tasks/${id}`, data),
    delete: (id) => apiClient.delete(`/tasks/${id}`),
    getById: (id) => apiClient.get(`/tasks/${id}`),
  },

  // Health check
  health: () => apiClient.get('/health'),
};

export default apiClient;

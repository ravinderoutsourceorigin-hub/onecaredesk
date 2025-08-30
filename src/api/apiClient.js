// API client for authenticated requests to the backend
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

const API_BASE_URL = 'http://localhost:5000/api';

// Get authentication headers
const getAuthHeaders = () => {
  // For development, use dummy token
  if (process.env.NODE_ENV === 'development' || true) {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer dummy-token'
    };
  }
  
  // In production, this would get the actual Kinde token
  // const { getToken } = useKindeAuth();
  // const token = getToken();
  // return {
  //   'Content-Type': 'application/json',
  //   'Authorization': `Bearer ${token}`
  // };
  
  return {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer dummy-token'
  };
};

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders();
  
  const config = {
    headers,
    ...options
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Agency API
export const AgencyAPI = {
  list: (sortParam) => apiRequest('/agencies').then(data => data.agencies || []), // Return just the agencies array
  create: (data) => apiRequest('/agencies', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/agencies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/agencies/${id}`, {
    method: 'DELETE'
  }),
  get: (id) => apiRequest(`/agencies/${id}`)
};

// Appointments API
export const AppointmentAPI = {
  list: () => apiRequest('/appointments'),
  create: (data) => apiRequest('/appointments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/appointments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/appointments/${id}`, {
    method: 'DELETE'
  }),
  get: (id) => apiRequest(`/appointments/${id}`)
};

// Caregivers API
export const CaregiverAPI = {
  list: () => apiRequest('/caregivers'),
  create: (data) => apiRequest('/caregivers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/caregivers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/caregivers/${id}`, {
    method: 'DELETE'
  }),
  get: (id) => apiRequest(`/caregivers/${id}`)
};

// Signatures API
export const SignatureAPI = {
  list: () => apiRequest('/signatures'),
  create: (data) => apiRequest('/signatures', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/signatures/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/signatures/${id}`, {
    method: 'DELETE'
  }),
  get: (id) => apiRequest(`/signatures/${id}`)
};

// Configurations API
export const ConfigurationAPI = {
  list: () => apiRequest('/configurations'),
  create: (data) => apiRequest('/configurations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/configurations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/configurations/${id}`, {
    method: 'DELETE'
  }),
  get: (id) => apiRequest(`/configurations/${id}`)
};

// Leads API (when needed)
export const LeadAPI = {
  list: () => apiRequest('/leads'),
  create: (data) => apiRequest('/leads', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/leads/${id}`, {
    method: 'DELETE'
  }),
  get: (id) => apiRequest(`/leads/${id}`)
};

// Patients API (when needed)
export const PatientAPI = {
  list: () => apiRequest('/patients'),
  create: (data) => apiRequest('/patients', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/patients/${id}`, {
    method: 'DELETE'
  }),
  get: (id) => apiRequest(`/patients/${id}`)
};

// Documents API (when needed)
export const DocumentAPI = {
  list: () => apiRequest('/documents'),
  create: (data) => apiRequest('/documents', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/documents/${id}`, {
    method: 'DELETE'
  }),
  get: (id) => apiRequest(`/documents/${id}`)
};

// Tasks API (when needed)
export const TaskAPI = {
  list: () => apiRequest('/tasks'),
  create: (data) => apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, data) => apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/tasks/${id}`, {
    method: 'DELETE'
  }),
  get: (id) => apiRequest(`/tasks/${id}`)
};

export default {
  Agency: AgencyAPI,
  Appointment: AppointmentAPI,
  Caregiver: CaregiverAPI,
  Signature: SignatureAPI,
  Configuration: ConfigurationAPI,
  Lead: LeadAPI,
  Patient: PatientAPI,
  Document: DocumentAPI,
  Task: TaskAPI
};

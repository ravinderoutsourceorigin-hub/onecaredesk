import { api } from './client.js';

// Enhanced error handling
const handleApiError = (error, operation) => {
  console.error(`Error in ${operation}:`, error);
  
  if (error.response?.data?.message) {
    throw new Error(error.response.data.message);
  } else if (error.message) {
    throw new Error(error.message);
  } else {
    throw new Error(`Failed to ${operation}`);
  }
};

// Lead Management Functions
export const leadAPI = {
  async getAll() {
    try {
      const response = await api.leads.getAll();
      return response.data.leads || [];
    } catch (error) {
      handleApiError(error, 'fetch leads');
    }
  },

  async create(leadData) {
    try {
      const response = await api.leads.create(leadData);
      return response.data.lead;
    } catch (error) {
      handleApiError(error, 'create lead');
    }
  },

  async update(id, leadData) {
    try {
      const response = await api.leads.update(id, leadData);
      return response.data.lead;
    } catch (error) {
      handleApiError(error, 'update lead');
    }
  },

  async delete(id) {
    try {
      await api.leads.delete(id);
      return true;
    } catch (error) {
      handleApiError(error, 'delete lead');
    }
  },

  async getById(id) {
    try {
      const response = await api.leads.getById(id);
      return response.data.lead;
    } catch (error) {
      handleApiError(error, 'fetch lead');
    }
  }
};

// Patient Management Functions
export const patientAPI = {
  async getAll() {
    try {
      const response = await api.patients.getAll();
      return response.data.patients || [];
    } catch (error) {
      handleApiError(error, 'fetch patients');
    }
  },

  async create(patientData) {
    try {
      const response = await api.patients.create(patientData);
      return response.data.patient;
    } catch (error) {
      handleApiError(error, 'create patient');
    }
  },

  async update(id, patientData) {
    try {
      const response = await api.patients.update(id, patientData);
      return response.data.patient;
    } catch (error) {
      handleApiError(error, 'update patient');
    }
  },

  async delete(id) {
    try {
      await api.patients.delete(id);
      return true;
    } catch (error) {
      handleApiError(error, 'delete patient');
    }
  }
};

// Caregiver Management Functions
export const caregiverAPI = {
  async getAll() {
    try {
      const response = await api.caregivers.getAll();
      return response.data.caregivers || [];
    } catch (error) {
      handleApiError(error, 'fetch caregivers');
    }
  },

  async create(caregiverData) {
    try {
      const response = await api.caregivers.create(caregiverData);
      return response.data.caregiver;
    } catch (error) {
      handleApiError(error, 'create caregiver');
    }
  },

  async update(id, caregiverData) {
    try {
      const response = await api.caregivers.update(id, caregiverData);
      return response.data.caregiver;
    } catch (error) {
      handleApiError(error, 'update caregiver');
    }
  },

  async delete(id) {
    try {
      await api.caregivers.delete(id);
      return true;
    } catch (error) {
      handleApiError(error, 'delete caregiver');
    }
  }
};

// Document Management Functions
export const documentAPI = {
  async getAll() {
    try {
      const response = await api.documents.getAll();
      return response.data.documents || [];
    } catch (error) {
      handleApiError(error, 'fetch documents');
    }
  },

  async create(documentData) {
    try {
      const response = await api.documents.create(documentData);
      return response.data.document;
    } catch (error) {
      handleApiError(error, 'create document');
    }
  },

  async upload(file, onProgress) {
    try {
      const response = await api.documents.upload(file, onProgress);
      return response.data.document;
    } catch (error) {
      handleApiError(error, 'upload document');
    }
  },

  async update(id, documentData) {
    try {
      const response = await api.documents.update(id, documentData);
      return response.data.document;
    } catch (error) {
      handleApiError(error, 'update document');
    }
  },

  async delete(id) {
    try {
      await api.documents.delete(id);
      return true;
    } catch (error) {
      handleApiError(error, 'delete document');
    }
  }
};

// Signature Management Functions
export const signatureAPI = {
  async getAll() {
    try {
      const response = await api.signatures.getAll();
      return response.data.signatures || [];
    } catch (error) {
      handleApiError(error, 'fetch signatures');
    }
  },

  async create(signatureData) {
    try {
      const response = await api.signatures.create(signatureData);
      return response.data.signature;
    } catch (error) {
      handleApiError(error, 'create signature request');
    }
  },

  async update(id, signatureData) {
    try {
      const response = await api.signatures.update(id, signatureData);
      return response.data.signature;
    } catch (error) {
      handleApiError(error, 'update signature');
    }
  }
};

// Appointment Management Functions
export const appointmentAPI = {
  async getAll() {
    try {
      const response = await api.appointments.getAll();
      return response.data.appointments || [];
    } catch (error) {
      handleApiError(error, 'fetch appointments');
    }
  },

  async create(appointmentData) {
    try {
      const response = await api.appointments.create(appointmentData);
      return response.data.appointment;
    } catch (error) {
      handleApiError(error, 'create appointment');
    }
  },

  async update(id, appointmentData) {
    try {
      const response = await api.appointments.update(id, appointmentData);
      return response.data.appointment;
    } catch (error) {
      handleApiError(error, 'update appointment');
    }
  },

  async delete(id) {
    try {
      await api.appointments.delete(id);
      return true;
    } catch (error) {
      handleApiError(error, 'delete appointment');
    }
  }
};

// Configuration Management Functions
export const configAPI = {
  async getAll() {
    try {
      const response = await api.configurations.getAll();
      return response.data.configurations || [];
    } catch (error) {
      handleApiError(error, 'fetch configurations');
    }
  },

  async save(key, value, description) {
    try {
      const response = await api.configurations.save({ key, value, description });
      return response.data.configuration;
    } catch (error) {
      handleApiError(error, 'save configuration');
    }
  },

  async getByKey(key) {
    try {
      const response = await api.configurations.getByKey(key);
      return response.data.configuration;
    } catch (error) {
      handleApiError(error, 'fetch configuration');
    }
  }
};

// Task Management Functions
export const taskAPI = {
  async getAll() {
    try {
      const response = await api.tasks.getAll();
      return response.data.tasks || [];
    } catch (error) {
      handleApiError(error, 'fetch tasks');
    }
  },

  async create(taskData) {
    try {
      const response = await api.tasks.create(taskData);
      return response.data.task;
    } catch (error) {
      handleApiError(error, 'create task');
    }
  },

  async update(id, taskData) {
    try {
      const response = await api.tasks.update(id, taskData);
      return response.data.task;
    } catch (error) {
      handleApiError(error, 'update task');
    }
  },

  async delete(id) {
    try {
      await api.tasks.delete(id);
      return true;
    } catch (error) {
      handleApiError(error, 'delete task');
    }
  }
};

// Authentication Functions
export const authAPI = {
  async login(credentials) {
    try {
      const response = await api.auth.login(credentials);
      
      // Store auth data
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      handleApiError(error, 'login');
    }
  },

  async register(userData) {
    try {
      const response = await api.auth.register(userData);
      
      // Store auth data
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userData', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      handleApiError(error, 'register');
    }
  },

  async logout() {
    try {
      await api.auth.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      return true;
    } catch (error) {
      // Even if API call fails, clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      console.warn('Logout API call failed, but cleared local storage');
      return true;
    }
  },

  async getProfile() {
    try {
      const response = await api.users.getProfile();
      return response.data.user;
    } catch (error) {
      handleApiError(error, 'fetch profile');
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await api.users.updateProfile(profileData);
      
      // Update stored user data
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUser = { ...userData, ...response.data.user };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      
      return response.data.user;
    } catch (error) {
      handleApiError(error, 'update profile');
    }
  }
};

// Health check function
export const healthAPI = {
  async check() {
    try {
      const response = await api.health();
      return response.data;
    } catch (error) {
      handleApiError(error, 'health check');
    }
  }
};

// Utility functions for backwards compatibility
export const boldSignAPI = {
  // Placeholder functions for e-signature integration
  async sendForSignature(documentData) {
    console.log('BoldSign integration - sending for signature:', documentData);
    // This would integrate with the actual BoldSign API
    return { success: true, signatureId: 'bs_' + Date.now() };
  }
};

export const jotFormAPI = {
  // Placeholder functions for form integration
  async createForm(formData) {
    console.log('JotForm integration - creating form:', formData);
    // This would integrate with the actual JotForm API
    return { success: true, formId: 'jf_' + Date.now() };
  }
};

// Export all APIs for convenience
export default {
  lead: leadAPI,
  patient: patientAPI,
  caregiver: caregiverAPI,
  document: documentAPI,
  signature: signatureAPI,
  appointment: appointmentAPI,
  config: configAPI,
  task: taskAPI,
  auth: authAPI,
  health: healthAPI,
  boldSign: boldSignAPI,
  jotForm: jotFormAPI
};

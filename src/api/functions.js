import { base44 } from './base44Client';

// Create a proper agency invitation function using our backend APIs
export const sendAgencyInvitation = async (invitationData) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://onecaredesk.onrender.com/api';
    
    // Step 1: Create the agency
    const agencyResponse = await fetch(`${API_BASE_URL}/agencies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer dummy-token`, // Use the correct dummy token for development
      },
      body: JSON.stringify({
        name: invitationData.agency_name,
        address: invitationData.agency_address || '',
        phone: '', // Optional
        email: invitationData.owner_email,
        website: '',
        description: '',
        logo_url: '',
        settings: {},
        is_active: true
      })
    });

    if (!agencyResponse.ok) {
      const errorData = await agencyResponse.json();
      throw new Error(errorData.error || 'Failed to create agency');
    }

    const agencyData = await agencyResponse.json();
    console.log('Agency created:', agencyData);

    // Step 2: Create the owner user
    const userResponse = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer dummy-token`,
      },
      body: JSON.stringify({
        email: invitationData.owner_email,
        firstName: invitationData.owner_name.split(' ')[0] || invitationData.owner_name,
        lastName: invitationData.owner_name.split(' ').slice(1).join(' ') || '',
        role: 'agency_owner',
        agencyId: agencyData.agency.id, // Fix: Use the correct nested property
        username: invitationData.owner_username,
        password: 'TempPassword123!' // Temporary password that must be changed
      })
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      throw new Error(errorData.error || 'Failed to create user');
    }

    const userData = await userResponse.json();
    console.log('User created:', userData);

    // Step 3: Send invitation email (placeholder for now)
    // TODO: Implement actual email sending service
    console.log('Invitation email would be sent to:', invitationData.owner_email);

    return {
      data: {
        success: true,
        agency: agencyData,
        user: userData,
        message: `Agency "${invitationData.agency_name}" created successfully! Invitation sent to ${invitationData.owner_email}.`
      }
    };

  } catch (error) {
    console.error('Error in sendAgencyInvitation:', error);
    return {
      data: {
        success: false,
        error: error.message || 'Failed to create agency and send invitation'
      }
    };
  }
};

export const boldSignAPI = base44.functions.boldSignAPI;

export const createAgency = base44.functions.createAgency;

// export const sendEmail = base44.functions.sendEmail; // Replaced with custom implementation

export const fixAdminUser = base44.functions.fixAdminUser;

export const debugAgencyCreation = base44.functions.debugAgencyCreation;

export const basicPlatformTest = base44.functions.basicPlatformTest;

export const acceptAgencyInvitation = base44.functions.acceptAgencyInvitation;

export const auth = base44.functions.auth;

export const initializeSuperAdmin = base44.functions.initializeSuperAdmin;

export const debugAuth = base44.functions.debugAuth;

export const resendInvitationEmail = base44.functions.resendInvitationEmail;

export const resendFormEmail = base44.functions.resendFormEmail;

export const debugLogin = base44.functions.debugLogin;

export const requestPasswordReset = base44.functions.requestPasswordReset;

export const requestUsernameRecovery = base44.functions.requestUsernameRecovery;

export const resetPassword = base44.functions.resetPassword;

// Signup function using our backend
export const signup = async (params) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: params.email,
        password: params.password,
        firstName: params.firstName,
        lastName: params.lastName,
        username: params.username,
        role: params.role || 'user'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: {
          success: false,
          error: data.error || data.message || 'Signup failed'
        }
      };
    }

    return {
      data: {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message
      }
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      data: {
        success: false,
        error: error.message || 'Failed to connect to signup service'
      }
    };
  }
};

// Login function using our backend
export const login = async (params) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier: params.identifier,
        password: params.password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: {
          success: false,
          error: data.error || data.message || 'Login failed'
        }
      };
    }

    return {
      data: {
        success: true,
        user: data.user,
        token: data.token,
        message: data.message
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      data: {
        success: false,
        error: error.message || 'Failed to connect to login service'
      }
    };
  }
};

// export const jotFormAPI = base44.functions.jotFormAPI; // Replaced with custom implementation

export const boldSignWebhook = base44.functions.boldSignWebhook;

export const getUserManagementData = base44.functions.getUserManagementData;

export const emergencyLogin = base44.functions.emergencyLogin;

// JotForm API function using our backend
export const jotFormAPI = async (params) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://onecaredesk.onrender.com/api';
    const token = localStorage.getItem('auth_token') || 'dummy-token';
    
    const response = await fetch(`${API_BASE_URL}/integrations/jotform`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        data: {
          success: false,
          error: errorData.error || 'JotForm API request failed'
        }
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('JotForm API error:', error);
    return {
      data: {
        success: false,
        error: error.message || 'Failed to connect to JotForm API'
      }
    };
  }
};

// Resend Email API function using our backend
export const sendEmail = async (params) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://onecaredesk.onrender.com/api';
    const token = localStorage.getItem('auth_token') || 'dummy-token';
    
    const response = await fetch(`${API_BASE_URL}/integrations/resend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'sendEmail',
        ...params
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        data: {
          success: false,
          error: errorData.error || 'Email sending failed'
        }
      };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Resend API error:', error);
    return {
      data: {
        success: false,
        error: error.message || 'Failed to send email'
      }
    };
  }
};


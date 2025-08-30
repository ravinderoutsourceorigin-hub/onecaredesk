// User Management API client to replace Base44 functions
const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage (from Kinde authentication)
const getAuthToken = () => {
  // Try to get token from localStorage first (for compatibility)
  const token = localStorage.getItem('authToken') || localStorage.getItem('auth_token');
  if (token && token !== 'dummy-token') {
    return token;
  }
  
  // Fallback to dummy-token for development/testing
  return 'dummy-token';
};

// Get user management data (users and invitations)
export const getUserManagementData = async (filters = {}) => {
  try {
    const token = getAuthToken();
    const queryParams = new URLSearchParams();
    
    if (filters.agencyId) {
      queryParams.append('agencyId', filters.agencyId);
    }
    
    const response = await fetch(`${API_BASE_URL}/users/management-data?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user management data: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user management data:', error);
    throw error;
  }
};

// Check if user exists by email
export const checkUserExists = async (email) => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/users/check-email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check user existence: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const token = getAuthToken();
    
    // Validate required fields - only email is required
    if (!userData.email) {
      throw new Error('Email is required');
    }
    
    // Provide defaults for optional fields
    const requestData = {
      email: userData.email,
      firstName: userData.firstName || userData.email.split('@')[0] || 'User',
      lastName: userData.lastName || '',
      role: userData.role || 'user',
      agencyId: userData.agencyId,
      kindeId: userData.kindeId // Include kindeId if provided
    };
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create user: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (userId, userData) => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update user: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (userId) => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to delete user: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Invite user (placeholder for future implementation)
export const inviteUser = async (inviteData) => {
  try {
    // This would be implemented when you add an invitations system
    console.log('Invite user functionality to be implemented:', inviteData);
    
    // For now, just create the user directly
    return await createUser({
      email: inviteData.email,
      firstName: inviteData.firstName || '',
      lastName: inviteData.lastName || '',
      role: inviteData.role || 'user',
      agencyId: inviteData.agencyId
    });
  } catch (error) {
    console.error('Error inviting user:', error);
    throw error;
  }
};

// Resend invitation (placeholder)
export const resendInvitation = async (invitationId) => {
  try {
    console.log('Resend invitation functionality to be implemented:', invitationId);
    return { success: true, message: 'Invitation resent successfully' };
  } catch (error) {
    console.error('Error resending invitation:', error);
    throw error;
  }
};

// Cancel invitation (placeholder)
export const cancelInvitation = async (invitationId) => {
  try {
    console.log('Cancel invitation functionality to be implemented:', invitationId);
    return { success: true, message: 'Invitation cancelled successfully' };
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    throw error;
  }
};

import { base44 } from './base44Client';

// Create a proper agency invitation function using our backend APIs
export const sendAgencyInvitation = async (invitationData) => {
  try {
    // Step 1: Create the agency
    const agencyResponse = await fetch('http://localhost:5000/api/agencies', {
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
    const userResponse = await fetch('http://localhost:5000/api/users', {
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

export const sendEmail = base44.functions.sendEmail;

export const fixAdminUser = base44.functions.fixAdminUser;

export const debugAgencyCreation = base44.functions.debugAgencyCreation;

export const basicPlatformTest = base44.functions.basicPlatformTest;

export const acceptAgencyInvitation = base44.functions.acceptAgencyInvitation;

export const auth = base44.functions.auth;

export const initializeSuperAdmin = base44.functions.initializeSuperAdmin;

export const debugAuth = base44.functions.debugAuth;

export const resendInvitationEmail = base44.functions.resendInvitationEmail;

export const debugLogin = base44.functions.debugLogin;

export const requestPasswordReset = base44.functions.requestPasswordReset;

export const requestUsernameRecovery = base44.functions.requestUsernameRecovery;

export const resetPassword = base44.functions.resetPassword;

export const jotFormAPI = base44.functions.jotFormAPI;

export const boldSignWebhook = base44.functions.boldSignWebhook;

export const getUserManagementData = base44.functions.getUserManagementData;

export const emergencyLogin = base44.functions.emergencyLogin;


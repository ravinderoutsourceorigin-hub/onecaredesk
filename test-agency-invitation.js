// Test script to simulate agency invitation functionality
// This simulates what happens when a user submits the InviteAgencyDialog form

const testAgencyInvitation = async () => {
  try {
    console.log('🚀 Testing Agency Invitation Flow...');

    const invitationData = {
      agency_name: "Sunshine Home Care",
      agency_address: "789 Care Street, Health City, HC 12345",
      owner_name: "Sarah Johnson",
      owner_email: "sarah@sunshinecare.com",
      owner_username: "sarahjohnson",
      enforce_password_change: true,
      base_url: "http://localhost:5174"
    };

    console.log('📝 Invitation Data:', invitationData);

    // Step 1: Create the agency
    console.log('🏢 Step 1: Creating agency...');
    const agencyResponse = await fetch('http://localhost:5000/api/agencies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer dummy-token`,
      },
      body: JSON.stringify({
        name: invitationData.agency_name,
        address: invitationData.agency_address || '',
        phone: '',
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
    console.log('✅ Agency created successfully:', agencyData);

    // Step 2: Create the owner user
    console.log('👤 Step 2: Creating agency owner user...');
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
        agencyId: agencyData.id,
        username: invitationData.owner_username,
        password: 'TempPassword123!'
      })
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      throw new Error(errorData.error || 'Failed to create user');
    }

    const userData = await userResponse.json();
    console.log('✅ User created successfully:', userData);

    // Step 3: Simulate email invitation (would be sent in real implementation)
    console.log('📧 Step 3: Sending invitation email...');
    console.log(`📩 Email would be sent to: ${invitationData.owner_email}`);
    console.log(`🔗 Login URL: ${invitationData.base_url}/auth`);
    console.log(`👤 Username: ${invitationData.owner_username}`);
    console.log(`🔒 Temporary Password: TempPassword123!`);

    const result = {
      success: true,
      agency: agencyData,
      user: userData,
      message: `Agency "${invitationData.agency_name}" created successfully! Invitation sent to ${invitationData.owner_email}.`
    };

    console.log('🎉 COMPLETE SUCCESS:', result);
    return result;

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to create agency and send invitation'
    };
  }
};

// Run the test
testAgencyInvitation();

import React from 'react';
import { Button } from '@/components/ui/button';

const SetTestUser = () => {
  const setCorrectUser = () => {
    const testUser = {
      id: "test-user-123",
      email: "test@example.com",
      role: "user",
      agency_id: "8e09d481-efbb-433e-b301-929654600ad3", // This matches the leads data
      first_name: "Test",
      last_name: "User"
    };
    
    localStorage.setItem('app_user', JSON.stringify(testUser));
    console.log("✅ Test user set with correct agency_id:", testUser.agency_id);
    
    // Reload the page to see the changes
    window.location.reload();
  };

  const getCurrentUser = () => {
    const userString = localStorage.getItem('app_user');
    if (userString) {
      const user = JSON.parse(userString);
      console.log("Current user:", user);
      alert(`Current user agency_id: ${user.agency_id || 'NO AGENCY_ID'}`);
    } else {
      alert("No user found in localStorage");
    }
  };

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold mb-2">🔧 Debug: User Agency Test</h3>
      <div className="space-x-2">
        <Button onClick={setCorrectUser} size="sm">
          Set Test User (with correct agency_id)
        </Button>
        <Button onClick={getCurrentUser} variant="outline" size="sm">
          Check Current User
        </Button>
      </div>
    </div>
  );
};

export default SetTestUser;
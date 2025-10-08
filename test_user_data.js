// Test user data and agency filtering
console.log("=== User Data Test ===");

// Get user from localStorage
const userString = localStorage.getItem('app_user');
if (userString) {
  const user = JSON.parse(userString);
  console.log("Current user:", {
    email: user.email,
    role: user.role,
    agency_id: user.agency_id
  });
} else {
  console.log("No user found in localStorage");
}

// Test leads data
fetch('http://localhost:5000/api/leads', {
  headers: {
    'Authorization': 'Bearer dummy-token'
  }
})
.then(response => response.json())
.then(data => {
  console.log("Leads API response:", data);
  
  if (data.leads && data.leads.length > 0) {
    console.log("First lead agency_id:", data.leads[0].agency_id);
    console.log("All unique agency_ids in leads:", [...new Set(data.leads.map(lead => lead.agency_id))]);
  }
})
.catch(error => {
  console.error("Error fetching leads:", error);
});
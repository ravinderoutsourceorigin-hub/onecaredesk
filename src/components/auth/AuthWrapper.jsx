import React, { useState, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { Loader2, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createUser, checkUserExists } from '@/api/userManagement';

// Define public pages that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/auth',
  '/Home_new',
  '/Home',
  '/Landing',
  '/Features',
  '/Pricing',
  '/About',
  '/Contact',
  '/ResetPassword',
  '/EmailVerification',
  '/InvitationAcceptance',
  '/ServiceAgreement',
  '/auth/callback'
];

export default function AuthWrapper({ children }) {
  const { login, logout, isAuthenticated, isLoading, user, getToken, error } = useKindeAuth();
  const [authError, setAuthError] = useState(null);
  const [localUser, setLocalUser] = useState(null);

  // Check if current path is public (using window.location since we're outside Router)
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isPublicPath = PUBLIC_PATHS.includes(currentPath);
  
  // 🔍 DEBUG
  console.log('🔐 AUTH WRAPPER DEBUG:', {
    pathname: currentPath,
    isPublicPath,
    isAuthenticated,
    isLoading
  });

  // Function to sync Kinde user with our database
  const syncUserWithDatabase = async (kindeUser) => {
    try {
      // Debug: Log the Kinde user object to see what properties are available
      console.log('🔍 Kinde user object:', kindeUser);
      
      // Extract name parts from various possible Kinde user properties
      let firstName = '';
      let lastName = '';
      
      // Try different property names that Kinde might use
      if (kindeUser.given_name) {
        firstName = kindeUser.given_name;
      } else if (kindeUser.first_name) {
        firstName = kindeUser.first_name;
      } else if (kindeUser.name) {
        // If full name is provided, split it
        const nameParts = kindeUser.name.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      } else {
        // Fallback: use email prefix
        firstName = kindeUser.email.split('@')[0];
      }
      
      if (kindeUser.family_name) {
        lastName = kindeUser.family_name;
      } else if (kindeUser.last_name) {
        lastName = kindeUser.last_name;
      }
      // If lastName is still empty and we haven't set it from name splitting, leave it empty
      
      const userData = {
        email: kindeUser.email,
        firstName: firstName || 'User', // Ensure we always have a firstName
        lastName: lastName || '', // lastName can be empty
        role: kindeUser.email === 'ravinder.outsourceorigin@gmail.com' ? 'admin' : 'user',
        agencyId: kindeUser.email === 'ravinder.outsourceorigin@gmail.com' ? null : '78085b3a-8c7a-417b-9b18-5ddd91fd2070',
        kindeId: kindeUser.id // Use actual Kinde ID
      };
      
      console.log('📝 User data for database sync:', userData);

      // First check if user already exists
      try {
        const userCheckResult = await checkUserExists(userData.email);
        
        if (userCheckResult.exists) {
          console.log('ℹ️ User already exists in database:', userData.email);
          // Optionally, you could update the user's kinde_id if it's missing
          const existingUser = userCheckResult.user;
          if (!existingUser.kinde_id && userData.kindeId) {
            console.log('🔄 Updating existing user with kinde_id');
            // You could add an update user API call here if needed
          }
          setLocalUser(existingUser);
          return;
        }
        
        // User doesn't exist, create them
        const newUser = await createUser(userData);
        console.log('✅ User synced with database:', userData.email);
        setLocalUser(newUser);
        
      } catch (error) {
        console.error('❌ Failed to sync user with database:', error);
        // Set a default user object if sync fails but user is authenticated
        setLocalUser({
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          role: userData.role
        });
      }
    } catch (error) {
      console.error('Error syncing user with database:', error);
    }
  };

  useEffect(() => {
    // Handle authentication errors
    if (error) {
      console.error('Kinde authentication error:', error);
      setAuthError(error.message || 'Authentication failed');
    }

    if (isAuthenticated && user) {
      // First, sync the user with our database
      syncUserWithDatabase(user);

      // Create user object compatible with our app
      const appUser = {
        id: user.id,
        email: user.email,
        name: user.given_name && user.family_name 
          ? `${user.given_name} ${user.family_name}` 
          : user.given_name || user.email,
        full_name: user.given_name && user.family_name 
          ? `${user.given_name} ${user.family_name}` 
          : user.given_name || user.email,
        role: user.email === 'ravinder.outsourceorigin@gmail.com' ? 'admin' : 'user',
        agency_id: user.email === 'ravinder.outsourceorigin@gmail.com' ? null : '78085b3a-8c7a-417b-9b18-5ddd91fd2070',
        temp_password: false,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        kinde_user: true
      };

      // Store in localStorage for compatibility with existing code
      localStorage.setItem('user_data', JSON.stringify(appUser));
      localStorage.setItem('app_user', JSON.stringify(appUser));
      
      // Get and store the Kinde token
      getToken().then(token => {
        console.log('🔑 Kinde token received:', token ? 'Token available' : 'No token');
        if (token) {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('authToken', token); // For our API client
          console.log('✅ Token stored in localStorage');
        } else {
          console.log('❌ No token received from Kinde');
        }
      }).catch(tokenError => {
        console.error('❌ Error getting token:', tokenError);
      });

      setLocalUser(appUser);
      setAuthError(null);
    } else if (!isLoading && !isAuthenticated) {
      // Clear stored data when not authenticated
      localStorage.removeItem('user_data');
      localStorage.removeItem('app_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('authToken');
      setLocalUser(null);
    }
  }, [isAuthenticated, user, isLoading, getToken, error]);

  const handleLogin = () => {
    login();
  };

  const handleLogout = () => {
    // Clear all local storage data first
    localStorage.removeItem('user_data');
    localStorage.removeItem('app_user');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authToken');
    setLocalUser(null);
    setAuthError(null);
    
    // Then call Kinde logout
    logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If it's a public path, render children without auth check
  if (isPublicPath) {
    console.log('✅ Public path, rendering without auth check');
    return children;
  }

  // For protected paths, check authentication
  if (!isAuthenticated || !localUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to OneCare Desk
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pb-8">
            <p className="text-gray-600 text-lg">
              Please sign in to access your dashboard
            </p>
            
            {authError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Authentication Error: {authError}
                  <br />
                  <small className="text-red-600">
                    Please check your configuration or contact support.
                  </small>
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleLogin} 
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Sign In to Continue
            </Button>
            
            <div className="text-sm text-gray-500 pt-4 border-t border-gray-200">
              Secure authentication powered by Kinde
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}
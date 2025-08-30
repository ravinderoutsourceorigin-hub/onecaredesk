import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ServerCrash, CheckCircle } from 'lucide-react';
import { acceptAgencyInvitation } from '@/api/functions';

export default function InvitationAcceptance() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('initializing');
  const [error, setError] = useState('');

  useEffect(() => {
    const processInvitation = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setError('Invitation token is missing. Please use the link from your invitation email.');
        return;
      }

      try {
        setStatus('authenticating');
        // Check if user is logged in. If not, this will throw.
        await User.me();
        
        // If logged in, proceed to accept.
        setStatus('processing');
        const response = await acceptAgencyInvitation({ invitation_token: token });

        if (response.data?.success) {
          setStatus('success');
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate(createPageUrl('Dashboard'));
          }, 2000);
        } else {
          throw new Error(response.data?.error || 'Failed to process invitation.');
        }
      } catch (authError) {
        // This means user is not logged in. Redirect to login.
        // The user will be returned to this exact page after logging in.
        await User.loginWithRedirect(window.location.href);
      }
    };

    processInvitation();
  }, [location, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'authenticating':
        return (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <h1 className="text-2xl font-semibold mt-4">Authenticating...</h1>
            <p className="text-gray-600">Verifying your identity. You may be redirected to sign in.</p>
          </>
        );
      case 'processing':
        return (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <h1 className="text-2xl font-semibold mt-4">Setting Up Your Agency...</h1>
            <p className="text-gray-600">Please wait while we configure your account. This won't take long.</p>
          </>
        );
      case 'success':
        return (
          <>
            <CheckCircle className="w-12 h-12 text-green-600" />
            <h1 className="text-2xl font-semibold mt-4">Welcome to OneCareDesk!</h1>
            <p className="text-gray-600">Your agency account has been created. Redirecting you to your dashboard...</p>
          </>
        );
      case 'error':
        return (
          <Alert variant="destructive" className="max-w-md">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle>An Error Occurred</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        );
      default:
        return (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <h1 className="text-2xl font-semibold mt-4">Processing Invitation...</h1>
            <p className="text-gray-600">Please wait a moment.</p>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
      {renderContent()}
    </div>
  );
}
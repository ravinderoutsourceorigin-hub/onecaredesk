import React, { useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const { handleRedirectToApp } = useKindeAuth();

  useEffect(() => {
    handleRedirectToApp();
  }, [handleRedirectToApp]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

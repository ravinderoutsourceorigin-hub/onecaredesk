import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { boldSignAPI } from "@/components/integrations/BoldSignAPI";

export default function BoldSignCallback() {
  const [status, setStatus] = useState('processing'); // 'processing', 'success', 'error'
  const [message, setMessage] = useState('Processing OAuth callback...');

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      // Extract access token from URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const error = params.get('error');

      if (error) {
        setStatus('error');
        setMessage(`OAuth Error: ${error}`);
        return;
      }

      if (!accessToken) {
        setStatus('error');
        setMessage('No access token received from BoldSign.');
        return;
      }

      // Store the access token
      boldSignAPI.setAccessToken(accessToken);

      // Verify the connection works
      await boldSignAPI.verifyAccount();

      setStatus('success');
      setMessage('Successfully connected to BoldSign! You can now close this window.');

      // Redirect back to settings after a short delay
      setTimeout(() => {
        window.location.href = '/Settings';
      }, 2000);

    } catch (error) {
      console.error('OAuth callback error:', error);
      setStatus('error');
      setMessage(`Connection failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === 'processing' && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to BoldSign</h2>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Successful!</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-4">Redirecting you back to settings...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-4">
                Please try again or contact support if the issue persists.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
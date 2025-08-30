import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function EmailVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email || 'your email';
  const message = location.state?.message || 'Please check your email to verify your account.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            {message}
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              We sent a verification link to:
            </p>
            <p className="font-semibold text-blue-600">{email}</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              After verifying your email, you can sign in to your agency portal.
            </p>
            <Button 
              onClick={() => navigate(createPageUrl('Home'))}
              className="w-full"
            >
              Go to Sign In
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
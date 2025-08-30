// This component is now replaced by HIPAAConsentDialog
// Keeping it for backward compatibility but it won't be used

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheck } from 'lucide-react';
import { User } from '@/api/entities';

export default function HIPAABanner({ user, onAcknowledged }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This component is deprecated - new users will see the full dialog instead
  if (!user || user.hipaa_consent_given) {
    return null;
  }

  const handleAcknowledge = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await User.updateMyUserData({ hipaa_consent_given: true });
      onAcknowledged();
    } catch (error) {
      onAcknowledged();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Alert className="bg-blue-50 border-blue-200">
        <ShieldCheck className="h-5 w-5 text-blue-600" />
        <AlertTitle className="text-blue-800 font-semibold">Data Privacy & Security (HIPAA)</AlertTitle>
        <AlertDescription className="text-blue-700">
          This platform contains Protected Health Information (PHI) and is secured in accordance with HIPAA regulations. By using this system, you agree to handle all data with confidentiality and in compliance with our security policies.
        </AlertDescription>
        <div className="mt-4">
          <Button 
            onClick={handleAcknowledge} 
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Acknowledging...' : 'I Understand and Acknowledge'}
          </Button>
        </div>
      </Alert>
    </div>
  );
}
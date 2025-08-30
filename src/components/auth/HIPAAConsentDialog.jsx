import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, FileText, Lock, Users } from "lucide-react";
import { User } from '@/api/entities';

export default function HIPAAConsentDialog({ user, open, onConsentGiven }) {
  const [hasRead, setHasRead] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!hasRead || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await User.updateMyUserData({ 
        hipaa_consent_given: true,
        hipaa_consent_date: new Date().toISOString() 
      });
      onConsentGiven();
    } catch (error) {
      console.error('Failed to update HIPAA consent:', error);
      // Still call onConsentGiven to prevent blocking the user
      onConsentGiven();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent className="max-w-2xl max-h-[90vh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">HIPAA Privacy Notice & Consent</DialogTitle>
              <DialogDescription>
                Welcome to CareConnect, {user?.full_name || 'User'}. Please review and acknowledge our privacy practices.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-96 pr-4">
          <div className="space-y-6 text-sm">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold">Protected Health Information (PHI)</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                This CareConnect platform contains Protected Health Information (PHI) as defined by the Health Insurance 
                Portability and Accountability Act (HIPAA). This includes medical records, treatment information, 
                billing data, and any information that could identify you in relation to your healthcare.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold">How We Protect Your Information</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• All data is encrypted in transit and at rest</li>
                <li>• Access is restricted to authorized healthcare personnel only</li>
                <li>• All access attempts are logged and monitored</li>
                <li>• Regular security audits and compliance reviews are conducted</li>
                <li>• Session timeouts ensure automatic logout after periods of inactivity</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-blue-600" />
                <h3 className="font-semibold">Your Rights</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                You have the right to access your PHI, request amendments, receive an accounting of disclosures, 
                and file complaints regarding privacy practices. You may also request restrictions on how your 
                information is used or disclosed.
              </p>
            </section>

            <section>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2">Important Responsibilities</h3>
                <ul className="space-y-1 text-amber-700 text-sm">
                  <li>• Keep your login credentials secure and confidential</li>
                  <li>• Log out when finished, especially on shared devices</li>
                  <li>• Report any suspected security incidents immediately</li>
                  <li>• Only access information necessary for your role and responsibilities</li>
                  <li>• Do not share PHI with unauthorized individuals</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Contact Information</h3>
                <p className="text-blue-700 text-sm">
                  For questions about our privacy practices or to exercise your rights, please contact our 
                  Privacy Officer through the support channels provided in this application.
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <div className="flex flex-col w-full gap-4">
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="hipaa-read" 
                checked={hasRead}
                onCheckedChange={setHasRead}
              />
              <label 
                htmlFor="hipaa-read" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and understood the HIPAA privacy notice and my responsibilities regarding PHI.
              </label>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => User.logout()}
                className="flex-1"
              >
                Decline & Sign Out
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!hasRead || isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Processing...' : 'Accept & Continue'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
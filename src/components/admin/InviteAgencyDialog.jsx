
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Send, Building2 } from "lucide-react";
import { sendAgencyInvitation } from "@/api/functions";

export default function InviteAgencyDialog({ open, onOpenChange, onInviteSent }) {
  const [formData, setFormData] = useState({
    // Agency Details
    agencyName: "",
    agencyAddress: "",
    
    // Owner Details
    ownerName: "",
    ownerEmail: "",
    ownerUsername: "",
    
    // Settings
    enforcePasswordChange: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const resetForm = () => {
    setFormData({
      agencyName: "",
      agencyAddress: "",
      ownerName: "",
      ownerEmail: "",
      ownerUsername: "",
      enforcePasswordChange: true
    });
    setError("");
    setSuccess("");
  };

  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Auto-generate username from email
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData(prev => ({
      ...prev,
      ownerEmail: email,
      ownerUsername: email.includes('@') ? email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') : prev.ownerUsername
    }));
  };

  const validateForm = () => {
    if (!formData.agencyName.trim()) return "Agency name is required.";
    if (!formData.ownerName.trim()) return "Owner name is required.";
    if (!formData.ownerEmail.trim()) return "Owner email is required.";
    if (!formData.ownerUsername.trim()) return "Username is required.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.ownerEmail)) return "Please enter a valid email address.";
    
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(formData.ownerUsername)) {
      return "Username must be 3-20 characters, lowercase letters, numbers, and underscores only.";
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await sendAgencyInvitation({
        agency_name: formData.agencyName.trim(),
        agency_address: formData.agencyAddress.trim(),
        owner_name: formData.ownerName.trim(),
        owner_email: formData.ownerEmail.trim(),
        owner_username: formData.ownerUsername.trim(),
        enforce_password_change: formData.enforcePasswordChange,
        base_url: window.location.origin
      });

      if (response.data?.success) {
        setSuccess(`✅ Agency "${formData.agencyName}" created successfully! Invitation sent to ${formData.ownerEmail}.`);
        if (onInviteSent) {
          onInviteSent(response.data);
        }
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          handleOpenChange(false);
        }, 3000);
      } else {
        setError(response.data?.error || "Failed to create agency and send invitation.");
      }
    } catch (error) {
      console.error("Invitation error:", error);
      // --- CORE FIX: Extract specific error message from the server response ---
      const serverError = error.response?.data?.error || "An unexpected error occurred. Please try again.";
      setError(serverError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-5 h-5 text-blue-600" />
            Create New Agency
          </DialogTitle>
          <DialogDescription>
            Enter the agency details and owner information. The system will create everything and send login credentials.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <Send className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Agency Information */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Agency Information
            </h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="agencyName" className="text-sm font-medium">
                  Agency Name *
                </Label>
                <Input
                  id="agencyName"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleInputChange}
                  placeholder="e.g., Sunshine Home Care"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="agencyAddress" className="text-sm font-medium">
                  Business Address
                </Label>
                <Textarea
                  id="agencyAddress"
                  name="agencyAddress"
                  value={formData.agencyAddress}
                  onChange={handleInputChange}
                  placeholder="123 Main Street, City, State, ZIP"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Owner Information */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Agency Owner Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ownerName" className="text-sm font-medium">
                  Full Name *
                </Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="John Smith"
                  disabled={isSubmitting}
                />
              </div>
              
              <div>
                <Label htmlFor="ownerEmail" className="text-sm font-medium">
                  Email Address *
                </Label>
                <Input
                  id="ownerEmail"
                  name="ownerEmail"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={handleEmailChange}
                  placeholder="john@sunshinecare.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="ownerUsername" className="text-sm font-medium">
                Username *
              </Label>
              <Input
                id="ownerUsername"
                name="ownerUsername"
                value={formData.ownerUsername}
                onChange={handleInputChange}
                placeholder="johnsmith"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, lowercase letters, numbers, and underscores only
              </p>
            </div>
          </div>

          {/* Security Settings */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-gray-900">Security Settings</h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enforcePasswordChange"
                name="enforcePasswordChange"
                checked={formData.enforcePasswordChange}
                onChange={handleInputChange}
                className="rounded border-gray-300"
                disabled={isSubmitting}
              />
              <Label htmlFor="enforcePasswordChange" className="text-sm">
                Force password change on first login (Recommended)
              </Label>
            </div>
            <p className="text-xs text-gray-500 ml-6">
              The owner will be required to change their password after the first login
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Agency...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Create & Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

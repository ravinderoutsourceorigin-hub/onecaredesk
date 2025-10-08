
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, FileText, AlertTriangle, Send } from "lucide-react";
import { SignatureRequest } from "@/api/entities";
import { jotFormAPI } from "@/api/functions";
import { boldSignAPI } from "@/api/functions";
import { format } from "date-fns";

export default function CreateSignatureRequestDialog({ open, onOpenChange, onSubmit, entity }) {
  const [provider, setProvider] = useState("boldsign");
  const [boldSignTemplates, setBoldSignTemplates] = useState([]);
  const [jotformDocuments, setJotformDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [roles, setRoles] = useState([]);
  
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const resetForm = useCallback(() => {
    setSelectedDocumentId("");
    setTitle("");
    setMessage("");
    setRoles([]);
    setError(null);
    setIsSubmitting(false);
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      const shouldFetch =
        (provider === 'boldsign' && boldSignTemplates.length === 0) ||
        (provider === 'jotform' && jotformDocuments.length === 0);

      if (shouldFetch) {
        setIsLoadingDocs(true);
        setError(null);
        try {
          const userString = localStorage.getItem('app_user');
          if (!userString) {
            throw new Error("User session not found. Please refresh the page.");
          }
          const user = JSON.parse(userString);
          setCurrentUser(user);
          
          if (!user?.agency_id) {
            throw new Error("No agency ID found for current user. Please ensure your user profile is complete.");
          }

          if (provider === 'boldsign') {
            console.log('🔍 Loading BoldSign templates...');
            try {
              const response = await boldSignAPI({ action: 'getTemplates' });
              console.log('📦 BoldSign API Response:', response);

              if (response.error) {
                console.error('❌ BoldSign Error:', response.error);
                throw new Error(response.error.error || response.error.message || 'Failed to get BoldSign templates');
              }
              
              if (!response.data) {
                console.error('❌ No data in response:', response);
                throw new Error('No data returned from BoldSign API');
              }

              if (!response.data.success) {
                console.error('❌ BoldSign API unsuccessful:', response.data);
                throw new Error(response.data.error || 'BoldSign API returned unsuccessful response');
              }

              const fetchedTemplates = response.data.templates || [];
              console.log('✅ Fetched templates:', fetchedTemplates);
              
              setBoldSignTemplates(fetchedTemplates);
              setJotformDocuments([]);

              if (fetchedTemplates.length === 0) {
                setError('No BoldSign templates found in your account. Please create a template on the BoldSign website first.');
              } else {
                setError(null);
                console.log(`✅ Successfully loaded ${fetchedTemplates.length} BoldSign templates`);
              }
            } catch (boldSignError) {
              console.error('🚨 BoldSign Error Details:', boldSignError);
              setError(`BoldSign Error: ${boldSignError.message}`);
              setBoldSignTemplates([]);
            }
          } else if (provider === 'jotform') {
            console.log('🔍 Loading JotForm documents...');
            try {
              const response = await jotFormAPI({ action: 'getForms' });
              console.log('📦 JotForm API Response:', response);

              if (response.error) {
                console.error('❌ JotForm Error:', response.error);
                throw new Error(response.error.error || response.error.message || 'Failed to get JotForm forms');
              }

              const fetchedJotformDocs = response.data?.forms || [];
              console.log('✅ Fetched JotForm forms:', fetchedJotformDocs);
              
              setJotformDocuments(fetchedJotformDocs);
              setBoldSignTemplates([]);

              if (fetchedJotformDocs.length > 0) {
                setError(null);
                console.log(`✅ Successfully loaded ${fetchedJotformDocs.length} JotForm forms`);
              } else {
                setError('No JotForm forms found. Please create forms in your JotForm account first.');
              }
            } catch (jotformError) {
              console.error('🚨 JotForm Error Details:', jotformError);
              setError(`JotForm Error: ${jotformError.message}`);
              setJotformDocuments([]);
            }
          }
        } catch (err) {
          console.error("🚨 Failed to load initial data:", err);
          setError(`Failed to load data: ${err.message}`);
        } finally {
          setIsLoadingDocs(false);
        }
      }

      if (provider === 'boldsign' && selectedDocumentId && boldSignTemplates.length > 0) {
        if (!boldSignTemplates.some(t => String(t.id) === String(selectedDocumentId))) {  // Fix: t.templateId -> t.id
          setSelectedDocumentId("");
          setRoles([]);
        }
      }
    };

    if (open) {
      loadInitialData();
      if (entity) {
        setTitle(entity.name ? `Service Agreement - ${entity.name}` : "Service Agreement");
        setMessage(`Hi ${entity.name || 'there'},\n\nPlease review and sign the attached document(s) at your earliest convenience.\n\nThank you,\nOneCareDesk`);
      }
    }
  }, [open, provider, entity, boldSignTemplates, jotformDocuments, selectedDocumentId]);

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const handleDocumentChange = async (documentId) => {
    console.log('📝 Document selected:', documentId);
    setSelectedDocumentId(documentId);
    setRoles([]);
    
    if (!documentId) return;

    if (provider === 'boldsign') {
      const template = boldSignTemplates.find(t => String(t.templateId) === String(documentId));
      console.log('🔍 Found template:', template);
      
      if (template && template.signerRoles) { // Changed from template.roles to template.signerRoles
        const initialRoles = template.signerRoles.map((roleName, index) => ({
          roleName: roleName,
          signerName: index === 0 && entity ? entity.name : "",
          signerEmail: index === 0 && entity ? entity.email : ""
        }));
        console.log('👥 Setting roles:', initialRoles);
        setRoles(initialRoles);
      } else {
        console.log('⚠️ No signer roles found in template, using default');
        setRoles([{
          roleName: "Signer",
          signerName: entity ? entity.name : "",
          signerEmail: entity ? entity.email : ""
        }]);
      }
    } else if (provider === 'jotform') {
      setRoles([{
        roleName: "Signer",
        signerName: entity ? entity.name : "",
        signerEmail: entity ? entity.email : ""
      }]);
    }
  };

  const handleRoleChange = (index, field, value) => {
    const updatedRoles = [...roles];
    updatedRoles[index] = { ...updatedRoles[index], [field]: value };
    setRoles(updatedRoles);
  };

  const handleSubmit = async () => {
    if (!selectedDocumentId) {
      setError('Please select a document template.');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for this signature request.');
      return;
    }

    if (roles.some(role => !role.signerName.trim() || !role.signerEmail.trim())) {
      setError('Please fill in all signer names and emails.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const recipients = roles.map(role => ({
        name: role.signerName,
        email: role.signerEmail,
        role: role.roleName
      }));

      console.log('🔍 Roles:', roles);
      console.log('📧 Recipients:', recipients);

      const requestData = {
        agency_id: currentUser.agency_id,
        title,
        recipients,
        custom_message: message,
        provider,
        external_request_id: selectedDocumentId,
        related_entity_type: entity ? 'lead' : null,
        related_entity_id: entity ? entity.id : null,
        status: 'draft'
      };

      let apiResponse;
      if (provider === 'boldsign') {
        apiResponse = await boldSignAPI({
          action: 'sendSignature',  // Fix: Changed from 'sendSignatureRequest' to 'sendSignature'
          templateId: selectedDocumentId,
          title,
          message,
          signers: recipients
        });

        if (apiResponse.error) {
          throw new Error(apiResponse.error.error || 'Failed to send signature request via BoldSign');
        }

        if (apiResponse.data && apiResponse.data.success) {
          requestData.external_document_id = apiResponse.data.documentId;
          requestData.signature_url = apiResponse.data.signingUrl;
          requestData.status = 'sent';
          requestData.sent_date = new Date().toISOString();
        }
      } else if (provider === 'jotform') {
        apiResponse = await jotFormAPI({
          action: 'sendSignatureRequest',
          formId: selectedDocumentId,
          recipients: recipients.map(r => ({ name: r.name, email: r.email })),
          title,
          message
        });

        if (apiResponse.error) {
          throw new Error(apiResponse.error.error || 'Failed to send signature request via JotForm');
        }

        if (apiResponse.data && apiResponse.data.success) {
          requestData.signature_url = apiResponse.data.formUrl;
          requestData.form_url = apiResponse.data.formUrl; // Add form URL for email
          requestData.status = 'sent';
          requestData.sent_date = new Date().toISOString();
        }
      }

      await SignatureRequest.create(requestData);

      handleOpenChange(false);
      if (onSubmit) {
        onSubmit(requestData);
      }

    } catch (err) {
      console.error("Error sending signature request:", err);
      setError(err.message || 'Failed to send signature request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Send E-Signature Request
          </DialogTitle>
          <DialogDescription>
            Create and send a document for electronic signature.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Provider Selection */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="space-y-4">
                <Label htmlFor="provider" className="text-blue-800 font-medium">
                  E-Signature Provider
                </Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="border-blue-300">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boldsign">BoldSign</SelectItem>
                    <SelectItem value="jotform">JotForm Sign</SelectItem>
                    <SelectItem value="fillout">Fillout (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Document Selection */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="space-y-4">
                <Label htmlFor="document" className="text-green-800 font-medium">
                  Select Document Template
                  {provider === 'boldsign' && boldSignTemplates.length > 0 && (
                    <span className="text-sm text-green-600 ml-2">({boldSignTemplates.length} available)</span>
                  )}
                  {provider === 'jotform' && jotformDocuments.length > 0 && (
                    <span className="text-sm text-green-600 ml-2">({jotformDocuments.length} available)</span>
                  )}
                </Label>
                {isLoadingDocs ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-gray-600">Loading documents...</span>
                  </div>
                ) : (
                  <>
                    <Select value={selectedDocumentId} onValueChange={handleDocumentChange}>
                      <SelectTrigger className="border-green-300">
                        <SelectValue placeholder="Choose a document template" />
                      </SelectTrigger>
                      <SelectContent>
                        {provider === 'boldsign' && boldSignTemplates.map((template) => (
                          <SelectItem key={template.id} value={String(template.id)}>  {/* Fix: templateId -> id */}
                            {template.name || template.templateName || template.documentTitle || `Template ${template.id}`}
                          </SelectItem>
                        ))}
                        {provider === 'jotform' && jotformDocuments.map((doc) => (
                          <SelectItem key={doc.id} value={String(doc.id)}>
                            {doc.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {provider === 'boldsign' && boldSignTemplates.length === 0 && !isLoadingDocs && (
                      <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                        💡 No templates found. Please create a template in your BoldSign account first.
                      </div>
                    )}
                    {provider === 'jotform' && jotformDocuments.length === 0 && !isLoadingDocs && (
                      <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                        💡 No documents found. Please create forms in your JotForm account first.
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Signer Roles Section */}
          {selectedDocumentId && roles.length > 0 && (
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <Label className="text-purple-800 font-medium">
                    Signers
                  </Label>
                  {roles.map((role, index) => (
                    <div key={index} className="space-y-3 p-3 bg-white rounded-lg border border-purple-300">
                      <Label className="font-semibold text-purple-700">{role.roleName}</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`signerName-${index}`} className="text-sm font-normal text-gray-700">Name</Label>
                          <Input
                            id={`signerName-${index}`}
                            value={role.signerName}
                            onChange={(e) => handleRoleChange(index, 'signerName', e.target.value)}
                            placeholder="Signer's full name"
                            className="border-purple-300"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`signerEmail-${index}`} className="text-sm font-normal text-gray-700">Email</Label>
                          <Input
                            id={`signerEmail-${index}`}
                            type="email"
                            value={role.signerEmail}
                            onChange={(e) => handleRoleChange(index, 'signerEmail', e.target.value)}
                            placeholder="signer@example.com"
                            className="border-purple-300"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Request Details */}
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-orange-800 font-medium">
                    Request Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title for this signature request"
                    className="border-orange-300"
                  />
                </div>
                <div>
                  <Label htmlFor="message" className="text-orange-800 font-medium">
                    Custom Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal message to the signers..."
                    rows={4}
                    className="border-orange-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="pt-4">
          <Button 
            variant="outline" 
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !selectedDocumentId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send for Signature
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, FileSignature, CheckCircle, AlertTriangle, Mail, Building, Upload, FileText, Eye, LayoutTemplate, Inbox, Settings as SettingsIcon, Shield, Key } from "lucide-react";
import { Configuration } from "@/api/entities";
import { Agency } from "@/api/entities";
import EmailService from "@/components/integrations/EmailService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { jotFormAPI as jotFormBackend } from "@/api/functions";
import { UploadFile } from "@/api/integrations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";

import FormTemplates from "./FormTemplates";
import SignedDocuments from "./SignedDocuments";
import SimpleFormSubmissions from "@/components/forms/SimpleFormSubmissions"; // Updated import
import WebhookTestViewer from "@/components/admin/WebhookTestViewer";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [configs, setConfigs] = useState({
    resend_api_key: "",
    resend_from_email: "",
    resend_from_name: "",
    form_submission_email_template: "",
    esign_request_email_template: "", // Add new template state
  });
  const [configIds, setConfigIds] = useState({
    resend_api_key: null,
    resend_from_email: null,
    resend_from_name: null,
    form_submission_email_template: null,
    esign_request_email_template: null, // Add new template ID state
  });
  const [isLoading, setIsLoading] = useState(true);
  const [savingStates, setSavingStates] = useState({
    jotform: false,
    resend: false,
    agency: false,
    emailTemplate: false,
    esignTemplate: false, // Add new saving state
  });
  const [saveSuccess, setSaveSuccess] = useState({
    jotform: false,
    resend: false,
    agency: false,
    emailTemplate: false,
    esignTemplate: false, // Add new success state
  });
  const [saveErrors, setSaveErrors] = useState({
    jotform: "",
    resend: "",
    agency: "",
    emailTemplate: "",
    esignTemplate: "", // Add new error state
  });

  const [testingJotForm, setTestingJotForm] = useState(false);
  const [jotFormTestResult, setJotFormTestResult] = useState(null);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [agency, setAgency] = useState(null);
  const [agencyForm, setAgencyForm] = useState({ display_name: '', logo_url: '' });
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [previewTemplateType, setPreviewTemplateType] = useState('formSubmission'); // New state for preview type
  const [logoFile, setLogoFile] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const initialize = useCallback(async () => {
    setIsLoading(true);
    try {
      const userString = localStorage.getItem('app_user');
      if (!userString) throw new Error("No user session found. Please log in.");
      const user = JSON.parse(userString);
      setCurrentUser(user);

      const allConfigs = await Configuration.list();
      const loadedConfigs = {
        resend_api_key: "",
        resend_from_email: "",
        resend_from_name: "",
        form_submission_email_template: "",
        esign_request_email_template: "",
      };
      const loadedIds = {
        resend_api_key: null,
        resend_from_email: null,
        resend_from_name: null,
        form_submission_email_template: null,
        esign_request_email_template: null,
      };

      allConfigs.forEach(config => {
        if (config.key in loadedConfigs) {
          loadedConfigs[config.key] = config.value;
          loadedIds[config.key] = config.id;
        }
      });

      // Set default form submission email template if not already configured
      if (!loadedConfigs.form_submission_email_template) {
        loadedConfigs.form_submission_email_template = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header with Agency Branding -->
    <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 30px 20px; text-align: center; border-bottom: 3px solid #3b82f6;">
        <h1 style="margin: 0; color: #1e40af; font-size: 24px; font-weight: 700;">{{agency_name}}</h1>
        <h2 style="margin: 10px 0 0 0; color: #3730a3; font-size: 18px; font-weight: 500;">Document Submission Received</h2>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 30px 25px; background: white;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>{{recipient_name}}</strong>,</p>
        
        <!-- NEW COMBINED SECTION -->
        <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 25px; margin: 20px 0; line-height: 1.7;">
            <p style="margin: 0 0 20px 0; color: #334155;">
                Thank you for your form submission. We have successfully received your information and will review it promptly.
            </p>
            
            <div style="border-top: 1px solid #dbeafe; padding-top: 20px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px; font-weight: 600;">Submission Details:</h3>
                <p style="margin: 5px 0; color: #475569;"><strong>Reference ID:</strong> {{submission_id}}</p>
                <p style="margin: 5px 0; color: #475569;"><strong>Form ID:</strong> {{form_id}}</p>
            </div>

            <p style="margin: 0; color: #047857; font-weight: 500; border-top: 1px solid #dbeafe; padding-top: 20px;">
                📎 Your completed document is attached to this email for your records.
            </p>
        </div>
        
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            If you have any questions or concerns, please don't hesitate to contact us directly.
        </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">This confirmation was sent from <strong>{{agency_name}}</strong> via OneCareDesk.</p>
        <p style="margin: 5px 0 0 0;">Please do not reply directly to this email.</p>
    </div>
</div>`;
      }

      // Set default e-sign request email template if not already configured
      if (!loadedConfigs.esign_request_email_template) {
        loadedConfigs.esign_request_email_template = `<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header with Agency Branding -->
    <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 30px 20px; text-align: center; border-bottom: 3px solid #3b82f6;">
        <h1 style="margin: 0; color: #1e40af; font-size: 24px; font-weight: 700;">{{agency_name}}</h1>
        <h2 style="margin: 10px 0 0 0; color: #3730a3; font-size: 18px; font-weight: 500;">Document Signature Required</h2>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 30px 25px; background: white;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong>{{recipient_name}}</strong>,</p>
        
        <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
            You have been invited to review and sign the following document: 
            <strong style="color: #1e40af;">{{document_title}}</strong>
        </p>
        
        <!-- Custom Message Box -->
        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af; font-size: 16px;">Message from {{agency_name}}:</h3>
            <p style="margin: 0; font-style: italic; color: #475569; line-height: 1.6;">"{{custom_message}}"</p>
        </div>
        
        <!-- Call to Action Button -->
        <div style="text-align: center; margin: 35px 0;">
            <a href="{{signature_link}}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3); transition: all 0.3s ease;">
                📝 Review & Sign Document
            </a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; margin-top: 30px;">
            If you have any questions or encounter issues, please contact us directly at your earliest convenience.
        </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">This signature request was sent from <strong>{{agency_name}}</strong> via OneCareDesk.</p>
        <p style="margin: 5px 0 0 0;">Please do not reply directly to this email.</p>
    </div>
</div>`;
      }

      setConfigs(loadedConfigs);
      setConfigIds(loadedIds);

      if (user.agency_id && user.role === 'agency_admin') {
        const agencyData = await Agency.get(user.agency_id);
        setAgency(agencyData);
        setAgencyForm({
          display_name: agencyData.display_name || '',
          logo_url: agencyData.logo_url || ''
        });
      }

    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const saveConfiguration = async (configType, keys) => {
    setSavingStates(prev => ({ ...prev, [configType]: true }));
    setSaveSuccess(prev => ({ ...prev, [configType]: false }));
    setSaveErrors(prev => ({ ...prev, [configType]: "" }));

    try {
      for (const key of keys) {
        const value = configs[key];
        const id = configIds[key];
        const data = { key, value };

        if (id) {
          await Configuration.update(id, data);
        }
        else if (value) {
          await Configuration.create(data);
        }
      }

      setSaveSuccess(prev => ({ ...prev, [configType]: true }));
      setTimeout(() => {
        setSaveSuccess(prev => ({ ...prev, [configType]: false }));
      }, 3000);
      initialize();
    } catch (error) {
      console.error(`Error saving ${configType} settings:`, error);
      setSaveErrors(prev => ({
        ...prev,
        [configType]: error.message || "An unknown error occurred while saving."
      }));
    } finally {
      setSavingStates(prev => ({ ...prev, [configType]: false }));
    }
  };
  
  const testJotFormConnection = async () => {
    setTestingJotForm(true);
    setJotFormTestResult(null);
    setSaveSuccess(prev => ({ ...prev, jotform: false }));
    setSaveErrors(prev => ({ ...prev, jotform: "" }));

    try {
      const { data, error } = await jotFormBackend({ action: 'testConnection' });

      if (error) {
        setJotFormTestResult({
          success: false,
          error: error.error || "Could not test JotForm connection.",
          debug: error.debug
        });
        setSaveErrors(prev => ({ ...prev, jotform: error.error || "Could not test JotForm connection." }));
      } else {
        setJotFormTestResult(data);
        if (data.success) {
          setSaveSuccess(prev => ({ ...prev, jotform: true }));
          setTimeout(() => {
            setSaveSuccess(prev => ({ ...prev, jotform: false }));
          }, 3000);
        } else {
           setSaveErrors(prev => ({ ...prev, jotform: data.error || "Test connection failed." }));
        }
      }
    } catch (error) {
      setJotFormTestResult({
        success: false,
        error: error.message || "Could not test JotForm connection."
      });
      setSaveErrors(prev => ({ ...prev, jotform: error.message || "Could not test JotForm connection." }));
    } finally {
      setTestingJotForm(false);
    }
  };
  
  const sendTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      setTestEmailResult({ success: false, error: "Please enter a test email address." });
      return;
    }

    setSendingTestEmail(true);
    setTestEmailResult(null);

    try {
      console.log('Testing email with address:', testEmailAddress.trim());

      const result = await EmailService.send({
        to: testEmailAddress.trim(),
        subject: "OneCareDesk System Test Email",
        htmlContent: `
          <h2>Email System Test</h2>
          <p>Hello!</p>
          <p>This is a test email from your OneCareDesk application to verify that the email system is working correctly.</p>
          <p>If you received this email, the email functionality is working!</p>
        `,
        textContent: `
OneCareDesk System Test Email
Hello! This is a test email from your OneCareDesk application to verify that the email system is working correctly.
        `
      });

      console.log('Email service result:', result);
      setTestEmailResult(result);

    } catch (error) {
      console.error('Test email error:', error);
      setTestEmailResult({
        success: false,
        error: error.message || "An unexpected error occurred while sending the email."
      });
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleResendSave = () => saveConfiguration('resend', ['resend_api_key', 'resend_from_email', 'resend_from_name']);
  const handleEmailTemplateSave = () => saveConfiguration('emailTemplate', ['form_submission_email_template']);
  const handleEsignTemplateSave = () => saveConfiguration('esignTemplate', ['esign_request_email_template']); // New save handler

  const handleInputChange = (key, value) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
    let configType = 'unknown';
    if (key.startsWith('resend')) {
      configType = 'resend';
    } else if (key === 'form_submission_email_template') {
      configType = 'emailTemplate';
    } else if (key === 'esign_request_email_template') {
      configType = 'esignTemplate';
    }
    setSaveErrors(prev => ({ ...prev, [configType]: "" }));
    
    if (key.startsWith("resend")) {
      setTestEmailResult(null);
    }
  };

  const handleAgencyInputChange = (e) => {
    const { name, value } = e.target;
    setAgencyForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSaveAgencyProfile = async () => {
    if (!agency) return;
    setSavingStates(prev => ({ ...prev, agency: true }));
    setSaveSuccess(prev => ({ ...prev, agency: false }));
    setSaveErrors(prev => ({ ...prev, agency: "" }));
    
    let updatedForm = { ...agencyForm };

    if (logoFile) {
      setIsUploadingLogo(true);
      try {
        const { file_url } = await UploadFile({ file: logoFile });
        updatedForm.logo_url = file_url;
        setAgencyForm(prev => ({...prev, logo_url: file_url}));
      } catch (uploadError) {
        console.error("Error uploading logo:", uploadError);
        setSaveErrors(prev => ({ ...prev, agency: "Failed to upload new logo. " + (uploadError.message || JSON.stringify(uploadError)) }));
        setSavingStates(prev => ({ ...prev, agency: false }));
        setIsUploadingLogo(false);
        return;
      } finally {
        setIsUploadingLogo(false);
      }
    }

    try {
        await Agency.update(agency.id, updatedForm);
        setSaveSuccess(prev => ({ ...prev, agency: true }));
        setLogoFile(null);
        setTimeout(() => {
            setSaveSuccess(prev => ({ ...prev, agency: false }));
        }, 3000);
        await initialize();
    } catch (error) {
        console.error("Error saving agency profile:", error);
        setSaveErrors(prev => ({ ...prev, agency: error.message || "Failed to save profile." }));
    } finally {
        setSavingStates(prev => ({ ...prev, agency: false }));
    }
  };
  
  const getPreviewHtml = (templateType = 'formSubmission') => {
    let template = '';
    const agencyName = (agency && agency.display_name) ? agency.display_name : "Your Agency Name";
    
    if (templateType === 'formSubmission') {
        template = configs.form_submission_email_template || '';
        template = template.replace(/{{recipient_name}}/g, 'Jane Doe');
        template = template.replace(/{{submission_id}}/g, 'S-987654321');
        template = template.replace(/{{form_id}}/g, 'F-123456789');
    } else if (templateType === 'esignRequest') {
        template = configs.esign_request_email_template || '';
        template = template.replace(/{{recipient_name}}/g, 'John Signer');
        template = template.replace(/{{document_title}}/g, 'Patient Intake Package');
        template = template.replace(/{{custom_message}}/g, 'Please review and sign the attached documents at your earliest convenience.');
        template = template.replace(/{{signature_link}}/g, 'https://example.com/sign/document-id-preview'); // Example link
    }
    
    // Apply common placeholders
    let emailContent = template.replace(/{{agency_name}}/g, agencyName);
    
    // Wrap the email content in a full HTML document for consistent rendering in iframe srcDoc
    const fullHtmlDocument = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Template Preview</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          /* Basic resets to ensure consistent rendering across browsers */
          body {
            margin: 0;
            padding: 20px; /* Add some padding around the email content */
            font-family: Arial, sans-serif;
            background-color: #f0f2f5; /* Light background for contrast */
            color: #333;
          }
        </style>
      </head>
      <body>
        ${emailContent}
      </body>
      </html>
    `;
    
    return fullHtmlDocument;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Modern Header with Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl">
            <SettingsIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Settings & Configuration
            </h1>
            <p className="text-white/90 text-base lg:text-lg">
              Configure your agency profile and system integrations
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-white border border-gray-200 rounded-xl p-1 shadow-lg">
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg flex items-center justify-center gap-2">
              <Building className="w-4 h-4"/>
              Agency & APIs
            </TabsTrigger>
            <TabsTrigger value="forms" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg flex items-center justify-center gap-2">
              <FileText className="w-4 h-4"/>
              Form Management
            </TabsTrigger>
            <TabsTrigger value="communications" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white rounded-lg flex items-center justify-center gap-2">
              <Mail className="w-4 h-4"/>
              Communications
            </TabsTrigger>
          </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-6">
          {/* Agency Profile Card */}
          {isLoading ? (
            <Card className="rounded-2xl shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Building className="w-5 h-5" />
                  Agency Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                <p className="text-gray-500 mt-2">Loading agency data...</p>
              </CardContent>
            </Card>
          ) : (
            currentUser && currentUser.role === 'agency_admin' && agency && (
              <Card className="rounded-2xl shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Building className="w-5 h-5" />
                    Agency Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {saveSuccess.agency && (
                    <Alert className="mb-4 bg-green-50 border-green-200 text-green-800 rounded-xl">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>Agency profile saved successfully!</AlertDescription>
                    </Alert>
                  )}
                  {saveErrors.agency && (
                    <Alert variant="destructive" className="mb-4 rounded-xl">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription><strong>Save Failed:</strong> {saveErrors.agency}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="agency-id">Agency ID</Label>
                      <Input id="agency-id" value={agency.id} readOnly disabled className="mt-1 bg-gray-100" />
                      <p className="text-xs text-gray-500 mt-1">This is your unique agency identifier. It cannot be changed.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="display-name">Display Name</Label>
                        <Input
                          id="display-name"
                          name="display_name"
                          value={agencyForm.display_name}
                          onChange={handleAgencyInputChange}
                          placeholder="e.g., Sunshine Care"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <Label>Agency Logo</Label>
                       <div className="flex items-center gap-4 p-4 border rounded-lg">
                           {agencyForm.logo_url && (
                             <img src={agencyForm.logo_url} alt="Agency Logo" className="w-16 h-16 rounded-md object-contain bg-gray-100 p-1" />
                           )}
                           <div className="flex-1">
                             <Label htmlFor="logo-file-upload" className="text-sm font-medium text-gray-700">Upload new logo</Label>
                             <div className="flex items-center gap-2 mt-1">
                                <Input 
                                  id="logo-file-upload"
                                  type="file"
                                  accept="image/png, image/jpeg, image/gif"
                                  onChange={handleLogoFileChange}
                                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                {isUploadingLogo && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                             </div>
                             <p className="text-xs text-gray-500 mt-1">Max file size 5MB. Recommended dimensions: 200x200px.</p>
                           </div>
                       </div>
                       {logoFile && (
                          <p className="text-sm text-green-600">New logo ready to upload: {logoFile.name}</p>
                       )}
                    </div>

                    <div className="flex justify-end">
                      <Button onClick={handleSaveAgencyProfile} disabled={savingStates.agency || isUploadingLogo}>
                        {savingStates.agency || isUploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                        ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Agency Profile
                        </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          {/* JotForm API Configuration */}
          <Card>
            <CardHeader className="bg-orange-50 border-b">
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <FileSignature className="w-5 h-5" />
                JotForm API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {saveSuccess.jotform && (
                <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>JotForm configuration test successful!</AlertDescription>
                </Alert>
              )}

              {saveErrors.jotform && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Test Failed:</strong> {saveErrors.jotform}
                  </AlertDescription>
                </Alert>
              )}

              {jotFormTestResult && (
                <Alert className={`mb-4 ${jotFormTestResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                  {jotFormTestResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertDescription>
                      <div className="font-bold mb-2">
                        {jotFormTestResult.success ? 'Connection Successful!' : `Connection Failed: ${jotFormTestResult.error}`}
                      </div>
                      {jotFormTestResult.debug && (
                         <details className="mt-4 p-3 bg-gray-50 border rounded">
                          <summary className="cursor-pointer font-medium text-gray-700">🔍 Show Debug Information</summary>
                          <div className="mt-2 space-y-2 text-xs font-mono">
                             <div>
                                <strong>Key Source:</strong>
                                <code className="bg-gray-100 p-1 rounded ml-2">{jotFormTestResult.debug.keySource}</code>
                             </div>
                             <div>
                                <strong>Endpoint Called:</strong>
                                <code className="bg-gray-100 p-1 rounded ml-2">{jotFormTestResult.debug.requestUrl}</code>
                             </div>
                             <div>
                                <strong>Response Status:</strong>
                                <code className="bg-gray-100 p-1 rounded ml-2">{jotFormTestResult.debug.responseStatus}</code>
                             </div>
                             {jotFormTestResult.debug.responseData && (
                                <div>
                                   <strong>Response Data:</strong>
                                   <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto max-h-40">{JSON.stringify(jotFormTestResult.debug.responseData, null, 2)}</pre>
                                </div>
                             )}
                          </div>
                         </details>
                      )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                  <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                    <FileSignature className="h-4 w-4" />
                    <AlertDescription>
                      <p><strong>🔒 Secure Backend Integration:</strong> Your JotForm API key is stored securely in your app's secrets and accessed via backend functions only.</p>
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      onClick={testJotFormConnection}
                      disabled={testingJotForm}
                      className="w-full max-w-xs"
                    >
                      {testingJotForm ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        'Test JotForm Connection'
                      )}
                    </Button>
                  </div>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6 mt-6">
          {/* Form Submission Endpoint */}
          <Card>
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="flex items-center gap-2 text-green-700">
                <FileText className="w-5 h-5" />
                Universal Form Handler Endpoint
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div>
                <Label htmlFor="form-handler-url">Universal Form Handler URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="form-handler-url"
                    value={`${window.location.origin}/functions/formSubmissionHandler`}
                    readOnly
                    className="bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}/functions/formSubmissionHandler`;
                      navigator.clipboard.writeText(url);
                      alert('Form Handler URL copied to clipboard!');
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This endpoint should be used as the redirect URL after a form is submitted.
                </p>
              </div>
              <Alert className="mt-4 bg-blue-50 border-blue-200 text-blue-800">
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  <p><strong>Required Form Fields:</strong></p>
                  <p className="text-sm">For automatic PDF emailing, ensure your form submission includes fields with these exact names:</p>
                  <ul className="list-disc list-inside text-sm mt-2 font-mono">
                    <li><code className="bg-blue-100 p-1 rounded">agency_id</code> - <strong className="text-red-600">(CRITICAL)</strong> Add this as a hidden field to your form.</li>
                    <li><code className="bg-blue-100 p-1 rounded">formID</code> - The ID of the form from JotForm.</li>
                    <li><code className="bg-blue-100 p-1 rounded">submissionID</code> - The submission ID from JotForm.</li>
                    <li><code className="bg-blue-100 p-1 rounded">reportid</code> - The PDF Report ID from JotForm.</li>
                    <li><code className="bg-blue-100 p-1 rounded">email</code> - The email address of the person who submitted the form.</li>
                  </ul>
                  <p className="text-sm mt-2"><strong>How to add the Agency ID:</strong> In your JotForm builder, add a "Short Text" field, label it "Agency ID", then hide it under the Advanced tab. You can pre-populate it via the form URL.</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Form Management */}
          <Card>
            <CardHeader className="bg-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <FileText className="w-5 h-5" />
                Local Form Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-center bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:text-blue-800 font-semibold h-12">
                    <LayoutTemplate className="w-5 h-5 mr-2" />
                    Manage Form Templates
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[90vh]">
                    <FormTemplates />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-center bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800 font-semibold h-12">
                    <Inbox className="w-5 h-5 mr-2" />
                    View Form Submissions
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl h-[90vh] p-0">
                    <SimpleFormSubmissions />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6 mt-6">
          {/* Email Configuration */}
          <Card>
            <CardHeader className="bg-purple-50 border-b">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Mail className="w-5 h-5" />
                Resend Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {saveSuccess.resend && (
                <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Resend configuration saved successfully!</AlertDescription>
                </Alert>
              )}

              {saveErrors.resend && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Save Failed:</strong> {saveErrors.resend}
                  </AlertDescription>
                </Alert>
              )}

              {testEmailResult && (
                <Alert className={`mb-4 ${testEmailResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                  {testEmailResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertDescription>
                    {testEmailResult.success ? (
                      <div>
                        <strong>Test Email Sent Successfully!</strong>
                        <br />{testEmailResult.message}
                      </div>
                    ) : (
                      <span><strong>Test Email Failed:</strong> {testEmailResult.error}</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-gray-500" /> : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="resend-api-key">Resend API Key</Label>
                    <Input
                      id="resend-api-key"
                      type="password"
                      placeholder="Enter your Resend API key (starts with re_)"
                      value={configs.resend_api_key}
                      onChange={(e) => handleInputChange("resend_api_key", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="resend-from-email">From Email</Label>
                      <Input
                        id="resend-from-email"
                        type="email"
                        placeholder="e.g., no-reply@yourdomain.com"
                        value={configs.resend_from_email}
                        onChange={(e) => handleInputChange("resend_from_email", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="resend-from-name">From Name</Label>
                      <Input
                        id="resend-from-name"
                        type="text"
                        placeholder="e.g., OneCareDesk Portal"
                        value={configs.resend_from_name}
                        onChange={(e) => handleInputChange("resend_from_name", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <Label htmlFor="test-email-resend">Test Email Address</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="test-email-resend"
                          type="email"
                          placeholder="Enter any email address to test"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={sendTestEmail}
                          disabled={sendingTestEmail || !testEmailAddress.trim()}
                        >
                          {sendingTestEmail ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Test
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end items-center">
                    <Button onClick={handleResendSave} disabled={savingStates.resend}>
                      {savingStates.resend ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Resend Config
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Submission Email Template */}
          <Card>
            <CardHeader className="bg-teal-50 border-b">
              <CardTitle className="flex items-center gap-2 text-teal-700">
                <Mail className="w-5 h-5" />
                Form Submission Email Template
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {saveSuccess.emailTemplate && (
                <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>Email template saved successfully!</AlertDescription>
                </Alert>
              )}

              {saveErrors.emailTemplate && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Save Failed:</strong> {saveErrors.emailTemplate}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email-template">Email Body (HTML)</Label>
                  <Textarea
                    id="email-template"
                    placeholder="Enter your email HTML here..."
                    value={configs.form_submission_email_template}
                    onChange={(e) => handleInputChange("form_submission_email_template", e.target.value)}
                    className="mt-1 font-mono min-h-[250px]"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Placeholders:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["{{recipient_name}}", "{{submission_id}}", "{{agency_name}}", "{{form_id}}"].map(tag => (
                      <code key={tag} className="text-xs bg-gray-100 p-1 rounded font-semibold">{tag}</code>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2">
                   <Button variant="outline" type="button" onClick={() => { setPreviewTemplateType('formSubmission'); setIsEmailPreviewOpen(true); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                  </Button>
                  <Button onClick={handleEmailTemplateSave} disabled={savingStates.emailTemplate}>
                    {savingStates.emailTemplate ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* E-Sign Request Email Template */}
          <Card>
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <FileSignature className="w-5 h-5" />
                E-Sign Request Email Template
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {saveSuccess.esignTemplate && (
                <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>E-Sign email template saved successfully!</AlertDescription>
                </Alert>
              )}

              {saveErrors.esignTemplate && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Save Failed:</strong> {saveErrors.esignTemplate}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="esign-template">Email Body (HTML)</Label>
                  <Textarea
                    id="esign-template"
                    placeholder="Enter your E-Sign email HTML here..."
                    value={configs.esign_request_email_template}
                    onChange={(e) => handleInputChange("esign_request_email_template", e.target.value)}
                    className="mt-1 font-mono min-h-[250px]"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Placeholders:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                     {["{{recipient_name}}", "{{document_title}}", "{{agency_name}}", "{{custom_message}}", "{{signature_link}}"].map(tag => (
                      <code key={tag} className="text-xs bg-gray-100 p-1 rounded font-semibold">{tag}</code>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end items-center gap-2">
                   <Button variant="outline" type="button" onClick={() => { setPreviewTemplateType('esignRequest'); setIsEmailPreviewOpen(true); }}>
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                  </Button>
                  <Button onClick={handleEsignTemplateSave} disabled={savingStates.esignTemplate}>
                    {savingStates.esignTemplate ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Template
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NEW: Webhook Test Viewer */}
          <WebhookTestViewer />
        </TabsContent>

        <Dialog open={isEmailPreviewOpen} onOpenChange={setIsEmailPreviewOpen}>
          <DialogContent className="max-w-3xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Email Template Preview</DialogTitle>
              <DialogDescription>This is how the email will appear to recipients. Content is populated with sample data.</DialogDescription>
            </DialogHeader>
            <div className="mt-4 border rounded-lg overflow-hidden h-full">
              <iframe
                srcDoc={getPreviewHtml(previewTemplateType)}
                title="Email Preview"
                className="w-full h-full border-0"
              />
            </div>
          </DialogContent>
        </Dialog>
      </Tabs>
      </motion.div>
    </div>
  );
}

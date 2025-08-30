
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Key, Save, Loader2, FileSignature, CheckCircle, AlertTriangle, Workflow, Share2, Mail, Wrench, Building, ShieldCheck } from "lucide-react";
import { Configuration } from "@/api/entities";
import { Agency } from "@/api/entities";
import { Link } from "react-router-dom";
import EmailService from "@/components/integrations/EmailService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { boldSignAPI } from "@/api/functions";
import { jotFormAPI as jotFormBackend } from "@/api/functions";
import TestSignDialog from '@/components/settings/TestSignDialog';

const createPageUrl = (pageName) => {
  switch (pageName) {
    case "Architecture":
      return "/Architecture";
    default:
      return `/${pageName.toLowerCase()}`;
  }
};

export default function Settings() {
  const [configs, setConfigs] = useState({
    boldsign_api_key: "",
    fillout_api_key: "",
    resend_api_key: "",
    resend_from_email: "",
    resend_from_name: "",
  });
  const [configIds, setConfigIds] = useState({
    boldsign_api_key: null,
    fillout_api_key: null,
    resend_api_key: null,
    resend_from_email: null,
    resend_from_name: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [savingStates, setSavingStates] = useState({
    boldsign: false,
    jotform: false,
    fillout: false,
    resend: false,
    agency: false,
  });
  const [saveSuccess, setSaveSuccess] = useState({
    boldsign: false,
    jotform: false,
    fillout: false,
    resend: false,
    agency: false,
  });
  const [saveErrors, setSaveErrors] = useState({
    boldsign: "",
    jotform: "",
    fillout: "",
    resend: "",
    agency: "",
  });

  const [configsMissing, setConfigsMissing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const [testingJotForm, setTestingJotForm] = useState(false);
  const [jotFormTestResult, setJotFormTestResult] = useState(null);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  const [testingBoldSign, setTestingBoldSign] = useState(false);
  const [boldSignTestResult, setBoldSignTestResult] = useState(null);
  const [isTestSignDialogOpen, setIsTestSignDialogOpen] = useState(false);


  const [currentUser, setCurrentUser] = useState(null);
  const [agency, setAgency] = useState(null);
  const [agencyForm, setAgencyForm] = useState({ display_name: '', logo_url: '' });

  const initialize = async () => {
    setIsLoading(true);
    try {
      const userString = localStorage.getItem('app_user');
      if (!userString) throw new Error("No user session found. Please log in.");
      const user = JSON.parse(userString);
      setCurrentUser(user);

      const allConfigs = await Configuration.list();
      const loadedConfigs = {
        boldsign_api_key: "",
        fillout_api_key: "",
        resend_api_key: "",
        resend_from_email: "",
        resend_from_name: "",
      };
      const loadedIds = {
        boldsign_api_key: null,
        fillout_api_key: null,
        resend_api_key: null,
        resend_from_email: null,
        resend_from_name: null,
      };

      allConfigs.forEach(config => {
        if (config.key in loadedConfigs) {
          loadedConfigs[config.key] = config.value;
          loadedIds[config.key] = config.id;
        }
      });

      const requiredKeys = [
        'boldsign_api_key',
        'fillout_api_key',
        'resend_api_key',
        'resend_from_email',
        'resend_from_name',
      ];
      const missing = requiredKeys.some(key => !allConfigs.some(c => c.key === key));
      setConfigsMissing(missing);

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
  };

  useEffect(() => {
    initialize();
  }, []);

  const handleRestoreConfigs = async () => {
    setIsRestoring(true);
    const requiredKeys = [
        'boldsign_api_key',
        'fillout_api_key',
        'resend_api_key',
        'resend_from_email',
        'resend_from_name',
    ];
    try {
        for (const key of requiredKeys) {
            const existing = await Configuration.filter({ key });
            if (existing.length === 0) {
                await Configuration.create({ key, value: '', description: `Restored configuration for ${key}` });
            }
        }
        await initialize();
        setConfigsMissing(false);
    } catch (error) {
        console.error("Failed to restore configurations:", error);
        alert('An error occurred while restoring settings. Please refresh the page and try again.');
    } finally {
        setIsRestoring(false);
    }
  };

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
          if (value) {
            await Configuration.update(id, data);
          } else {
            await Configuration.update(id, { ...data, value: "" });
          }
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

  const testBoldSignConnection = async () => {
    setTestingBoldSign(true);
    setBoldSignTestResult(null);
    setSaveErrors(prev => ({ ...prev, boldsign: "" }));
    setSaveSuccess(prev => ({ ...prev, boldsign: false }));

    try {
      const requestPayload = { action: 'testConnection' };
      console.log('🔍 About to call boldSignAPI with:', requestPayload);
      
      const response = await boldSignAPI(requestPayload);
      console.log('📦 Raw response from boldSignAPI:', response);
      console.log('📦 Response.data:', response.data);
      console.log('📦 Response.error:', response.error);

      const { data, error } = response;

      if (error) {
        console.log('❌ Error path - error object:', error);
        setBoldSignTestResult({
          success: false,
          error: error.error || error.message || 'An unknown error occurred.',
          debug: error.debug || error,
          rawResponse: { data, error }
        });
      } else if (data) {
        console.log('✅ Success path - data object:', data);
        setBoldSignTestResult({
          success: data.success !== false,
          message: data.message,
          debug: data.debug || data,
          rawResponse: { data, error }
        });
      } else {
        console.log('⚠️ Unexpected response structure');
        setBoldSignTestResult({
          success: false,
          error: 'Unexpected response structure from backend',
          rawResponse: { data, error }
        });
      }
    } catch (e) {
      console.error("Error testing BoldSign connection:", e);
      setBoldSignTestResult({
        success: false,
        error: e.message || "Failed to call the test function.",
        jsError: e.stack
      });
    } finally {
      setTestingBoldSign(false);
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
          debug: error.debug // Pass debug information from the error object
        });
        setSaveErrors(prev => ({ ...prev, jotform: error.error || "Could not test JotForm connection." }));
      } else {
        setJotFormTestResult(data); // data will now contain the debug info
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
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Sent at: ${new Date().toLocaleString()}</li>
            <li>Provider: Resend</li>
          </ul>
          <p>If you received this email, the email functionality is working!</p>
          <hr>
          <p><small>This email was sent from the OneCareDesk settings page as a test.</small></p>
        `,
        textContent: `
OneCareDesk System Test Email
Hello!
This is a test email from your OneCareDesk application to verify that the email system is working correctly.
Test Details:
- Sent at: ${new Date().toLocaleString()}
- Provider: Resend
If you received this email, the email functionality is working!
This email was sent from the OneCareDesk settings page as a test.
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

  const handleFilloutSave = () => saveConfiguration('fillout', ['fillout_api_key']);
  const handleResendSave = () => saveConfiguration('resend', ['resend_api_key', 'resend_from_email', 'resend_from_name']);
  const handleBoldSignSave = () => saveConfiguration('boldsign', ['boldsign_api_key']);

  const handleInputChange = (key, value) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
    const configType =
      key.startsWith('boldsign') ? 'boldsign' :
      key.startsWith('fillout') ? 'fillout' :
      key.startsWith('resend') ? 'resend' :
        'unknown';
    setSaveErrors(prev => ({ ...prev, [configType]: "" }));
    
    if (key.startsWith("boldsign")) {
      setBoldSignTestResult(null);
    }
    if (key.startsWith("resend")) {
      setTestEmailResult(null);
    }
  };

  const handleAgencyInputChange = (e) => {
    const { name, value } = e.target;
    setAgencyForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveAgencyProfile = async () => {
    if (!agency) return;
    setSavingStates(prev => ({ ...prev, agency: true }));
    setSaveSuccess(prev => ({ ...prev, agency: false }));
    setSaveErrors(prev => ({ ...prev, agency: "" }));
    try {
        await Agency.update(agency.id, agencyForm);
        setSaveSuccess(prev => ({ ...prev, agency: true }));
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Key className="w-8 h-8 text-gray-700" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Key Management</h1>
          <p className="text-gray-600">Configure API keys for third-party services.</p>
        </div>
      </div>

      {configsMissing && !isLoading && (
        <Card className="mb-6 border-amber-500 bg-amber-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800">
                    <Wrench className="w-5 h-5"/>
                    Missing Configuration
                </CardTitle>
                <CardDescription className="text-amber-700">
                    It looks like some essential configuration records are missing. This can happen if they were accidentally deleted. You can restore the default records here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleRestoreConfigs} disabled={isRestoring}>
                    {isRestoring ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                            Restoring...
                        </>
                    ) : (
                        <>
                            <Wrench className="w-4 h-4 mr-2"/>
                            Restore Configuration Records
                        </>
                    )}
                </Button>
                <p className="text-xs text-amber-600 mt-2">This will re-create the settings fields. You will still need to enter your API keys.</p>
            </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {/* Agency Profile Card - NEW */}
        {isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-500" />
                Agency Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              <p className="text-gray-500 mt-2">Loading agency data...</p>
            </CardContent>
          </Card>
        ) : (
          currentUser && currentUser.role === 'agency_admin' && agency && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-blue-500" />
                        Agency Profile
                    </CardTitle>
                    <CardDescription>
                        Manage your agency's public-facing information.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {saveSuccess.agency && (
                        <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>Agency profile saved successfully!</AlertDescription>
                        </Alert>
                    )}
                    {saveErrors.agency && (
                        <Alert variant="destructive" className="mb-4">
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
                            <div>
                                <Label htmlFor="logo-url">Logo URL</Label>
                                <Input
                                    id="logo-url"
                                    name="logo_url"
                                    value={agencyForm.logo_url}
                                    onChange={handleAgencyInputChange}
                                    placeholder="https://example.com/logo.png"
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleSaveAgencyProfile} disabled={savingStates.agency}>
                                {savingStates.agency ? (
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

        {/* NEW: Webhook URLs Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-500" />
              Webhook Configuration
            </CardTitle>
            <CardDescription>
              Copy these URLs to configure webhooks in your external services (BoldSign, JotForm, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="boldsign-webhook">BoldSign Webhook URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="boldsign-webhook"
                    value={`${window.location.origin.replace(window.location.hostname, window.location.hostname.includes('localhost') ? 'localhost:8000' : window.location.hostname)}/functions/boldSignWebhook`}
                    readOnly
                    className="bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin.replace(window.location.hostname, window.location.hostname.includes('localhost') ? 'localhost:8000' : window.location.hostname)}/functions/boldSignWebhook`;
                      navigator.clipboard.writeText(url);
                      alert('Webhook URL copied to clipboard!');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="jotform-webhook">JotForm Webhook URL (Future)</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="jotform-webhook"
                    value={`${window.location.origin.replace(window.location.hostname, window.location.hostname.includes('localhost') ? 'localhost:8000' : window.location.hostname)}/functions/jotFormWebhook`}
                    readOnly
                    className="bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin.replace(window.location.hostname, window.location.hostname.includes('localhost') ? 'localhost:8000' : window.location.hostname)}/functions/jotFormWebhook`;
                      navigator.clipboard.writeText(url);
                      alert('JotForm Webhook URL copied to clipboard!');
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
            
            <Alert className="mt-4">
              <Workflow className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p><strong>🔗 How to Use These URLs:</strong></p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li><strong>BoldSign:</strong> Go to API & Webhooks → Webhooks → Create Webhook → Paste the BoldSign URL</li>
                    <li><strong>Select Events:</strong> Choose document events like Sent, Viewed, Completed, Declined</li>
                    <li><strong>Save:</strong> Your app will now receive real-time updates when documents are signed!</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Resend Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-purple-500" />
              Resend Email Configuration (Primary Email Service)
            </CardTitle>
            <CardDescription>
              Configure Resend for reliable email delivery to any email address. This is the primary email service for OneCareDesk.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                      <br /><small>Check your inbox (and spam folder) for the test email.</small>
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
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Resend Advantage:</strong> Can send emails to any external email address (customers, leads, patients, etc.).
                      </AlertDescription>
                    </Alert>
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

        {/* BoldSign Configuration Card - UPDATED */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-500" />
              BoldSign E-Signature
            </CardTitle>
            <CardDescription>
              Configure your BoldSign API key for e-signature functionality. You can manage this key here or use environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {saveSuccess.boldsign && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>BoldSign configuration saved successfully!</AlertDescription>
              </Alert>
            )}

            {saveErrors.boldsign && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Save Failed:</strong> {saveErrors.boldsign}
                </AlertDescription>
              </Alert>
            )}

            {boldSignTestResult && (
              <Alert className={`mb-4 ${boldSignTestResult.success ? 'bg-green-50 border-green-200 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
                {boldSignTestResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertDescription>
                    <div className="font-bold mb-2">
                        {boldSignTestResult.success ? 'Connection Successful!' : `Connection Failed: ${boldSignTestResult.error}`}
                    </div>

                    <details className="mt-4 p-3 bg-gray-50 border rounded">
                        <summary className="cursor-pointer font-medium text-gray-700">🔍 Show Debug & Trace Information</summary>
                        <div className="mt-2 space-y-3 text-xs font-mono">
                            
                            {/* Raw Response Debug */}
                            <div>
                                <strong>Raw Backend Response:</strong>
                                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto border text-red-600">
                                    {JSON.stringify(boldSignTestResult.rawResponse, null, 2)}
                                </pre>
                            </div>

                            {boldSignTestResult.debug?.trace && (
                                <div>
                                    <strong>API Key Retrieval Trace:</strong>
                                    <div className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto border">
                                        {boldSignTestResult.debug.trace.map((line, index) => (
                                            <div key={index} className={line.startsWith('ERROR') || line.startsWith('FATAL') ? 'text-red-600' : line.startsWith('SUCCESS') ? 'text-green-600' : ''}>
                                                {line}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <strong>API Key Used:</strong>
                                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-red-600">
                                    {boldSignTestResult.debug?.apiKeyUsed || 'Not provided'}
                                </pre>
                                <p className="text-red-600 text-xs mt-1">⚠️ Sensitive information - do not share publicly</p>
                            </div>
                            <div>
                                <strong>Final Key Source:</strong>
                                <code className="bg-gray-100 p-1 rounded ml-2">{boldSignTestResult.debug?.finalSource || 'unknown'}</code>
                            </div>
                            <div>
                                <strong>Environment Detected:</strong>
                                <code className="bg-gray-100 p-1 rounded ml-2">{boldSignTestResult.debug?.environment || 'unknown'}</code>
                            </div>

                            {/* Show full debug object */}
                            <div>
                                <strong>Full Debug Object:</strong>
                                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto border">
                                    {JSON.stringify(boldSignTestResult.debug, null, 2)}
                                </pre>
                            </div>

                            {boldSignTestResult.jsError && (
                                <div>
                                    <strong>JavaScript Error:</strong>
                                    <pre className="bg-red-100 p-2 rounded mt-1 overflow-x-auto border text-red-600">
                                        {boldSignTestResult.jsError}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </details>
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-gray-500" /> : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="boldsign-api-key">BoldSign API Key</Label>
                  <Input
                    id="boldsign-api-key"
                    type="password"
                    placeholder="Enter your BoldSign API key"
                    value={configs.boldsign_api_key}
                    onChange={(e) => handleInputChange("boldsign_api_key", e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get your API key from BoldSign → Settings → API Keys
                  </p>
                </div>

                <div className="flex justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={testBoldSignConnection}
                    disabled={testingBoldSign}
                  >
                    {testingBoldSign ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsTestSignDialogOpen(true)}
                      className="bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      <FileSignature className="w-4 h-4 mr-2" />
                      Run Step-by-Step Test
                    </Button>

                    <Button onClick={handleBoldSignSave} disabled={savingStates.boldsign}>
                      {savingStates.boldsign ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save BoldSign Config
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* JotForm Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-orange-500" />
              JotForm Sign Configuration
            </CardTitle>
            <CardDescription>
              Test your connection to the JotForm API. The API key must be configured as a secret named <code>JOTFORM_API_KEY</code> in the Base44 dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    {jotFormTestResult.success && jotFormTestResult.message && (
                      <p>{jotFormTestResult.message}</p>
                    )}
                    {jotFormTestResult.success && jotFormTestResult.accountType && (
                        <div className="mt-1 text-sm">
                          Account Type: {jotFormTestResult.accountType}
                          {jotFormTestResult.formsCount && (
                            <span> | Forms: {jotFormTestResult.formsCount}</span>
                          )}
                        </div>
                      )}
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
                    <div className="space-y-2">
                      <p><strong>🔒 Secure Backend Integration:</strong></p>
                      <p className="text-sm">Your JotForm API key is now stored securely in your app's secrets and accessed via backend functions only. This provides better security than browser-based API calls.</p>
                    </div>
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

                <Alert className="mt-4">
                  <FileSignature className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>📄 JotForm Sign Integration:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Your JotForm API key is stored securely in Base44 app secrets.</li>
                        <li>Create signable documents in your JotForm Sign account.</li>
                        <li>When creating signature requests, you'll select from your list of active Sign documents.</li>
                        <li>Recipients will be emailed a direct link to sign the document.</li>
                      </ol>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
          </CardContent>
        </Card>

        {/* Fillout Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-purple-500" />
              Fillout Configuration
            </CardTitle>
            <CardDescription>
              Enter your API key to enable Fillout integration for forms and e-signatures. You can find your API key in your Fillout account under Settings → API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {saveSuccess.fillout && (
              <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Fillout configuration saved successfully!</AlertDescription>
              </Alert>
            )}

            {saveErrors.fillout && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Save Failed:</strong> {saveErrors.fillout}
                </AlertDescription>
              </Alert>
            )}

            {isLoading ? <Loader2 className="w-6 h-6 animate-spin text-gray-500" /> : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fillout-api-key">Fillout API Key</Label>
                  <Input
                    id="fillout-api-key"
                    type="password"
                    placeholder="Enter your Fillout API key"
                    value={configs.fillout_api_key || ''}
                    onChange={(e) => handleInputChange("fillout_api_key", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end items-center">
                  <Button onClick={handleFilloutSave} disabled={savingStates.fillout}>
                    {savingStates.fillout ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Fillout Config
                      </>
                    )}
                  </Button>
                </div>

                <Alert className="mt-4">
                  <FileSignature className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p><strong>📝 Fillout Integration:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Create forms with signature fields in your Fillout account.</li>
                        <li>Enter your API key above and save.</li>
                        <li>When creating signature requests, select from your published Fillout forms.</li>
                        <li>Recipients will receive an email with a direct link to complete and sign the form.</li>
                      </ol>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Card for Architecture Diagram Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-gray-700" />
              System Architecture
            </CardTitle>
            <CardDescription>
              View the high-level architecture diagram to understand how the different parts of the application work together.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/Architecture">
              <Button variant="outline" className="w-full">
                <Share2 className="w-4 h-4 mr-2" />
                View Architecture Diagram
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <TestSignDialog open={isTestSignDialogOpen} onOpenChange={setIsTestSignDialogOpen} />
    </div>
  );
}

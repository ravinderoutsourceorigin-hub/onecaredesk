
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle, FileSignature, Rocket, Server, ChevronDown, ChevronRight } from 'lucide-react';
import { boldSignAPI } from '@/api/functions';

const LogEntry = ({ log }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasData = log.data !== null;

  return (
    <div className="text-sm border-b border-gray-200 py-2">
      <div 
        className={`flex items-center justify-between ${hasData ? 'cursor-pointer' : ''}`}
        onClick={() => hasData && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {log.message.includes('🚀') && <Rocket className="w-4 h-4 text-blue-500" />}
          {log.message.includes('Step') && <Server className="w-4 h-4 text-gray-500" />}
          {log.message.includes('❌') && <AlertTriangle className="w-4 h-4 text-red-500" />}
          {log.message.includes('✅') && <CheckCircle className="w-4 h-4 text-green-500" />}
          <span className="font-medium">{log.message}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{log.timestamp}</span>
          {hasData && (isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
        </div>
      </div>
      {isOpen && hasData && (
        <pre className="mt-2 p-2 bg-gray-800 text-white rounded-md text-xs whitespace-pre-wrap overflow-x-auto">
          {log.data}
        </pre>
      )}
    </div>
  );
};


const TestSignDialog = ({ open, onOpenChange }) => {
  const [testRun, setTestRun] = useState({
    step: 'idle',
    logs: [],
    error: null,
    success: false,
  });

  const addLog = useCallback((message, data = null) => {
    const formattedData = data === null ? null : JSON.stringify(data, null, 2);
    setTestRun(prev => ({
      ...prev,
      logs: [...prev.logs, { message, data: formattedData, timestamp: new Date().toLocaleTimeString() }],
    }));
  }, []);

  const resetState = useCallback(() => {
    setTestRun({
      step: 'idle',
      logs: [],
      error: null,
      success: false,
    });
  }, []);

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open, resetState]);

  const runTest = async () => {
    setTestRun({ step: 'fetching', logs: [], error: null, success: false });
    addLog('🚀 Test Started');

    try {
      // Step 1: Fetch Templates
      addLog('Step 1: Fetching templates from BoldSign...');
      const getTemplatesPayload = { action: 'getTemplates' };
      addLog('  - Sending request to `boldSignAPI`', getTemplatesPayload);
      const { data: templatesResponse, error: templatesError } = await boldSignAPI(getTemplatesPayload);
      addLog('  - Received response from backend', { data: templatesResponse, error: templatesError });

      if (templatesError) throw new Error(templatesError.error || 'Failed to fetch templates due to an unknown backend error.');
      if (!templatesResponse?.success) throw new Error(`Backend failed to fetch templates: ${templatesResponse?.error || 'No data returned'}`);

      const allTemplates = templatesResponse?.templates || [];
      if (allTemplates.length === 0) throw new Error('No templates found in your BoldSign account. Please create one first.');
      
      addLog(`✅ Step 1 Success: Found ${allTemplates.length} template(s).`);

      const firstValidTemplate = allTemplates.find(t => t.templateId && t.signerRoles && t.signerRoles.length > 0);
      if (!firstValidTemplate) throw new Error('No sendable templates found. A valid template must have defined signer roles in BoldSign.');
      addLog(`  - Using first valid template: "${firstValidTemplate.templateName}" (ID: ${firstValidTemplate.templateId})`);

      // Step 2: Send Signature Request
      setTestRun(prev => ({ ...prev, step: 'sending' }));
      addLog('Step 2: Sending a test signature request...');

      const testRecipients = firstValidTemplate.signerRoles.map((roleName, index) => ({
        name: `Test ${roleName}`,
        email: `boldsign.test.${roleName.toLowerCase().replace(/ /g, '_')}${index}@mailinator.com`,
        signerRole: roleName,
      }));

      const sendRequestPayload = {
        action: 'sendSignatureRequest',
        templateId: firstValidTemplate.templateId,
        recipientsWithRoles: testRecipients,
        title: `TEST: OneCareDesk Request - ${new Date().toLocaleTimeString()}`,
        message: 'This is an automated test signature request from the OneCareDesk settings dialog.',
      };
      addLog('  - Sending request to `boldSignAPI`', sendRequestPayload);

      // Using the original function name
      const response = await boldSignAPI(sendRequestPayload);
      addLog('  - Raw response from backend', response);

      // The `boldSignAPI` function might return a non-JSON success response on 200 OK.
      // And it returns a JSON error response on failure.
      const { data, error } = response;

      if (error) {
         throw new Error(error.error || JSON.stringify(error));
      }
      
      // If there's no error, the `data` should contain the success response from BoldSign
      let responseData = data;
      try {
        // The body of the success response is also JSON, let's parse it if it's a string
        if(typeof responseData === 'string') {
          responseData = JSON.parse(responseData);
        }
      } catch(e) {
        // It wasn't a JSON string, which is fine. Just log it as is.
      }
      
      addLog('✅ Step 2 Success: Test document sent!', responseData);
      setTestRun(prev => ({ ...prev, success: true }));

    } catch (e) {
      addLog(`❌ Test Failed: ${e.message}`);
      setTestRun(prev => ({ ...prev, error: e.message }));
    } finally {
      setTestRun(prev => ({ ...prev, step: 'results' }));
    }
  };

  const renderContent = () => {
    switch (testRun.step) {
      case 'idle':
        return (
          <div className="text-center p-8">
            <p className="text-gray-600 mb-6">
              This will perform a live, step-by-step test of the BoldSign integration. It will:
            </p>
            <ol className="list-decimal list-inside text-left mx-auto max-w-md space-y-2 mb-8">
              <li>Fetch available e-signature templates from your BoldSign account.</li>
              <li>Select the first valid template found.</li>
              <li>Send a real signature request to test email addresses using that template.</li>
            </ol>
            <Button size="lg" onClick={runTest}>
              <Rocket className="w-5 h-5 mr-2" />
              Start Live Test
            </Button>
          </div>
        );
      case 'fetching':
      case 'sending':
      case 'results':
        return (
          <div className="p-1 space-y-4">
             {testRun.step === 'results' && (
                testRun.success ? (
                   <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                     <CheckCircle className="h-4 w-4 text-green-600" />
                     <AlertTitle>Test Completed Successfully!</AlertTitle>
                     <AlertDescription>The signature request was sent. Check Mailinator for test emails.</AlertDescription>
                   </Alert>
                ) : (
                   <Alert variant="destructive">
                     <AlertTriangle className="h-4 w-4" />
                     <AlertTitle>Test Failed</AlertTitle>
                     <AlertDescription className="break-words">{testRun.error}</AlertDescription>
                   </Alert>
                )
             )}
            <div className="border rounded-lg p-4 bg-gray-50 max-h-[40vh] overflow-y-auto">
              <h4 className="font-semibold text-gray-800 mb-2">Diagnostic Log</h4>
              <div className="space-y-1">
                {testRun.logs.map((log, i) => <LogEntry key={i} log={log} />)}
                {['fetching', 'sending'].includes(testRun.step) && (
                  <div className="flex items-center gap-2 pt-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin"/>
                    <span>{testRun.step === 'fetching' ? 'Fetching templates...' : 'Sending test request...'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSignature />
            BoldSign Integration Test
          </DialogTitle>
          <DialogDescription>
            A step-by-step test to ensure your BoldSign API connection is working correctly.
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-[300px] flex items-center justify-center">
          {renderContent()}
        </div>
        <DialogFooter>
          {testRun.step === 'results' && (
             <Button variant="outline" onClick={runTest}>
                Run Test Again
            </Button>
          )}
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
             Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestSignDialog;

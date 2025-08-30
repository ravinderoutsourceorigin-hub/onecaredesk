
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2, Beaker, Server, Globe, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Configuration } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { boldSignAPI } from '@/api/functions';

const ResultDisplay = ({ title, status = 'idle', data = null, icon }) => (
  <div className="mt-2">
    <h4 className="font-semibold flex items-center gap-2">
      {icon}
      {title}
    </h4>
    {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin mt-1" />}
    {status && status !== 'loading' && status !== 'idle' && (
      <Alert className={`mt-1 ${status === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
        {status === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <AlertDescription className="text-xs break-words">
          <p className="font-bold mb-1">{status.toUpperCase()}</p>
          <pre className="whitespace-pre-wrap font-mono text-xs">{JSON.stringify(data, null, 2)}</pre>
        </AlertDescription>
      </Alert>
    )}
    {status === 'idle' && (
      <div className="mt-1 p-3 border border-gray-200 rounded-md bg-gray-50">
        <p className="text-xs text-gray-500">Click the test button above to run this test</p>
      </div>
    )}
  </div>
);

export default function IntegrationTest() {
  const [boldsignResults, setBoldsignResults] = useState({
    backend: { status: 'idle' }
  });
  const [jotformResults, setJotformResults] = useState({
    direct: { status: 'idle' },
    proxy: { status: 'idle' }
  });
  const [isTestingBoldSign, setIsTestingBoldSign] = useState(false);
  const [isTestingJotform, setIsTestingJotform] = useState(false);

  const runBoldSignTest = async () => {
    setIsTestingBoldSign(true);
    setBoldsignResults({ backend: { status: 'loading' } });

    try {
      const { data, status } = await boldSignAPI({ action: 'testConnection' });
      
      if (status >= 200 && status < 300 && data.success) {
        setBoldsignResults({ backend: { status: 'success', data } });
      } else {
        setBoldsignResults({ backend: { status: 'error', data: { message: data.error || 'Connection test failed via backend.' } } });
      }
    } catch (error) {
      console.error('BoldSign connection test error:', error);
      const errorDetails = error.response?.data?.error || error.message || 'An unknown error occurred.';
      
      let userFriendlyError = {
        message: errorDetails,
        details: "An unknown error occurred. Check the function logs."
      };

      if (error.response?.status === 401 || String(errorDetails).includes("401")) {
          userFriendlyError = {
              message: "API Key Invalid (401 Unauthorized)",
              details: "BoldSign has rejected your API key. This is not a code error. Please generate a NEW key in your BoldSign account and update it in your Base44 App Secrets. Ensure you are using a key for the production environment (api.boldsign.com)."
          }
      }

      setBoldsignResults({ backend: { status: 'error', data: userFriendlyError } });
    }

    setIsTestingBoldSign(false);
  };

  const runJotformTest = async () => {
    setIsTestingJotform(true);
    setJotformResults({
      direct: { status: 'loading' },
      proxy: { status: 'loading' }
    });

    const config = await Configuration.filter({ key: 'jotform_api_key' });
    const apiKey = config.length > 0 ? config[0].value : null;

    if (!apiKey) {
      setJotformResults({
        direct: { status: 'error', data: 'API Key not found in Settings.' },
        proxy: { status: 'error', data: 'API Key not found in Settings.' }
      });
      setIsTestingJotform(false);
      return;
    }
    
    // Test 1: Direct Browser Call
    try {
      const response = await fetch(`https://api.jotform.com/user?apiKey=${apiKey}`);
      const data = await response.json();
      if (data.responseCode !== 200) throw new Error(data.message);
      setJotformResults(prev => ({ ...prev, direct: { status: 'success', data } }));
    } catch (error) {
      setJotformResults(prev => ({ ...prev, direct: { status: 'error', data: { message: error.message, note: "This is expected due to browser CORS security." } } }));
    }

    // Test 2: Platform Proxy Call
    try {
      const response = await InvokeLLM({
        prompt: `As an API agent, make a real HTTP GET request to 'https://api.jotform.com/user?apiKey=${apiKey}'. Return the raw JSON response from the API.`,
        response_json_schema: { type: "object", "additionalProperties": true }
      });

      if (response && response.responseCode === 200) {
         setJotformResults(prev => ({ ...prev, proxy: { status: 'success', data: response } }));
      } else {
        throw new Error(JSON.stringify(response));
      }
    } catch (error) {
      setJotformResults(prev => ({ ...prev, proxy: { status: 'error', data: { message: error.message, note: "This might indicate an invalid API key or platform issue." } } }));
    }

    setIsTestingJotform(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="w-6 h-6 text-blue-600" />
            External API Connection Test
          </CardTitle>
          <CardDescription>
            Test connectivity to external services to see what works. Focus on BoldSign (recommended) and JotForm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <Globe className="h-4 w-4" />
            <AlertDescription>
              Browser CORS security usually blocks direct calls to external APIs. Backend functions (like our BoldSign integration) are the recommended approach for reliable connections.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* BoldSign Test Card */}
      <Card>
        <CardHeader>
          <CardTitle>BoldSign API Test (Recommended)</CardTitle>
          <CardDescription>
            Tests the connection to BoldSign using our secure backend function. A **401 Unauthorized** error means your API Key is incorrect.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runBoldSignTest} disabled={isTestingBoldSign}>
            {isTestingBoldSign ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing...</> : 'Run BoldSign Test'}
          </Button>
          <div className="mt-4">
            <ResultDisplay 
              title="Test via Backend Function" 
              {...boldsignResults.backend} 
              icon={<Server className="w-4 h-4 text-blue-500"/>} 
            />
          </div>
        </CardContent>
      </Card>

      {/* JotForm Test Card */}
      <Card>
        <CardHeader>
          <CardTitle>JotForm API Test</CardTitle>
          <CardDescription>Tests fetching user details from JotForm.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={runJotformTest} disabled={isTestingJotform}>
            {isTestingJotform ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing...</> : 'Run JotForm Test'}
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <ResultDisplay title="Direct Browser Call" {...jotformResults.direct} icon={<Globe className="w-4 h-4 text-gray-500"/>} />
            <ResultDisplay title="Platform Proxy Call" {...jotformResults.proxy} icon={<Server className="w-4 h-4 text-blue-500"/>} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

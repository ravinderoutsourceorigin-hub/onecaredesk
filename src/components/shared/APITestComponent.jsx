import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { healthAPI } from '../../api/newFunctions.js';

const APITestComponent = () => {
  const [backendStatus, setBackendStatus] = useState('checking...');
  const [apiResponse, setApiResponse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      setError(null);
      console.log('Testing backend connection...');
      
      // Test health endpoint
      const healthResponse = await healthAPI.check();
      console.log('Health check response:', healthResponse);
      
      setBackendStatus('connected');
      setApiResponse(healthResponse);
    } catch (err) {
      console.error('Backend connection failed:', err);
      setBackendStatus('failed');
      setError(err.message);
    }
  };

  const testDatabaseData = async () => {
    try {
      setError(null);
      console.log('Testing database data...');
      
      // Test leads endpoint
      const response = await api.leads.getAll();
      console.log('Leads response:', response);
      
      alert(`Success! Found ${response.data.leads?.length || 0} leads`);
    } catch (err) {
      console.error('Database test failed:', err);
      setError('Database test failed: ' + err.message);
    }
  };

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">🔍 API Connection Test</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Backend Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            backendStatus === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : backendStatus === 'failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {backendStatus}
          </span>
        </div>

        {apiResponse && (
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-medium mb-2">API Response:</h4>
            <pre className="text-sm">{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="flex space-x-2">
          <button 
            onClick={testBackendConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Test Connection
          </button>
          
          <button 
            onClick={testDatabaseData}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={backendStatus !== 'connected'}
          >
            📊 Test Database
          </button>
        </div>

        <div className="text-sm text-gray-600">
          <p><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL}</p>
          <p><strong>Use New API:</strong> {import.meta.env.VITE_USE_NEW_API}</p>
        </div>
      </div>
    </div>
  );
};

export default APITestComponent;

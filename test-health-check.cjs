#!/usr/bin/env node

/**
 * Automated Quick Health Check Script
 * Tests critical endpoints and functionality
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5173';

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

function log(status, message) {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
  console.log(`${emoji} [${status}] ${message}`);
  tests.results.push({ status, message });
  if (status === 'PASS') tests.passed++;
  if (status === 'FAIL') tests.failed++;
}

function checkEndpoint(url, expectedStatus = 200) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === expectedStatus || res.statusCode === 304) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function runTests() {
  console.log('\n🧪 ============================================');
  console.log('   OneCare Desk - Quick Health Check');
  console.log('   Date:', new Date().toLocaleString());
  console.log('============================================\n');

  // Test 1: Frontend Server
  console.log('📱 FRONTEND TESTS:');
  const frontendRunning = await checkEndpoint(FRONTEND_URL);
  if (frontendRunning) {
    log('PASS', 'Frontend server running on http://localhost:5173');
  } else {
    log('FAIL', 'Frontend server not running! Start with: npm run dev');
  }

  // Test 2: Backend Server
  console.log('\n🔧 BACKEND TESTS:');
  const backendRunning = await checkEndpoint(`${BACKEND_URL}/api`);
  if (backendRunning) {
    log('PASS', 'Backend server running on http://localhost:5000');
  } else {
    log('FAIL', 'Backend server not running! Start with: cd backend && npm start');
  }

  if (backendRunning) {
    // Test 3: Leads API
    const leadsAPI = await checkEndpoint(`${BACKEND_URL}/api/leads`);
    log(leadsAPI ? 'PASS' : 'FAIL', 'Leads API endpoint');

    // Test 4: Patients API
    const patientsAPI = await checkEndpoint(`${BACKEND_URL}/api/patients`);
    log(patientsAPI ? 'PASS' : 'FAIL', 'Patients API endpoint');

    // Test 5: Caregivers API
    const caregiversAPI = await checkEndpoint(`${BACKEND_URL}/api/caregivers`);
    log(caregiversAPI ? 'PASS' : 'FAIL', 'Caregivers API endpoint');

    // Test 6: JotForm Integration
    const jotformAPI = await checkEndpoint(`${BACKEND_URL}/api/integrations/jotform/forms`);
    log(jotformAPI ? 'PASS' : 'FAIL', 'JotForm integration API');

    // Test 7: Signatures API
    const signaturesAPI = await checkEndpoint(`${BACKEND_URL}/api/signatures`);
    log(signaturesAPI ? 'PASS' : 'FAIL', 'Signatures API endpoint');
  }

  // Summary
  console.log('\n📊 ============================================');
  console.log('   TEST SUMMARY');
  console.log('============================================');
  console.log(`✅ Tests Passed: ${tests.passed}`);
  console.log(`❌ Tests Failed: ${tests.failed}`);
  console.log(`📝 Total Tests: ${tests.passed + tests.failed}`);
  
  const successRate = ((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(1);
  console.log(`📈 Success Rate: ${successRate}%`);
  
  if (tests.failed === 0) {
    console.log('\n🎉 All tests passed! System is healthy.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above.');
  }
  console.log('============================================\n');

  // Instructions
  if (tests.failed > 0) {
    console.log('📝 NEXT STEPS:');
    console.log('1. Make sure backend server is running: cd backend && npm start');
    console.log('2. Make sure frontend server is running: npm run dev');
    console.log('3. Check .env files for correct configuration');
    console.log('4. Review TESTING_CHECKLIST.md for detailed testing\n');
  }
}

// Run tests
runTests().catch(console.error);

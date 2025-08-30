// Test the API client directly
import { AgencyAPI } from './src/api/apiClient.js';

const testAgencyAPI = async () => {
  try {
    console.log('🔍 Testing Agency API...');
    const result = await AgencyAPI.list();
    console.log('✅ Agencies loaded successfully:');
    console.log('Number of agencies:', result.length);
    result.forEach((agency, index) => {
      console.log(`${index + 1}. ${agency.name} (${agency.email})`);
    });
    return result;
  } catch (error) {
    console.error('❌ Error loading agencies:', error);
    throw error;
  }
};

testAgencyAPI();

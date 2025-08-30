// API Configuration for our Node.js backend
const API_BASE_URL = 'http://localhost:5000/api';

// Mock auth system that uses our backend
export const createClient = ({ appId, requiresAuth }) => {
  return {
    auth: {
      me: async () => {
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error('User not authenticated');
          }
          
          return await response.json();
        } catch (error) {
          throw new Error('Authentication required');
        }
      },
      
      login: async (userType = 'admin') => {
        // For now, set a mock token and user data
        // In production, this would redirect to your OAuth provider (Kinde)
        
        const userProfiles = {
          admin: {
            id: '1',
            email: 'admin@careconnect.com',
            name: 'Admin User',
            full_name: 'Admin User',
            role: 'admin',
            agency_id: null,
            temp_password: false,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          },
          user: {
            id: '2',
            email: 'user@careconnect.com',
            name: 'Regular User',
            full_name: 'Regular User',
            role: 'user',
            agency_id: '78085b3a-8c7a-417b-9b18-5ddd91fd2070',
            temp_password: false,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          },
          caregiver: {
            id: '3',
            email: 'caregiver@careconnect.com',
            name: 'Jane Caregiver',
            full_name: 'Jane Caregiver',
            role: 'caregiver',
            agency_id: '78085b3a-8c7a-417b-9b18-5ddd91fd2070',
            temp_password: false,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        };
        
        const mockUser = userProfiles[userType] || userProfiles.admin;
        
        localStorage.setItem('auth_token', 'mock-jwt-token');
        localStorage.setItem('user_data', JSON.stringify(mockUser));
        localStorage.setItem('app_user', JSON.stringify(mockUser)); // For ProtectedLayout compatibility
        window.location.reload();
      },
      
      logout: async () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('app_user'); // Remove ProtectedLayout user data too
        window.location.reload();
      }
    },
    
    entities: {
      Lead: {
        list: () => {
          const token = localStorage.getItem('auth_token') || 'dummy-token';
          return fetch(`${API_BASE_URL}/leads`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json' 
            }
          }).then(r => r.json());
        },
        create: (data) => {
          const token = localStorage.getItem('auth_token') || 'dummy-token';
          return fetch(`${API_BASE_URL}/leads`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
          }).then(r => r.json());
        },
        update: (id, data) => {
          const token = localStorage.getItem('auth_token') || 'dummy-token';
          return fetch(`${API_BASE_URL}/leads/${id}`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
          }).then(r => r.json());
        },
        delete: (id) => {
          const token = localStorage.getItem('auth_token') || 'dummy-token';
          return fetch(`${API_BASE_URL}/leads/${id}`, { 
            method: 'DELETE',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json' 
            }
          });
        }
      },
      
      Patient: {
        list: () => {
          const token = localStorage.getItem('auth_token') || 'dummy-token';
          return fetch(`${API_BASE_URL}/patients`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json' 
            }
          }).then(r => r.json());
        },
        create: (data) => {
          const token = localStorage.getItem('auth_token') || 'dummy-token';
          return fetch(`${API_BASE_URL}/patients`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
          }).then(r => r.json());
        },
        update: (id, data) => fetch(`${API_BASE_URL}/patients/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/patients/${id}`, { method: 'DELETE' })
      },
      
      Caregiver: {
        list: () => fetch(`${API_BASE_URL}/caregivers`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/caregivers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        update: (id, data) => fetch(`${API_BASE_URL}/caregivers/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/caregivers/${id}`, { method: 'DELETE' })
      },
      
      Document: {
        list: () => fetch(`${API_BASE_URL}/documents`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        update: (id, data) => fetch(`${API_BASE_URL}/documents/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/documents/${id}`, { method: 'DELETE' })
      },
      
      Appointment: {
        list: () => fetch(`${API_BASE_URL}/appointments`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        update: (id, data) => fetch(`${API_BASE_URL}/appointments/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/appointments/${id}`, { method: 'DELETE' })
      },
      
      SignatureRequest: {
        list: () => fetch(`${API_BASE_URL}/signatures`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/signatures`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        update: (id, data) => fetch(`${API_BASE_URL}/signatures/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/signatures/${id}`, { method: 'DELETE' })
      },
      
      Task: {
        list: () => fetch(`${API_BASE_URL}/tasks`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        update: (id, data) => fetch(`${API_BASE_URL}/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' })
      },
      
      Configuration: {
        list: () => fetch(`${API_BASE_URL}/configurations`).then(r => r.json()),
        create: (data) => fetch(`${API_BASE_URL}/configurations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        update: (id, data) => fetch(`${API_BASE_URL}/configurations/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(r => r.json()),
        delete: (id) => fetch(`${API_BASE_URL}/configurations/${id}`, { method: 'DELETE' })
      },
      
      // Mock entities for compatibility
      AuditLog: { list: () => Promise.resolve([]) },
      Agency: { list: () => Promise.resolve([]) },
      PricingTier: { list: () => Promise.resolve([]) },
      AgencyInvitation: { list: () => Promise.resolve([]) },
      RoleAssignment: { list: () => Promise.resolve([]) },
      AppUser: { list: () => Promise.resolve([]) }
    },
    
    functions: {
      // Smart BoldSign API with fallback to mock data
      boldSignAPI: async (params) => {
        console.log('🔄 Smart boldSignAPI called with:', params);
        
        const token = localStorage.getItem('auth_token') || 'dummy-token';
        
        if (params?.action === 'getTemplates') {
          try {
            console.log('📋 Trying real BoldSign templates...');
            const response = await fetch(`${API_BASE_URL}/boldsign/templates`, {
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ Real templates response:', data);
              
              // Fix: Map BoldSign template format to expected format
              if (data.success && data.data && data.data.templates) {
                const realTemplates = data.data.templates;
                console.log('📋 Raw BoldSign templates:', realTemplates);
                
                const mappedTemplates = realTemplates.map(template => ({
                  id: template.documentId,  // BoldSign uses documentId, not id
                  name: template.templateName || template.messageTitle,
                  description: template.templateDescription || template.messageTitle || 'BoldSign Template'
                }));
                
                console.log('✅ Mapped templates:', mappedTemplates);
                
                return {
                  success: true,
                  data: {
                    success: true,
                    templates: mappedTemplates
                  }
                };
              }
              
              return data;
            } else {
              console.warn('⚠️ BoldSign API failed, falling back to mock templates');
              throw new Error('API failed, using fallback');
            }
          } catch (error) {
            console.warn('⚠️ BoldSign error, using mock templates:', error.message);
            
            // FALLBACK TO MOCK DATA
            return Promise.resolve({
              success: true,
              data: {
                success: true,
                templates: [
                  {
                    id: 'template-care-agreement',
                    name: 'Home Care Service Agreement',
                    description: 'Comprehensive care agreement for home healthcare services'
                  },
                  {
                    id: 'template-intake-form', 
                    name: 'Patient Intake Form',
                    description: 'Initial patient assessment and medical history form'
                  },
                  {
                    id: 'template-consent-form',
                    name: 'Medical Consent Form',
                    description: 'HIPAA compliant consent form for treatment'
                  }
                ]
              }
            });
          }
        }
        
        // Handle signature sending
        if (params?.action === 'sendSignature') {
          try {
            console.log('📤 Sending real BoldSign signature request...');
            const { templateId, title, message, signers } = params;
            
            const response = await fetch(`${API_BASE_URL}/boldsign/send`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
              },
              body: JSON.stringify({
                templateId,
                title,
                message,
                signers
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ Real signature request sent:', data);
              return data;
            } else {
              console.warn('⚠️ BoldSign send failed, falling back to mock');
              throw new Error('Send failed, using fallback');
            }
          } catch (error) {
            console.warn('⚠️ BoldSign send error, using mock:', error.message);
            
            // FALLBACK TO MOCK SIGNATURE RESPONSE
            const mockDocId = `mock-doc-${Date.now()}`;
            return Promise.resolve({
              success: true,
              data: {
                success: true,
                documentId: mockDocId,
                signingLinks: [
                  {
                    signerEmail: params.signers?.[0]?.email || 'test@example.com',
                    signerName: params.signers?.[0]?.name || 'Test User',
                    signingUrl: `https://mock-boldsign.com/sign/${mockDocId}`
                  }
                ],
                message: 'Mock signature request created (real BoldSign not available)'
              }
            });
          }
        }
        
        if (params?.action === 'sendSignatureRequest') {
          console.log('📤 Mock signature request send...');
          return Promise.resolve({
            success: true,
            data: {
              success: true,
              documentId: 'mock-doc-' + Date.now(),
              signingLinks: [{ 
                signerEmail: params.signers?.[0]?.email || 'mock@example.com',
                signingUrl: 'https://mock-boldsign.com/sign/mock-link'
              }],
              message: 'Mock signature request sent successfully'
            }
          });
        }
        
        // Default response for other actions
        return Promise.resolve({ 
          success: true,
          data: { success: true, message: 'Mock BoldSign response' }
        });
      },
      createAgency: () => Promise.resolve({ success: true }),
      sendAgencyInvitation: () => Promise.resolve({ success: true }),
      sendEmail: () => Promise.resolve({ success: true }),
      fixAdminUser: () => Promise.resolve({ success: true }),
      debugAgencyCreation: () => Promise.resolve({ success: true }),
      basicPlatformTest: () => Promise.resolve({ success: true }),
      acceptAgencyInvitation: () => Promise.resolve({ success: true }),
      auth: () => Promise.resolve({ success: true }),
      initializeSuperAdmin: () => Promise.resolve({ success: true }),
      debugAuth: () => Promise.resolve({ success: true }),
      resendInvitationEmail: () => Promise.resolve({ success: true }),
      debugLogin: () => Promise.resolve({ success: true }),
      requestPasswordReset: () => Promise.resolve({ success: true }),
      requestUsernameRecovery: () => Promise.resolve({ success: true }),
      resetPassword: () => Promise.resolve({ success: true }),
      jotFormAPI: () => Promise.resolve({ success: true }),
      boldSignWebhook: () => Promise.resolve({ success: true }),
      getUserManagementData: () => Promise.resolve({ users: [] }),
      emergencyLogin: () => Promise.resolve({ success: true })
    },
    
    integrations: {
      Core: {
        InvokeLLM: () => Promise.resolve({ response: 'Mock LLM response' }),
        SendEmail: () => Promise.resolve({ success: true, messageId: 'mock-id' }),
        UploadFile: () => Promise.resolve({ success: true, fileId: 'mock-file-id', url: 'mock-url' }),
        GenerateImage: () => Promise.resolve({ success: true, imageUrl: 'mock-image-url' }),
        ExtractDataFromUploadedFile: () => Promise.resolve({ success: true, data: {} })
      }
    }
  };
};

// Create the mock base44 client
export const base44 = createClient({
  appId: "local-backend", 
  requiresAuth: true
});


import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AgencyInvitation } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, formatDistanceToNow } from "date-fns";
import { CheckCircle, XCircle, UsersRound, AlertTriangle, ExternalLink, Plus, RefreshCw, Crown, Shield, Users, Stethoscope, Mail, Clock, Trash2, Send, Check, Wrench, Search, Key, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import InviteAgencyDialog from "@/components/admin/InviteAgencyDialog";
import DebugInputDialog from "@/components/admin/DebugInputDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getUserManagementData } from "@/api/functions";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canViewAllUsers, setCanViewAllUsers] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [hasPermissionToManageUsers, setHasPermissionToManageUsers] = useState(false);
  const [debugResults, setDebugResults] = useState('');
  const [isDebugLoading, setIsDebugLoading] = useState(false);
  const [isInputDialogOpen, setIsInputDialogOpen] = useState(false);
  const [inputDialogConfig, setInputDialogConfig] = useState(null);

  const loadData = useCallback(async (user) => {
    if(!user) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const canViewAll = ['super_admin', 'admin'].includes(user.role);
      setCanViewAllUsers(canViewAll);

      const agencyIdForFilter = canViewAll ? null : user.agency_id;
      
      const response = await getUserManagementData({ agencyId: agencyIdForFilter });

      if (response.data.success) {
          const { users: fetchedUsers, invitations: fetchedInvitations } = response.data;
          setUsers(fetchedUsers);
          setInvitations(fetchedInvitations || []);
      } else {
          throw new Error(response.data.error || "Failed to fetch user data.");
      }
    } catch (error) {
      console.error("Error loading user management data:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadInitialPermissionsAndData = useCallback(async () => {
      setIsLoading(true);
      try {
          const userString = localStorage.getItem('app_user');
          if (!userString) {
              throw new Error("No user session found.");
          }
          const user = JSON.parse(userString);
          setCurrentUser(user);

          const canManage = ['super_admin', 'admin', 'agency_admin'].includes(user.role);
          setHasPermissionToManageUsers(canManage);
          
          if (canManage) {
              await loadData(user);
          }
      } catch(e) {
          console.error("Permission check failed:", e);
          setHasPermissionToManageUsers(false);
          setErrorMessage("Your session could not be verified. Please log in again.");
      } finally {
          setIsLoading(false);
      }
  }, [loadData]);

  useEffect(() => {
    loadInitialPermissionsAndData();
  }, [loadInitialPermissionsAndData]);

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'super_admin': return { variant: 'destructive', icon: Crown };
      case 'admin': return { variant: 'destructive', icon: Shield };
      case 'agency_admin': return { variant: 'default', icon: Users };
      case 'care_manager': return { variant: 'secondary', icon: UsersRound };
      case 'caregiver': return { variant: 'outline', icon: Stethoscope };
      default: return { variant: 'secondary', icon: UsersRound };
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Platform Admin';
      case 'agency_admin': return 'Agency Admin';
      case 'care_manager': return 'Care Manager';
      case 'caregiver': return 'Caregiver';
      default: return role?.replace('_', ' ') || 'Unknown';
    }
  };

  const renderLoadingSkeleton = () => (
    Array(5).fill(0).map((_, index) => (
      <TableRow key={index}>
        <TableCell>
          <Skeleton className="h-5 w-24 mb-1" />
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
        <TableCell><Skeleton className="h-6 w-6 rounded-full" /></TableCell>
        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
        {canViewAllUsers && <TableCell><Skeleton className="h-5 w-20" /></TableCell>}
      </TableRow>
    ))
  );

  const handleDeleteInvitation = async (id) => {
      try {
          await AgencyInvitation.delete(id);
          setSuccessMessage('Invitation deleted successfully!');
          setTimeout(() => setSuccessMessage(''), 3000);
          loadData(currentUser);
      } catch (error) {
          console.error("Error deleting invitation:", error);
          setErrorMessage('Failed to delete invitation.');
          setTimeout(() => setErrorMessage(''), 5000);
      }
  }

  const handleReInvite = async (invite) => {
      try {
          const { resendInvitationEmail } = await import('@/api/functions');
          const response = await resendInvitationEmail({
            invitationId: invite.id,
            baseUrl: window.location.origin
          });
          
          if (response.data?.success) {
            setSuccessMessage('Invitation re-sent successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
            loadData(currentUser);
          } else {
            setErrorMessage(response.data?.error || 'An unknown error occurred while re-sending.');
            setTimeout(() => setErrorMessage(''), 8000);
          }
      } catch (error) {
          console.error("Error re-sending invitation:", error);
          const apiError = error.response?.data?.error || error.message || 'Failed to re-send invitation.';
          setErrorMessage(apiError);
          setTimeout(() => setErrorMessage(''), 8000);
      }
  }

  const runDebugAction = async (action, params = {}) => {
    setIsDebugLoading(true);
    setDebugResults('');
    try {
      const { debugLogin } = await import('@/api/functions');
      const response = await debugLogin({ action, ...params });
      
      if (response.data?.success) {
        let resultText = '';
        switch (action) {
          case 'find-user-by-email':
            const user = response.data.user;
            resultText = `✅ User Found!\n\nUsername: ${user.username}\nEmail: ${user.email}\nFull Name: ${user.full_name}\nRole: ${user.role}\nStatus: ${user.status}\nAgency ID: ${user.agency_id || 'None'}\nTemp Password: ${user.temp_password ? 'Yes' : 'No'}`;
            break;
          case 'test-password':
            const testUser = response.data.user;
            const testResult = response.data.passwordTest;
            resultText = `🔐 Password Test Results\n\nUser: ${testUser.username}\nEmail: ${testUser.email}\nPassword Match: ${testResult.matches ? '✅ YES' : '❌ NO'}\nInput Length: ${testResult.inputPasswordLength}\nStored Hash Exists: ${testResult.storedHashExists ? 'Yes' : 'No'}\nSalt Used: ${testResult.saltUsed}\n\nDetailed Results:\n• New Salt Match: ${testResult.matchesNewSalt ? 'Yes' : 'No'}\n• Old Salt Match: ${testResult.matchesOldSalt ? 'Yes' : 'No'}`;
            break;
          case 'list-recent-users':
            const users = response.data.users;
            resultText = `📋 Recent Users (${users.length} found)\n\n${users.map((u, i) => 
              `${i + 1}. ${u.username} (${u.email})\n   Role: ${u.role}, Status: ${u.status}\n   Created: ${new Date(u.created_date).toLocaleDateString()}`
            ).join('\n\n')}`;
            break;
          case 'reset-user-password':
            resultText = `🔑 Password Reset Complete!\n\nUsername: ${response.data.username}\nNew Password: ${response.data.newPassword}\n\n⚠️ Save this password - it won't be shown again!`;
            break;
          case 'force-rehash-password':
            resultText = `✅ Success!\n\n${response.data.message}`;
            break;
            default:
              resultText = JSON.stringify(response.data, null, 2);
        }
        setDebugResults(resultText);
        setSuccessMessage('Debug action completed successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
        return response; // Return response for external handling if needed
      } else {
        setDebugResults(`❌ ${response.data?.message || 'Action failed'}`);
        setErrorMessage('Debug action failed');
        setTimeout(() => setErrorMessage(''), 5000);
        throw new Error(response.data?.message || 'Action failed'); // Throw error for external handling
      }
    } catch (error) {
      setDebugResults(`❌ Error: ${error.message}`);
      setErrorMessage('Debug action failed: ' + error.message);
      setTimeout(() => setErrorMessage(''), 8000);
      throw error; // Re-throw error for external handling
    } finally {
      setIsDebugLoading(false);
    }
  };

  const handleDebugSubmit = async (values) => {
    if (inputDialogConfig?.action) {
      await runDebugAction(inputDialogConfig.action, values);
    }
    setIsInputDialogOpen(false);
  };

  const openInputDialog = (config) => {
    setInputDialogConfig(config);
    setIsInputDialogOpen(true);
  };

  if (!isLoading && !hasPermissionToManageUsers) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access the User Management page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate stats
  const activeUsers = users.filter(u => u.last_login_at);
  const adminUsers = users.filter(u => ['super_admin', 'admin', 'agency_admin'].includes(u.role));
  const agencyAdmins = users.filter(u => u.role === 'agency_admin');

  return (
    <>
      <InviteAgencyDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onInviteSent={() => {
            setIsInviteDialogOpen(false);
            loadData(currentUser);
            setSuccessMessage('Invitation sent successfully! The new owner will receive an email shortly.');
            setTimeout(() => setSuccessMessage(''), 5000);
        }}
      />
      <DebugInputDialog
        open={isInputDialogOpen}
        onOpenChange={setIsInputDialogOpen}
        config={inputDialogConfig}
        onSubmit={handleDebugSubmit}
        isLoading={isDebugLoading}
      />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Modern Header with Gradient */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl">
              <UsersRound className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">
                User Management
              </h1>
              <p className="text-white/90 text-base lg:text-lg">
                {canViewAllUsers
                  ? 'Manage all users and agency invitations (Platform Admin View)'
                  : 'Manage users in your agency'
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Users", value: users.length, icon: UsersRound, color: "from-blue-500 to-blue-600" },
            { label: "Active Users", value: activeUsers.length, icon: TrendingUp, color: "from-green-500 to-green-600" },
            { label: "Admin Roles", value: adminUsers.length, icon: Crown, color: "from-purple-500 to-purple-600" },
            { label: "Agency Admins", value: agencyAdmins.length, icon: Shield, color: "from-indigo-500 to-indigo-600" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="relative"
            >
              <div className="bg-white rounded-xl p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {successMessage && (
          <Alert className="mb-4 bg-green-50 border-green-200 text-green-800 rounded-xl">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive" className="mb-4 rounded-xl">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between mb-6 bg-white rounded-2xl shadow-lg p-6"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Active Users ({users.length})</h3>
            <p className="text-sm text-gray-500">Manage platform access and permissions</p>
          </div>
          <div className="flex gap-2">
            {currentUser?.email === 'ravinder.gade@gmail.com' && (
              <Button
                onClick={async () => {
                  try {
                    const { fixAdminUser } = await import('@/api/functions');
                    const response = await fixAdminUser({});
                    if (response.data?.success) {
                      setSuccessMessage(response.data.message || 'Admin user fixed! Please refresh the page.');
                      setTimeout(() => setSuccessMessage(''), 3000);
                    } else {
                      setErrorMessage(response.data?.error || 'Failed to fix admin user.');
                      setTimeout(() => setErrorMessage(''), 8000);
                    }
                  } catch (error) {
                    setErrorMessage('Failed to fix admin user: ' + error.message);
                    setTimeout(() => setErrorMessage(''), 8000);
                  }
                }}
                variant="destructive"
                size="sm"
              >
                🔧 Fix Admin User
              </Button>
            )}
            
            {/* Quick Reset for ravinder.nj@gmail.com */}
            {currentUser?.email === 'ravinder.gade@gmail.com' && (
              <Button
                onClick={async () => {
                  const newPassword = 'admin123'; // Temporary password
                  try {
                    // Call the debug action which handles both backend call and result display
                    await runDebugAction('force-rehash-password', {
                      username: 'ravinder.nj@gmail.com', // Target user to reset
                      newPassword: newPassword
                    });
                    // runDebugAction already sets success/error messages internally, 
                    // but we can add a specific one if needed
                    if (!errorMessage) { // Only show this if runDebugAction didn't already set an error
                        setSuccessMessage(`Password for ravinder.nj@gmail.com reset to: ${newPassword}`);
                        setTimeout(() => setSuccessMessage(''), 10000);
                    }
                  } catch (error) {
                    // runDebugAction already handles error message, so no need to duplicate here
                    console.error("Failed to reset ravinder.nj@gmail.com password:", error);
                  }
                }}
                variant="outline"
                size="sm"
                className="bg-orange-50 border-orange-200 text-orange-700"
              >
                🔑 Reset ravinder.nj Password
              </Button>
            )}

            <Button onClick={() => loadData(currentUser)} disabled={isLoading} variant="outline" className="rounded-xl border-gray-200">
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </motion.div>

        {['admin', 'super_admin'].includes(currentUser?.role) && (
            <Card className="mb-6 bg-slate-50 border-slate-200 rounded-2xl shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Wrench className="h-5 w-5"/>
                        Admin Debugging Tools
                    </CardTitle>
                    <CardDescription>Use these tools to diagnose login and password issues.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <Button
                          onClick={() => openInputDialog({
                              action: 'find-user-by-email',
                              title: 'Find User by Email',
                              description: 'Enter the user\'s full email address to find their details.',
                              inputs: [{ name: 'email', label: 'Email Address', type: 'email' }],
                              submitText: 'Find User'
                          })}
                          disabled={isDebugLoading}
                          variant="outline"
                          className="justify-start text-left"
                        >
                          <Search className="w-4 h-4 mr-2"/>
                          Find User by Email
                        </Button>
                        
                        <Button
                          onClick={() => openInputDialog({
                            action: 'force-rehash-password',
                            title: 'Force Password Re-hash',
                            description: "Fixes corrupted passwords. Enter the user's username/email and a NEW password.",
                            inputs: [
                              { name: 'username', label: 'Username or Email', type: 'text' },
                              { name: 'newPassword', label: 'New Password', type: 'password' },
                            ],
                            submitText: 'Re-hash Password'
                          })}
                          disabled={isDebugLoading}
                          variant="destructive"
                          className="justify-start text-left"
                        >
                          🔑 Force Re-hash Password
                        </Button>

                        <Button
                          onClick={() => runDebugAction('list-recent-users')}
                          disabled={isDebugLoading}
                          variant="outline"
                          className="justify-start text-left"
                        >
                          <Users className="w-4 h-4 mr-2"/>
                          List Recent Users
                        </Button>
                        
                        <Button
                          onClick={() => openInputDialog({
                            action: 'test-password',
                            title: 'Test Username/Password',
                            description: "Enter a user's credentials to check if they are valid.",
                            inputs: [
                              { name: 'username', label: 'Username', type: 'text' },
                              { name: 'password', label: 'Password', type: 'password' },
                            ],
                            submitText: 'Test Credentials'
                          })}
                          disabled={isDebugLoading}
                          variant="outline"
                          className="justify-start text-left"
                        >
                          <Key className="w-4 h-4 mr-2"/>
                          Test Username/Password
                        </Button>
                        
                        <Button
                           onClick={() => openInputDialog({
                            action: 'reset-user-password',
                            title: 'Reset User Password',
                            description: "This will generate a new temporary password for a user.",
                            inputs: [{ name: 'username', label: 'Username or Email', type: 'text' }],
                            submitText: 'Reset Password'
                          })}
                          disabled={isDebugLoading}
                          variant="outline"
                          className="justify-start text-left bg-red-50 border-red-200 text-red-700"
                        >
                          🔑 Reset User Password
                        </Button>
                        
                        <Button
                          onClick={async () => {
                            setIsDebugLoading(true);
                            setDebugResults('');
                            try {
                              const { basicPlatformTest } = await import('@/api/functions');
                              const response = await basicPlatformTest({});
                              if (response.data?.success) {
                                setDebugResults('✅ Platform is working: ' + response.data.message);
                                setSuccessMessage('Platform test passed!');
                                setTimeout(() => setSuccessMessage(''), 5000);
                              } else {
                                setDebugResults('❌ Platform issue: ' + (response.data?.error || response.data?.message));
                                setErrorMessage('Platform test failed');
                                setTimeout(() => setErrorMessage(''), 8000);
                              }
                            } catch (error) {
                              setDebugResults('❌ Platform test failed: ' + error.message);
                              setErrorMessage('Platform test failed: ' + error.message);
                              setTimeout(() => setErrorMessage(''), 8000);
                            } finally {
                                setIsDebugLoading(false);
                            }
                          }}
                          disabled={isDebugLoading}
                          variant="outline"
                          className="justify-start text-left"
                        >
                          🔬 Basic Platform Test
                        </Button>
                        
                        <Button
                          onClick={async () => {
                            setIsDebugLoading(true);
                            setDebugResults('');
                            try {
                              const { debugAgencyCreation } = await import('@/api/functions');
                              const response = await debugAgencyCreation({});
                              if (response.data?.success) {
                                setDebugResults('✅ All tests passed! Agency creation should work normally.');
                                setSuccessMessage('Agency creation test passed!');
                                setTimeout(() => setSuccessMessage(''), 5000);
                              } else {
                                setDebugResults('❌ Test failed: ' + (response.data?.error || 'Unknown error'));
                                setErrorMessage('Agency creation test failed');
                                setTimeout(() => setErrorMessage(''), 8000);
                              }
                            } catch (error) {
                              setDebugResults('❌ Test failed: ' + error.message);
                              setErrorMessage('Agency creation test failed: ' + error.message);
                              setTimeout(() => setErrorMessage(''), 8000);
                            } finally {
                                setIsDebugLoading(false);
                            }
                          }}
                          disabled={isDebugLoading}
                          variant="outline"
                          className="justify-start text-left"
                        >
                          🧪 Test Agency Creation
                        </Button>
                    </div>

                    {(debugResults || isDebugLoading) && (
                        <div className="mt-4">
                            <h4 className="font-medium text-slate-800 mb-2">Debug Results:</h4>
                            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                                {isDebugLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                                        Running debug action...
                                    </div>
                                ) : (
                                    debugResults
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}

        <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-800">
                <Shield className="h-5 w-5" />
                User Role Hierarchy
            </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                <h4 className="font-semibold mb-2">Platform Level:</h4>
                <ul className="space-y-1">
                    <li><Crown className="w-4 h-4 inline mr-2" /><strong>Super Admin:</strong> OneCareDesk owners</li>
                    <li><Shield className="w-4 h-4 inline mr-2" /><strong>Platform Admin:</strong> OneCareDesk staff</li>
                </ul>
                </div>
                <div>
                <h4 className="font-semibold mb-2">Agency Level:</h4>
                <ul className="space-y-1">
                    <li><Users className="w-4 h-4 inline mr-2" /><strong>Agency Admin:</strong> Can manage agency & users</li>
                    <li><UsersRound className="w-4 h-4 inline mr-2" /><strong>Care Manager:</strong> Manages operations</li>
                    <li><Stethoscope className="w-4 h-4 inline mr-2" /><strong>Caregiver:
                        </strong> Provides care</li>
                </ul>
                </div>
            </div>
            </CardContent>
        </Card>

        {canViewAllUsers && (
          <Card className="mb-6 rounded-2xl shadow-lg border-0">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Agency Invitations</CardTitle>
                  <CardDescription>Invitations sent to new agency owners.</CardDescription>
                </div>
                <Button onClick={() => setIsInviteDialogOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="w-4 h-4 mr-2"/>
                  Invite New Agency Owner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agency / Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     <TableRow><TableCell colSpan="4"><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  ) : invitations.length > 0 ? (
                    invitations.map(invite => (
                      <TableRow key={invite.id}>
                        <TableCell>
                          <div className="font-medium">{invite.agency_name}</div>
                          <div className="text-sm text-gray-500">{invite.owner_email}</div>
                        </TableCell>
                        <TableCell>
                           <Badge variant={invite.status === 'pending' ? 'secondary' : 'default'} className="flex items-center w-fit">
                            {invite.status === 'pending' ? <Clock className="w-3 h-3 mr-1"/> : <Check className="w-3 h-3 mr-1"/>}
                            {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(invite.created_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                           <Button variant="ghost" size="icon" onClick={() => handleReInvite(invite)} title="Re-send Invitation">
                               <Send className="w-4 h-4"/>
                           </Button>
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" title="Delete Invitation">
                                   <Trash2 className="w-4 h-4 text-red-500"/>
                               </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                               <AlertDialogHeader>
                                 <AlertDialogTitle>Delete Invitation</AlertDialogTitle>
                                 <AlertDialogDescription>
                                   Are you sure you want to delete the invitation for "{invite.agency_name}" sent to {invite.owner_email}? 
                                   This action cannot be undone.
                                 </AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                                 <AlertDialogAction onClick={() => handleDeleteInvitation(invite.id)} className="bg-red-600 hover:bg-red-700">
                                   Delete
                                 </AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan="4" className="text-center h-24">
                        <div className="flex flex-col items-center gap-3">
                            <Mail className="w-12 h-12 text-gray-300" />
                            <p className="font-medium text-gray-600">No agency invitations sent yet.</p>
                            <Button onClick={() => setIsInviteDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2"/>
                                Invite New Agency Owner
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card className="rounded-2xl shadow-lg border-0">
          <CardHeader className="border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {canViewAllUsers ? 'All Platform Users' : 'Agency Users'} ({users.length})
                </CardTitle>
                <CardDescription>
                  {canViewAllUsers
                    ? 'All users across all agencies on the platform'
                    : 'Users who have access to your agency portal'
                  }
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => window.open('https://dashboard.base44.com', '_blank')}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Users via Dashboard
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%]">User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>HIPAA Consent</TableHead>
                    <TableHead>Last Activity</TableHead>
                    {canViewAllUsers && <TableHead>Agency</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? renderLoadingSkeleton() : (
                    users.length > 0 ? (
                      users.map(user => {
                        const roleBadge = getRoleBadgeVariant(user.role);
                        const RoleIcon = roleBadge.icon;
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="font-medium">{user.full_name || "N/A"}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={roleBadge.variant} className="flex items-center gap-1 w-fit">
                                <RoleIcon className="w-3 h-3" />
                                {getRoleDisplayName(user.role)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.hipaa_consent_given ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </TableCell>
                            <TableCell>
                              {user.last_activity ? (
                                <span title={format(new Date(user.last_activity), "PPP p")}>
                                  {formatDistanceToNow(new Date(user.last_activity), { addSuffix: true })}
                                </span>
                              ) : (
                                <span className="text-gray-400">Never</span>
                              )}
                            </TableCell>
                            {canViewAllUsers && (
                              <TableCell>
                                <span className="text-sm text-gray-600">
                                  {user.agency_id || 'No Agency'}
                                </span>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={canViewAllUsers ? 5 : 4} className="text-center h-24">
                          <div className="flex flex-col items-center gap-3">
                            <UsersRound className="w-12 h-12 text-gray-300" />
                            <div>
                              <p className="font-medium text-gray-600">No users found</p>
                              <p className="text-sm text-gray-500">Add users through your Base44 dashboard</p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => window.open('https://dashboard.base44.com', '_blank')}
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Users
                              <ExternalLink className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

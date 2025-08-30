
import React, { useState, useEffect } from "react";
import { Agency } from "@/api/entities";
// Removed the User import as it's no longer used directly to fetch current user
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Building, Users, Calendar, Crown, Trash2, Loader2, Eye, Edit } from "lucide-react";
import { format } from "date-fns";
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
import EditAgencyDialog from "@/components/admin/EditAgencyDialog";

export default function Agencies() {
  const [agencies, setAgencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null); // Track which agency is being deleted
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState(null);
  const [errorMessage, setErrorMessage] = useState(''); // New state for error messages

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setErrorMessage(''); // Clear any previous error messages
      // Get user from localStorage instead of User.me()
      const userString = localStorage.getItem('app_user');
      if (!userString) {
        setErrorMessage("No user session found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const user = JSON.parse(userString);
      setCurrentUser(user);
      
      // Check if user has permission to view all agencies
      const canViewAllAgencies = ['super_admin', 'admin'].includes(user.role);
      if (!canViewAllAgencies) {
        setErrorMessage("You do not have permission to view all agencies. This page is only accessible by Super Admins and Admins.");
        setIsLoading(false);
        return;
      }

      console.log('📋 Loading agencies for user:', user.email, 'with role:', user.role);
      
      const agencyList = await Agency.list("-created_date");
      console.log('📋 Found agencies:', agencyList.length);
      
      // Update agencies with their display IDs if missing
      const updatedAgencies = await Promise.all(
        agencyList.map(async (agency) => {
          if (!agency.agency_id_display) {
            try {
              await Agency.update(agency.id, { agency_id_display: agency.id });
              return { ...agency, agency_id_display: agency.id };
            } catch (error) {
              console.error("Failed to update agency display ID:", error);
              return agency;
            }
          }
          return agency;
        })
      );
      
      setAgencies(updatedAgencies);
    } catch (error) {
      console.error("Error loading agencies:", error);
      setErrorMessage("Failed to load agencies: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const getStatusColor = (status) => {
    const colors = {
      trial: "bg-blue-100 text-blue-800 border-blue-200",
      active: "bg-green-100 text-green-800 border-green-200", 
      past_due: "bg-orange-100 text-orange-800 border-orange-200",
      cancelled: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[status] || colors.trial;
  };

  const handleDeleteAgency = async (agency) => {
    setIsDeleting(agency.id);
    try {
      await Agency.delete(agency.id);
      // Refresh the agencies list
      await loadData();
    } catch (error) {
      console.error("Error deleting agency:", error);
      alert("Failed to delete agency. Please try again.");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleViewAgency = (agency) => {
    // For now, just log the agency details or navigate to a detail page
    console.log("Viewing agency:", agency);
    // TODO: Implement agency detail page or modal
    alert(`View functionality for ${agency.name} - Coming soon!`);
  };

  const handleEditAgency = (agency) => {
    setEditingAgency(agency);
    setIsEditDialogOpen(true);
  };
  
  const handleSaveAgency = async () => {
    setIsEditDialogOpen(false);
    setEditingAgency(null);
    // Add a small delay to allow the backend to process, then reload data
    setTimeout(() => {
        loadData();
    }, 200);
  };

  // Show error message if any
  if (errorMessage) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium mb-2">Access Error</h3>
          <p className="text-red-700">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agency Management</h1>
            <p className="text-gray-600 mt-1">View and manage all agencies in the system</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencies.map((agency) => (
              <Card key={agency.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg font-bold text-gray-900 truncate">{agency.name}</CardTitle>
                        <p className="text-sm text-gray-600 truncate">{agency.owner_email}</p>
                        {agency.owner_email === currentUser?.email && (
                          <div className="flex items-center gap-1 mt-1">
                            <Crown className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs text-yellow-600 font-medium">Your Agency</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      <Badge className={`${getStatusColor(agency.subscription_status)} border`}>
                        {agency.subscription_status?.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Plan</span>
                      <span className="text-sm text-gray-600 capitalize font-medium">{agency.plan_name}</span>
                    </div>

                    {agency.trial_expires && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Trial Expires</span>
                        <span className="text-sm text-gray-600 font-medium">
                          {format(new Date(agency.trial_expires), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}

                    <div className="border-t pt-3 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Agency ID</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(agency.id)}
                          className="h-6 px-2 text-xs hover:bg-blue-100"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded block break-all font-mono">
                        {agency.id}
                      </code>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewAgency(agency)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditAgency(agency)}
                      className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          disabled={isDeleting === agency.id}
                        >
                          {isDeleting === agency.id ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Agency</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you absolutely sure you want to delete "{agency.name}"? 
                            <br /><br />
                            <strong className="text-red-600">This action cannot be undone.</strong> This will permanently delete the agency and all associated data including:
                            <ul className="list-disc ml-4 mt-2 space-y-1">
                              <li>All patients and caregivers</li>
                              <li>Documents and signatures</li>
                              <li>Appointments and tasks</li>
                              <li>All user accounts</li>
                            </ul>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAgency(agency)}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                          >
                            Delete Agency
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {agencies.length === 0 && !isLoading && (
          <Card className="text-center p-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agencies found</h3>
            <p className="text-gray-500">Agencies will appear here once they're created.</p>
          </Card>
        )}
      </div>
      
      {/* Edit Agency Dialog */}
      <EditAgencyDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          agency={editingAgency}
          onSave={handleSaveAgency}
      />
    </>
  );
}

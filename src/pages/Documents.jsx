
import React, { useState, useEffect } from "react";
import { Document } from "@/api/entities";
import { Configuration } from "@/api/entities";
import { User } from "@/api/entities"; // Added User import for multi-tenancy
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Upload,
  Eye,
  CopyPlus,
  RefreshCw,
  Settings,
  HardDrive,
  Trash2,
  Pencil // Added Pencil icon
} from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import UploadDocumentDialog from "../components/documents/UploadDocumentDialog";
import DocumentPreviewDialog from "../components/documents/DocumentPreviewDialog";
import EditDocumentDialog from "../components/documents/EditDocumentDialog"; // Added EditDocumentDialog import

export default function Documents() {
  const [localDocuments, setLocalDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // New state for edit dialog
  const [selectedDocument, setSelectedDocument] = useState(null); // This state seems unused, keeping it for now
  const [previewDocument, setPreviewDocument] = useState(null);
  const [editingDocument, setEditingDocument] = useState(null); // New state for document being edited
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Added currentUser state

  // Effect to load current user from localStorage
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        // --- CORE FIX: Get user from localStorage for consistency ---
        const userString = localStorage.getItem('app_user');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load user from session:", error);
        setIsLoading(false);
      }
    };
    loadCurrentUser();
  }, []);

  // Effect to load documents once currentUser is available
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]); // Rerun when currentUser changes

  const checkApiConfiguration = async () => {
    try {
      // Use Configuration.list() instead of filter()
      const allConfigs = await Configuration.list();
      const configs = allConfigs.filter(c => c.key === "boldsign_client_id");
      const clientIdIsSet = configs.length > 0 && !!configs[0].value;
      const tokenIsSet = !!localStorage.getItem('boldsign_access_token');
      const isConfigured = clientIdIsSet && tokenIsSet;
      setApiConfigured(isConfigured);
      return isConfigured;
    } catch (error) {
      console.error("Failed to check API configuration:", error);
      setApiConfigured(false);
      return false;
    }
  };

  const loadAllData = async () => {
    if (!currentUser?.agency_id) {
      // If agency_id is not available, cannot load tenant-specific data
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Check API configuration
      await checkApiConfiguration();
      
      // Load local documents filtered by agency_id
      const allDocs = await Document.list();
      const localDocs = allDocs.filter(doc => doc.agency_id === currentUser.agency_id);
      setLocalDocuments(localDocs);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllData();
    setIsRefreshing(false);
  };

  const handleUploadDocument = async (documentData) => {
    if (!currentUser?.agency_id) {
      console.error("Cannot upload document: User agency ID is not available.");
      // Optionally provide user feedback that upload is not possible
      throw new Error("Missing agency ID for document upload.");
    }
    try {
      const dataToCreate = { ...documentData, agency_id: currentUser.agency_id };
      console.log("Creating document:", dataToCreate);
      await Document.create(dataToCreate);
      setIsUploadDialogOpen(false);
      await loadAllData();
    } catch (error) {
      console.error("Failed to create document:", error);
      throw error; // Re-throw so the dialog can show the error
    }
  };

  const handleEditDocument = async (documentData) => {
    try {
      console.log("Updating document:", editingDocument.id, documentData);
      await Document.update(editingDocument.id, documentData);
      setIsEditDialogOpen(false);
      setEditingDocument(null);
      await loadAllData();
    } catch (error) {
      console.error("Failed to update document:", error);
      throw error;
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await Document.delete(docId);
      loadAllData();
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const handleSendForSignature = (document) => {
    // Remove the alert and replace with proper UI feedback
    console.log(`Preparing to send ${document.title} for signature using available providers...`);
    // This would typically open the CreateSignatureRequestDialog
    // For now, we'll just log it - you can implement this later if needed
  };

  const handlePreviewDocument = (document) => {
    setPreviewDocument(document);
    setIsPreviewDialogOpen(true);
  };

  const openEditDialog = (document) => {
    setEditingDocument(document);
    setIsEditDialogOpen(true);
  };
  
  const clearAllDocuments = async () => {
    try {
      // Clear documents only for the current agency
      if (!currentUser?.agency_id) {
        console.error("Cannot clear documents: User agency ID is not available.");
        return;
      }
      const allDocsData = await Document.list();
      const allDocs = allDocsData.filter(doc => doc.agency_id === currentUser.agency_id);
      for (const doc of allDocs) {
        await Document.delete(doc.id);
      }
      loadAllData();
    } catch (error) {
      console.error("Failed to clear documents:", error);
    }
  };

  const filteredLocalDocuments = localDocuments.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-1">Upload and manage local documents to be published to BoldSign</p>
        </div>
        <div className="flex gap-2">
          {localDocuments.length > 0 && (
            <Button
              variant="outline"
              onClick={clearAllDocuments}
              className="text-red-600 border-red-200 hover:bg-red-50"
              disabled={!currentUser?.agency_id} // Disable if no agency context
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Docs
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing || !currentUser?.agency_id} // Disable if no agency context
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
            className="bg-blue-500 hover:bg-blue-600"
            disabled={!currentUser?.agency_id} // Disable if no agency context
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {!apiConfigured && (
        <Alert className="mb-6">
          <Settings className="h-4 w-4" />
          <AlertDescription>
            BoldSign is not connected.
            <Link to={createPageUrl("Settings")} className="font-semibold text-blue-600 hover:underline ml-1">
              Go to Settings
            </Link> to connect your account and enable e-signatures.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search local documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 max-w-md"
            disabled={!currentUser?.agency_id} // Disable if no agency context
          />
        </div>
      </div>

      {/* Local Documents Section */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <HardDrive className="w-5 h-5" />
            Local Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-white rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredLocalDocuments.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <p className="text-green-600 mb-4">No local documents yet</p>
              <Button
                onClick={() => setIsUploadDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
                disabled={!currentUser?.agency_id} // Disable if no agency context
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload First Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocalDocuments.map((document) => (
                <Card key={document.id} className="bg-white border-green-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-green-600" />
                        <h3 className="font-semibold text-sm truncate">{document.title}</h3>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                        Local
                      </Badge>
                    </div>

                    {document.description && (
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{document.description}</p>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-blue-600"
                          onClick={() => handlePreviewDocument(document)}
                          title="Preview Document"
                          disabled={!currentUser?.agency_id}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-green-600"
                          onClick={() => openEditDialog(document)}
                          title="Edit Document Properties"
                          disabled={!currentUser?.agency_id}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        {apiConfigured && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-green-600"
                            onClick={() => handleSendForSignature(document)}
                            title="Send for Signature"
                            disabled={!currentUser?.agency_id}
                          >
                            <CopyPlus className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-600"
                          onClick={() => handleDeleteDocument(document.id)}
                          title="Delete Document"
                          disabled={!currentUser?.agency_id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <UploadDocumentDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onSubmit={handleUploadDocument}
      />

      <EditDocumentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        document={editingDocument}
        onSubmit={handleEditDocument}
      />

      <DocumentPreviewDialog
        open={isPreviewDialogOpen}
        onOpenChange={setIsPreviewDialogOpen}
        document={previewDocument}
      />
    </div>
  );
}

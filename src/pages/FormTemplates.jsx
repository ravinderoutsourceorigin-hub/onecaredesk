
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FormTemplate } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Plus,
  ClipboardList,
  Loader2,
  Trash2,
  Pencil,
  Eye,
  Copy,
  ExternalLink,
  DownloadCloud,
  FileText,
  TrendingUp, // New Icon
} from "lucide-react";
import FormTemplateDialog from "@/components/forms/FormTemplateDialog";
import FormTemplatePreviewDialog from "@/components/forms/FormTemplatePreviewDialog";
import JotFormImportDialog from "@/components/forms/JotFormImportDialog"; // New Import
import { createPageUrl } from "@/utils";
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

export default function FormTemplates() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false); // New State
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewingTemplate, setPreviewingTemplate] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem('app_user');
    if (userString) {
      setCurrentUser(JSON.parse(userString));
    } else {
      setIsLoading(false);
    }
  }, []);
  const loadTemplates = useCallback(async () => {
    if (!currentUser?.agency_id) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
      const data = await FormTemplate.filter({ agency_id: currentUser.agency_id }, "-created_date");
      setTemplates(data);
    } catch (error) {
      console.error("Error loading form templates:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadTemplates();
    }
  }, [currentUser, loadTemplates]);

  const handleOpenDialog = (template = null) => {
    setEditingTemplate(template);
    setIsDialogOpen(true);
  };

  const handlePreview = (template) => {
    setPreviewingTemplate(template);
    setIsPreviewOpen(true);
  };

  const copyPublicUrl = async (template) => {
    const publicUrl = `${window.location.origin}${createPageUrl(`FormViewer?id=${template.id}`)}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      console.log('Public URL copied to clipboard');
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const openInNewTab = (template) => {
    const publicUrl = `${window.location.origin}${createPageUrl(`FormViewer?id=${template.id}`)}`;
    window.open(publicUrl, '_blank');
  };

  const handleSubmit = async (formData) => {
    if (!currentUser?.agency_id) {
        throw new Error("Cannot save: No agency context.");
    }
    
    if (editingTemplate) {
      await FormTemplate.update(editingTemplate.id, formData);
    } else {
      await FormTemplate.create({ ...formData, agency_id: currentUser.agency_id });
    }
    loadTemplates();
  };

  const handleDelete = async (templateId) => {
    try {
      await FormTemplate.delete(templateId);
      loadTemplates();
    } catch (error) {
      console.error("Failed to delete template:", error);
    }
  };

  // Calculate stats
  const publishedTemplates = templates.filter(t => t.status === 'published');
  const draftTemplates = templates.filter(t => t.status === 'draft');

  return (
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
            <FileText className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Form Templates
            </h1>
            <p className="text-white/90 text-base lg:text-lg">
              Manage embeddable forms for a branded user experience
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Templates", value: templates.length, icon: FileText, color: "from-blue-500 to-blue-600" },
          { label: "Published", value: publishedTemplates.length, icon: Eye, color: "from-green-500 to-green-600" },
          { label: "Draft", value: draftTemplates.length, icon: Copy, color: "from-purple-500 to-purple-600" },
          { label: "Recently Used", value: 0, icon: TrendingUp, color: "from-indigo-500 to-indigo-600" }
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

      {/* Modern Header Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center mb-6 bg-white rounded-2xl shadow-lg p-6"
      >
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Templates ({templates.length})</h3>
          <p className="text-sm text-gray-500">Import from JotForm or create custom forms</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsImportOpen(true)} disabled={!currentUser} variant="outline" className="rounded-xl border-gray-200">
            <DownloadCloud className="w-4 h-4 mr-2" />
            Import from JotForm
          </Button>
          <Button onClick={() => handleOpenDialog()} disabled={!currentUser} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add New Template
          </Button>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
        </div>
      ) : templates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center py-12 border-2 border-dashed rounded-2xl bg-white"
        >
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-medium text-gray-600 mb-2">No form templates found.</p>
          <p className="text-sm text-gray-500 mb-4">Import your forms from JotForm or create one manually.</p>
          <Button onClick={() => setIsImportOpen(true)} disabled={!currentUser} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
            <DownloadCloud className="w-4 h-4 mr-2" />
            Import from JotForm
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {templates.map((template) => {
            const publicUrl = `${window.location.origin}${createPageUrl(`FormViewer?id=${template.id}`)}`;
            
            return (
              <Card key={template.id} className="flex flex-col rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="truncate">{template.name}</CardTitle>
                  <CardDescription className="truncate">{template.description}</CardDescription>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <span className="font-medium">Provider:</span>
                    <span>{template.provider}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  {/* Public URL Display */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                    <label className="text-xs font-medium text-gray-600">Public URL:</label>
                    <div className="mt-1 flex items-center gap-1">
                      <input
                        type="text"
                        value={publicUrl}
                        readOnly
                        className="flex-1 text-xs bg-white border border-gray-200 rounded px-2 py-1 font-mono text-blue-600 truncate"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyPublicUrl(template)}
                        className="h-7 w-7 flex-shrink-0"
                        title="Copy URL"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                
                {/* Action Buttons */}
                <div className="border-t p-4 flex justify-between">
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handlePreview(template)}
                      title="Preview Form"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => openInNewTab(template)}
                      title="Open in New Tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(template)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the "{template.name}" template. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(template.id)} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            );
          })}
        </motion.div>
      )}

      <FormTemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        template={editingTemplate}
      />

      <FormTemplatePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        template={previewingTemplate}
      />

      <JotFormImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImportSuccess={loadTemplates}
      />
    </div>
  );
}

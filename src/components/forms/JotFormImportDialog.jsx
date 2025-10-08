import React, { useState, useEffect, useCallback } from "react";
import apiClient from "@/api/apiClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, CheckCircle, DownloadCloud, ServerCrash } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { jotFormAPI } from "@/api/functions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function JotFormImportDialog({ open, onOpenChange, onImportSuccess }) {
  const [jotformForms, setJotformForms] = useState([]);
  const [importedUrls, setImportedUrls] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [importingId, setImportingId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem('app_user');
    if (userString) {
      setCurrentUser(JSON.parse(userString));
    }
  }, []);

  const fetchForms = useCallback(async () => {
    if (!open || !currentUser?.agency_id) return;

    setIsLoading(true);
    setError(null);
    try {
      // Fetch local form templates to check for existing imports
      const localTemplates = await apiClient.FormTemplate.list();
      const agencyTemplates = localTemplates.filter(t => t.agency_id === currentUser.agency_id);
      setImportedUrls(new Set(agencyTemplates.map(t => t.form_url)));

      // Fetch forms from JotForm using the backend API
      const { data, error: apiError } = await jotFormAPI({ action: 'getForms' });

      if (apiError) {
        throw new Error(apiError.error || "Failed to fetch forms from JotForm. Please check your API key in Settings.");
      }

      if (data && data.success) {
        setJotformForms(data.forms || []);
      } else {
        throw new Error(data.error || "An unknown error occurred.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [open, currentUser]);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const handleImport = async (form) => {
    if (!currentUser?.agency_id) {
      setError("Cannot import: User is not associated with an agency.");
      return;
    }
    setImportingId(form.id);
    try {
      await apiClient.FormTemplate.create({
        agency_id: currentUser.agency_id,
        name: form.title,
        description: form.title,
        provider: "JotForm",
        form_url: form.url,
        embed_code: "",
        external_form_id: form.id,
      });
      // Refresh the list of imported URLs
      setImportedUrls(prev => new Set(prev).add(form.url));
      // Notify parent component to refresh its list
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err) {
      console.error("Import failed:", err);
      // You could set a specific error for this row if needed
    } finally {
      setImportingId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Forms</DialogTitle>
          <DialogDescription>
            Select forms from your JotForm account to import as templates into OneCareDesk.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-4">
            <ServerCrash className="h-4 w-4" />
            <AlertDescription>
                <p className="font-bold">Could not load forms</p>
                <p>{error}</p>
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-96 border rounded-lg p-2">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
            ) : jotformForms.length === 0 && !error ? (
                <div className="text-center py-10">
                    <p>No forms found in your JotForm account.</p>
                </div>
            ) : (
                <div className="space-y-2">
                {jotformForms.map(form => {
                    const isImported = importedUrls.has(form.url);
                    return (
                    <div key={form.id} className="flex items-center justify-between p-3 bg-white rounded-md border hover:bg-gray-50">
                        <div>
                        <p className="font-medium">{form.title}</p>
                        <p className="text-xs text-gray-500">
                            Submissions: {form.count} | Status: <Badge variant={form.status === 'ENABLED' ? 'default': 'outline'}>{form.status}</Badge>
                        </p>
                        </div>
                        {isImported ? (
                        <Button variant="outline" size="sm" disabled>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Imported
                        </Button>
                        ) : (
                        <Button
                            size="sm"
                            onClick={() => handleImport(form)}
                            disabled={importingId === form.id}
                        >
                            {importingId === form.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                            <DownloadCloud className="w-4 h-4 mr-2" />
                            )}
                            Import
                        </Button>
                        )}
                    </div>
                    );
                })}
                </div>
            )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
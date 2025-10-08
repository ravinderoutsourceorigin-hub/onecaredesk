import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "@/api/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FormViewer() {
  const [searchParams] = useSearchParams();
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formUrl, setFormUrl] = useState("");

  const templateId = searchParams.get('id');
  const formId = searchParams.get('form');

  useEffect(() => {
    const loadTemplate = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (templateId) {
          // Load template by ID
          const templateData = await apiClient.FormTemplate.get(templateId);
          setTemplate(templateData);
          
          if (templateData.form_url) {
            setFormUrl(templateData.form_url);
          } else if (templateData.external_form_id) {
            // Construct URL based on provider
            if (templateData.provider === 'JotForm') {
              setFormUrl(`https://form.jotform.com/${templateData.external_form_id}`);
            } else {
              setFormUrl(templateData.external_form_id);
            }
          }
        } else if (formId) {
          // Direct form access
          if (/^\d+$/.test(formId)) {
            // Numeric form ID, assume JotForm
            setFormUrl(`https://form.jotform.com/${formId}`);
            setTemplate({ name: `Form ${formId}`, provider: 'JotForm' });
          } else {
            // Assume it's a full URL
            setFormUrl(formId);
            setTemplate({ name: 'External Form', provider: 'Custom' });
          }
        } else {
          throw new Error("No form ID or template ID provided");
        }
      } catch (err) {
        console.error("Error loading form:", err);
        setError(err.message || "Failed to load form");
      } finally {
        setIsLoading(false);
      }
    };

    if (templateId || formId) {
      loadTemplate();
    } else {
      setError("No form identifier provided");
      setIsLoading(false);
    }
  }, [templateId, formId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-bold">Error loading form</p>
            <p>{error}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {template && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              {template.description && (
                <p className="text-gray-600">{template.description}</p>
              )}
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            {formUrl ? (
              <iframe
                src={formUrl}
                className="w-full min-h-[600px] border-0"
                title={template?.name || "Form"}
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            ) : template?.embed_code ? (
              <div
                className="w-full min-h-[600px]"
                dangerouslySetInnerHTML={{ __html: template.embed_code }}
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                <p>No form content available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
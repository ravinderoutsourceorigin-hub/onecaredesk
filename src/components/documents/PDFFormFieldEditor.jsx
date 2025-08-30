import React, { useState, useEffect } from "react";
import { Document } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  FileText, 
  AlertTriangle,
  ExternalLink,
  Info
} from "lucide-react";

export default function PDFFormFieldEditor({ documentId }) {
  const [doc, setDoc] = useState(null);
  const [loadingState, setLoadingState] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!documentId) {
        setLoadingState('error');
        setErrorMessage('No Document ID provided.');
        return;
      }
      
      try {
        setLoadingState('loading');
        const documentData = await Document.get(documentId);
        setDoc(documentData);
        setLoadingState('loaded');
      } catch (error) {
        console.error("Failed to load document:", error);
        setLoadingState('error');
        setErrorMessage(`Failed to load document: ${error.message}`);
      }
    };
    loadData();
  }, [documentId]);

  if (loadingState === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Error Loading Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{errorMessage}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">PDF Form Editor</h1>
        <p className="text-gray-600">
          Internal PDF form field editing has been discontinued. Please use external e-signature providers for form fields.
        </p>
      </div>

      {doc && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {doc.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">External E-Signature Providers</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    For the best experience with form fields and signatures, we now integrate with professional 
                    e-signature providers like BoldSign, DocuSign, Adobe Sign, and HelloSign.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => window.open(doc.file_url, '_blank')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View PDF Document
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.close()}
              >
                Close Editor
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              <p><strong>File:</strong> {doc.file_name}</p>
              <p><strong>Type:</strong> {doc.file_type}</p>
              <p><strong>Category:</strong> {doc.category}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
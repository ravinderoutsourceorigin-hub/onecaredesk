import React, { useEffect, useState } from "react";
import PDFFormFieldEditor from "../components/documents/PDFFormFieldEditor";

export default function PDFEditor() {
  const [documentId, setDocumentId] = useState(null);

  useEffect(() => {
    // Get document ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('documentId');
    
    console.log("PDFEditor - Document ID from URL:", docId);
    setDocumentId(docId);
  }, []);

  if (!documentId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading PDF Editor...</h2>
          <p className="text-gray-600">Please wait while we prepare the editor.</p>
          {!documentId && (
            <p className="text-red-600 text-sm mt-2">Error: No document ID provided in URL</p>
          )}
        </div>
      </div>
    );
  }

  return <PDFFormFieldEditor documentId={documentId} />;
}
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";

export default function DocumentPreviewDialog({ open, onOpenChange, document }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (open && document) {
      setLoading(true);
      setError(null);
      setScale(1.0);
      setRotation(0);
    }
  }, [open, document]);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (document?.file_url) {
      window.open(document.file_url, '_blank');
    }
  };

  const renderPreview = () => {
    if (!document) return null;

    const { file_type, file_url, file_name } = document;

    // Handle PDF files
    if (file_type === 'pdf') {
      return (
        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={`${file_url}#toolbar=1&navpanes=0&scrollbar=1&page=1&view=FitH`}
            className="w-full h-full min-h-[600px]"
            title={`Preview of ${file_name}`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError('Failed to load PDF document');
              setLoading(false);
            }}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          />
        </div>
      );
    }

    // Handle image files
    if (['jpg', 'jpeg', 'png'].includes(file_type)) {
      return (
        <div 
          className="flex-1 bg-gray-100 rounded-lg overflow-auto flex items-center justify-center p-4"
          style={{ minHeight: '600px' }}
        >
          <img
            src={file_url}
            alt={file_name}
            className="max-w-full max-h-full object-contain shadow-lg rounded"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError('Failed to load image');
              setLoading(false);
            }}
          />
        </div>
      );
    }

    // Handle DOC/DOCX files
    if (['doc', 'docx'].includes(file_type)) {
      return (
        <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden">
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(file_url)}`}
            className="w-full h-full min-h-[600px]"
            title={`Preview of ${file_name}`}
            onLoad={() => setLoading(false)}
            onError={() => {
              setError('Failed to load document. Please download to view.');
              setLoading(false);
            }}
          />
        </div>
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-600 font-semibold text-sm">
              {file_type?.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 mb-4">Preview not available for this file type</p>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download to View
          </Button>
        </div>
      </div>
    );
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="truncate">{document.title}</DialogTitle>
              <p className="text-sm text-gray-500 truncate">{document.file_name}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="flex-shrink-0 ml-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 3.0}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-4 w-px bg-gray-300 mx-2" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
          >
            <RotateCw className="w-4 h-4 mr-1" />
            Rotate
          </Button>
          
          <div className="flex-1" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          )}
          
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default function FormTemplatePreviewDialog({ open, onOpenChange, template }) {
  if (!template) return null;

  const handleOpenInNewTab = () => {
    if (template.form_url) {
      window.open(template.form_url, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Preview: {template.name}</DialogTitle>
          <DialogDescription>
            {template.description}
          </DialogDescription>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              disabled={!template.form_url}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 border rounded-lg overflow-hidden">
          {template.form_url ? (
            <iframe
              src={template.form_url}
              className="w-full h-[500px]"
              title={`Preview: ${template.name}`}
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          ) : template.embed_code ? (
            <div
              className="w-full h-[500px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: template.embed_code }}
            />
          ) : (
            <div className="flex items-center justify-center h-[500px] text-gray-500">
              <p>No preview available. Please provide a form URL or embed code.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
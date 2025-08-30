import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CopyPlus } from "lucide-react";
import { Document } from "@/api/entities";

export default function ConvertToTemplateDialog({ open, onOpenChange, document, onUpdate }) {
  const [boldsignTemplateId, setBoldsignTemplateId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (document) {
      setBoldsignTemplateId(document.boldsign_template_id || "");
    }
  }, [document]);

  if (!document) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await Document.update(document.id, { 
        is_template: true,
        boldsign_template_id: boldsignTemplateId
      });
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to convert document to template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CopyPlus className="w-5 h-5 text-blue-600" />
            Convert to E-Signature Template
          </DialogTitle>
          <DialogDescription className="pt-2">
            To use "{document.title}" for e-signatures, mark it as a template and provide the corresponding Template ID from your e-signature provider (e.g., BoldSign).
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="boldsign-template-id">BoldSign Template ID</Label>
            <Input
              id="boldsign-template-id"
              placeholder="Paste the Template ID here"
              value={boldsignTemplateId}
              onChange={(e) => setBoldsignTemplateId(e.target.value)}
              className="mt-1"
            />
             <p className="text-xs text-gray-500 mt-1">
              Create a template on BoldSign and copy its ID to link it.
            </p>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting || !boldsignTemplateId} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? "Saving..." : "Save as Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
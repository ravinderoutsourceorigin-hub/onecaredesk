
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Save, FileText, FileSignature, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function EditDocumentDialog({ open, onOpenChange, document, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    tags: [],
    boldsign_template_id: "",
    jotform_template_id: ""
  });
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load document data when dialog opens
  useEffect(() => {
    if (open && document) {
      setFormData({
        title: document.title || "",
        description: document.description || "",
        category: document.category || "other",
        tags: document.tags || [],
        boldsign_template_id: document.boldsign_template_id || "",
        jotform_template_id: document.jotform_template_id || ""
      });
      setTagInput("");
      setError(null);
    }
  }, [open, document]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("Please enter a document title.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare updated document data
      const documentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags,
        boldsign_template_id: formData.boldsign_template_id.trim(),
        jotform_template_id: formData.jotform_template_id.trim()
      };

      console.log("Updating document with data:", documentData);
      
      // Call the onSubmit callback with updated data
      await onSubmit(documentData);
      
      // Close dialog
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error updating document:", error);
      setError(`Update failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setTagInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Edit Document Properties
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Document Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <h3 className="font-medium text-gray-900">{document.file_name}</h3>
                <p className="text-sm text-gray-600">
                  {document.file_type?.toUpperCase()} • {(document.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Document Title */}
          <div>
            <Label htmlFor="title">Document Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter document title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter document description (optional)"
              rows={3}
            />
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="consent_form">Consent Form</SelectItem>
                <SelectItem value="intake_form">Intake Form</SelectItem>
                <SelectItem value="assessment">Assessment</SelectItem>
                <SelectItem value="care_plan">Care Plan</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="medical_record">Medical Record</SelectItem>
                <SelectItem value="background_check">Background Check</SelectItem>
                <SelectItem value="certification">Certification</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* E-Signature Provider IDs */}
          <div className="space-y-4 rounded-lg border p-4">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-gray-600"/>
              E-Signature Template IDs
            </h3>
            <p className="text-sm text-gray-500">
              Connect this document to templates in your e-signature providers.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="boldsign-id">BoldSign Template ID</Label>
                <Input
                  id="boldsign-id"
                  value={formData.boldsign_template_id}
                  onChange={(e) => handleChange('boldsign_template_id', e.target.value)}
                  placeholder="e.g., 2d37a5ef-7c8b-4a93-9d2f-1e4567890abc"
                />
              </div>
              <div>
                <Label htmlFor="jotform-id">JotForm Template ID</Label>
                <Input
                  id="jotform-id"
                  value={formData.jotform_template_id}
                  onChange={(e) => handleChange('jotform_template_id', e.target.value)}
                  placeholder="e.g., 252305246230041"
                />
                <Alert className="mt-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    For JotForm, enter the Form ID of your pre-created signature form.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags (press Enter)"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-600" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

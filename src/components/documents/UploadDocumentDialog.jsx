
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
import { X, Upload, FileText, FileSignature, Info } from "lucide-react";
import { UploadFile } from "@/api/integrations";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UploadDocumentDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "other",
    tags: [],
    boldsign_template_id: "",
    jotform_template_id: "" // Removed goformz_template_id
  });
  const [file, setFile] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "other",
      tags: [],
      boldsign_template_id: "",
      jotform_template_id: "" // Removed goformz_template_id
    });
    setFile(null);
    setTagInput("");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a document title.");
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      console.log("Starting file upload...");
      
      // Upload file first
      const uploadResult = await UploadFile({ file });
      console.log("File upload result:", uploadResult);
      
      if (!uploadResult.file_url) {
        throw new Error("File upload failed - no URL returned");
      }
      
      // Prepare document data
      const documentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        file_url: uploadResult.file_url,
        file_name: file.name,
        file_type: file.type.split('/')[1] || 'unknown',
        file_size: file.size,
        category: formData.category,
        tags: formData.tags,
        boldsign_template_id: formData.boldsign_template_id.trim(),
        jotform_template_id: formData.jotform_template_id.trim(), // Removed goformz_template_id
        is_template: false,
        status: "draft"
      };

      console.log("Creating document with data:", documentData);
      
      // Call the onSubmit callback
      await onSubmit(documentData);
      
      // Reset form and close dialog
      resetForm();
      onOpenChange(false);
      
    } catch (error) {
      console.error("Error uploading document:", error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user makes changes
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      
      // Auto-populate title if empty
      if (!formData.title) {
        const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({ ...prev, title: nameWithoutExtension }));
      }
    }
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

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Document</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Select File *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {file ? (
                <div className="flex items-center gap-3 justify-center">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFile(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-sm text-gray-500">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
                </div>
              )}
              <input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              {!file && (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById('file').click()}
                >
                  Select File
                </Button>
              )}
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
              E-Signature Template IDs (Optional)
            </h3>
            <p className="text-sm text-gray-500">
              If this document corresponds to a template in your e-signature provider, enter the ID here.
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
              {/* Removed GoFormz Template ID section */}
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
                    For JotForm, you must provide the Form ID of your pre-created template.
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
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!file || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

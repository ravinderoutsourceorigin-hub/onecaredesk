import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FormTemplateDialog({ open, onOpenChange, onSubmit, template }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    provider: "JotForm",
    form_url: "",
    embed_code: "",
    external_form_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || "",
        description: template.description || "",
        provider: template.provider || "JotForm",
        form_url: template.form_url || "",
        embed_code: template.embed_code || "",
        external_form_id: template.external_form_id || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        provider: "JotForm",
        form_url: "",
        embed_code: "",
        external_form_id: "",
      });
    }
  }, [template, open]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving form template:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{template ? "Edit" : "Add"} Form Template</DialogTitle>
          <DialogDescription>
            {template ? "Update the form template details." : "Create a new form template."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter template name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="provider">Provider</Label>
            <Select value={formData.provider} onValueChange={(value) => handleChange("provider", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JotForm">JotForm</SelectItem>
                <SelectItem value="Fillout">Fillout</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="form_url">Form URL</Label>
            <Input
              id="form_url"
              value={formData.form_url}
              onChange={(e) => handleChange("form_url", e.target.value)}
              placeholder="https://form.jotform.com/..."
              type="url"
            />
          </div>

          <div>
            <Label htmlFor="external_form_id">External Form ID</Label>
            <Input
              id="external_form_id"
              value={formData.external_form_id}
              onChange={(e) => handleChange("external_form_id", e.target.value)}
              placeholder="Form ID from the provider"
            />
          </div>

          <div>
            <Label htmlFor="embed_code">Embed Code (Optional)</Label>
            <Textarea
              id="embed_code"
              value={formData.embed_code}
              onChange={(e) => handleChange("embed_code", e.target.value)}
              placeholder="<iframe src=... (optional)"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : template ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
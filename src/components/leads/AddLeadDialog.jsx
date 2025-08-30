import React, { useState } from "react";
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
import { TestTube } from "lucide-react"; // Added test tube icon

export default function AddLeadDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "website",
    service_type: "home_care",
    urgency: "medium",
    notes: "",
    assigned_to: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: "",
      email: "",
      phone: "",
      source: "website",
      service_type: "home_care", 
      urgency: "medium",
      notes: "",
      assigned_to: ""
    });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const fillTestData = () => {
    const testDataSamples = [
      {
        name: "Eleanor Thompson",
        email: "eleanor.thompson@email.com",
        phone: "(555) 234-5678",
        source: "referral",
        service_type: "home_care",
        urgency: "high",
        notes: "86-year-old needs assistance with daily activities. Daughter lives out of state. Recently had hip surgery.",
        assigned_to: "Sarah Johnson"
      },
      {
        name: "Robert Martinez",
        email: "robert.martinez@gmail.com",
        phone: "(555) 876-5432",
        source: "website",
        service_type: "companion_care",
        urgency: "medium",
        notes: "Widower seeking companionship and light housekeeping. Very active for his age, enjoys gardening.",
        assigned_to: "Mike Wilson"
      },
      {
        name: "Mary Chen",
        email: "marychen.home@yahoo.com",
        phone: "(555) 345-9876",
        source: "phone",
        service_type: "medical_care",
        urgency: "urgent",
        notes: "Post-stroke care needed. Requires medication management and physical therapy assistance.",
        assigned_to: "Lisa Rodriguez"
      },
      {
        name: "Frank Williams",
        email: "f.williams@outlook.com",
        phone: "(555) 567-8901",
        source: "walk_in",
        service_type: "respite_care",
        urgency: "low",
        notes: "Family caregiver needs occasional respite care on weekends. Client has dementia but is generally pleasant.",
        assigned_to: "Jennifer Davis"
      }
    ];
    
    // Pick a random test data sample
    const randomSample = testDataSamples[Math.floor(Math.random() * testDataSamples.length)];
    setFormData(randomSample);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="source">Source</Label>
              <Select value={formData.source} onValueChange={(value) => handleChange('source', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="walk_in">Walk-in</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="service_type">Service Type</Label>
              <Select value={formData.service_type} onValueChange={(value) => handleChange('service_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_care">Home Care</SelectItem>
                  <SelectItem value="companion_care">Companion Care</SelectItem>
                  <SelectItem value="medical_care">Medical Care</SelectItem>
                  <SelectItem value="respite_care">Respite Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="urgency">Urgency</Label>
              <Select value={formData.urgency} onValueChange={(value) => handleChange('urgency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assigned_to">Assigned To</Label>
              <Input
                id="assigned_to"
                value={formData.assigned_to}
                onChange={(e) => handleChange('assigned_to', e.target.value)}
                placeholder="Staff member"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-between items-center gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={fillTestData}
              className="bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Fill Test Data
            </Button>
            
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                Add Lead
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
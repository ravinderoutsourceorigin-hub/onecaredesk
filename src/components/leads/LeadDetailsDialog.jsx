
import React, { useState, useEffect } from "react";
import { Lead } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Task } from "@/api/entities"; // Added import for Task entity
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Mail,
  Phone,
  Building,
  FileSignature,
  ListPlus,
  UserPlus,
  Loader2,
  CheckCircle,
  XCircle,
  Save,
  History,
  CheckCircle2,
  Plus // Added import for Plus icon
} from "lucide-react";
import ActivityLog from "./ActivityLog";
import CreateSignatureRequestDialog from "../signatures/CreateSignatureRequestDialog";
import AddTaskDialog from "../tasks/AddTaskDialog";
import RelatedTasks from "./RelatedTasks";

export default function LeadDetailsDialog({ open, onOpenChange, lead, onUpdate }) {
  const [currentLead, setCurrentLead] = useState(lead);
  const [editedLead, setEditedLead] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [relatedTasks, setRelatedTasks] = useState([]); // Added state for related tasks
  const [tasksLoading, setTasksLoading] = useState(true); // Added state for tasks loading

  // Function to load related tasks
  const loadRelatedTasks = async (leadId) => {
    if (!leadId) return;
    setTasksLoading(true);
    try {
      const tasks = await Task.filter({
        related_entity_id: leadId,
        related_type: 'lead'
      }, '-created_date'); // Assuming '-created_date' for sorting
      setRelatedTasks(tasks);
    } catch (error) {
      console.error("Error loading related tasks:", error);
      setRelatedTasks([]);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    setCurrentLead(lead);
    setEditedLead({
      name: lead?.name || '',
      email: lead?.email || '',
      phone: lead?.phone || '',
      source: lead?.source || 'website',
      service_type: lead?.service_type || 'home_care',
      urgency: lead?.urgency || 'medium',
      notes: lead?.notes || '',
      assigned_to: lead?.assigned_to || ''
    });
    setConversionResult(null);
    // Load related tasks when lead prop changes
    if (lead?.id) {
      loadRelatedTasks(lead.id);
    }
  }, [lead]);

  if (!currentLead) return null;

  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    qualified: "bg-green-100 text-green-800",
    assessment_scheduled: "bg-purple-100 text-purple-800",
    converted: "bg-emerald-100 text-emerald-800",
    closed: "bg-gray-100 text-gray-800"
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsSaving(true);
      const updatedLead = await Lead.update(currentLead.id, { status: newStatus });
      setCurrentLead(updatedLead);
      onUpdate();
    } catch (error) {
      console.error("Error updating lead status:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const updatedLead = await Lead.update(currentLead.id, editedLead);
      setCurrentLead(updatedLead);
      onUpdate();

      const activityEntry = {
        timestamp: new Date().toISOString(),
        type: 'lead_updated',
        action: 'Lead information updated',
        details: { updated_fields: Object.keys(editedLead) },
        source: 'manual'
      };
      await handleAddActivity(activityEntry);

    } catch (error) {
      console.error("Error saving lead changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddActivity = async (activityEntry) => {
    try {
      const existingActivities = currentLead.activity_log || [];
      const updatedActivities = [activityEntry, ...existingActivities];
      const updatedLead = await Lead.update(currentLead.id, { activity_log: updatedActivities });
      setCurrentLead(updatedLead);
      setIsActivityFormOpen(false);
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const handleConvertToPatient = async () => {
    setIsConverting(true);
    setConversionResult(null);
    try {
      const patientData = {
        agency_id: currentLead.agency_id,
        first_name: currentLead.name.split(' ')[0],
        last_name: currentLead.name.split(' ').slice(1).join(' ') || 'N/A',
        email: currentLead.email,
        phone: currentLead.phone,
        status: 'active',
        onboarding_status: 'pending',
        care_level: 'companion'
      };
      await Patient.create(patientData);

      const updatedLead = await Lead.update(currentLead.id, { status: 'converted' });
      setCurrentLead(updatedLead);

      const activityEntry = {
        timestamp: new Date().toISOString(),
        type: 'status_change',
        action: `Lead converted to new patient`,
        details: { new_status: 'converted' },
        source: 'application'
      };
      await handleAddActivity(activityEntry);

      onUpdate();
      setConversionResult('success');
    } catch (error) {
      console.error("Error converting lead to patient:", error);
      setConversionResult('error');
    } finally {
      setIsConverting(false);
    }
  };

  const handleTaskAdded = () => {
    onUpdate(); // This might trigger a reload of the lead, which should re-run the useEffect
    if (currentLead?.id) {
      loadRelatedTasks(currentLead.id); // Also specifically reload tasks
    }
  };

  const openTasks = relatedTasks.filter(task => task.status !== 'completed');
  const completedTasks = relatedTasks.filter(task => task.status === 'completed');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6 p-6">
          {/* Action Buttons Section */}
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <CardTitle className="text-indigo-800 text-lg flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <ListPlus className="w-4 h-4 text-indigo-600" />
                </div>
                Lead Actions
              </CardTitle>
              {conversionResult === 'success' ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-green-800">Conversion Successful!</p>
                    <p className="text-sm text-green-700">This lead is now a patient.</p>
                  </div>
                   <Button size="sm" onClick={() => onOpenChange(false)} className="bg-gray-700 hover:bg-gray-800">
                    Close
                  </Button>
                </div>
              ) : conversionResult === 'error' ? (
                 <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold text-red-800">Conversion Failed</p>
                    <p className="text-sm text-red-700">Please try again.</p>
                   </div>
                  <Button size="sm" variant="destructive" onClick={handleConvertToPatient} disabled={isConverting}>
                    {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Try Again'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTaskDialogOpen(true)}
                    className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <ListPlus className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSignatureDialogOpen(true)}
                    className="bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <FileSignature className="w-4 h-4 mr-2" />
                    Send E-Sign
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsActivityFormOpen(true);
                    }}
                    className="bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Add Note
                  </Button>
                  {currentLead.status !== 'converted' && (
                    <Button
                      size="sm"
                      onClick={handleConvertToPatient}
                      disabled={isConverting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isConverting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Convert to Patient
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>
          </Card>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Details Section */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-800 text-lg flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    Lead Details & Information
                  </CardTitle>
                  {currentLead.status === 'converted' && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Converted
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-blue-800 font-medium">Full Name</Label>
                    <Input
                      id="name"
                      value={editedLead.name}
                      onChange={(e) => setEditedLead({...editedLead, name: e.target.value})}
                      className="border-blue-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-blue-800 font-medium">Phone</Label>
                    <Input
                      id="phone"
                      value={editedLead.phone}
                      onChange={(e) => setEditedLead({...editedLead, phone: e.target.value})}
                      className="border-blue-300"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-blue-800 font-medium">Email</Label>
                  <Input
                    id="email"
                    value={editedLead.email}
                    onChange={(e) => setEditedLead({...editedLead, email: e.target.value})}
                    className="border-blue-300"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="source" className="text-blue-800 font-medium">Source</Label>
                    <Select value={editedLead.source} onValueChange={(value) => setEditedLead({...editedLead, source: value})}>
                      <SelectTrigger className="border-blue-300">
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
                    <Label htmlFor="urgency" className="text-blue-800 font-medium">Urgency</Label>
                    <Select value={editedLead.urgency} onValueChange={(value) => setEditedLead({...editedLead, urgency: value})}>
                      <SelectTrigger className="border-blue-300">
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
                </div>

                <div>
                  <Label htmlFor="status" className="text-blue-800 font-medium">Lead Status</Label>
                  <Select value={currentLead.status} onValueChange={handleStatusChange} disabled={isSaving}>
                    <SelectTrigger className="border-blue-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="qualified">Qualified</SelectItem>
                      <SelectItem value="assessment_scheduled">Assessment Scheduled</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-blue-800 font-medium">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editedLead.notes}
                    onChange={(e) => setEditedLead({...editedLead, notes: e.target.value})}
                    rows={4}
                    className="border-blue-300"
                  />
                </div>

                <Button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Activity Log Section */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" data-section="activity">
              <CardHeader>
                <CardTitle className="text-green-800 text-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <History className="w-4 h-4 text-green-600" />
                  </div>
                  Communication & Activity History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityLog
                  activities={currentLead.activity_log || []}
                  onAddActivity={handleAddActivity}
                  leadId={currentLead.id}
                  isActivityFormOpen={isActivityFormOpen}
                  setIsActivityFormOpen={setIsActivityFormOpen}
                />
              </CardContent>
            </Card>
          </div>

          {/* Related Tasks Section (Full width) */}
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-orange-800 text-lg flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  </div>
                  Related Tasks ({openTasks.length} open, {completedTasks.length} completed)
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTaskDialogOpen(true)}
                  className="bg-white border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardHeader>
            <CardContent className="p-4">
              <RelatedTasks
                tasks={relatedTasks}
                isLoading={tasksLoading}
              />
            </CardContent>
          </Card>
        </div>
      </DialogContent>

      <CreateSignatureRequestDialog
        open={isSignatureDialogOpen}
        onOpenChange={setIsSignatureDialogOpen}
        entity={currentLead}
        onSubmit={() => onUpdate()}
      />

      <AddTaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        relatedEntity={{ id: currentLead.id, name: currentLead.name, type: 'lead' }}
        onTaskAdded={handleTaskAdded}
      />
    </Dialog>
  );
}

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ClipboardList, 
  User, 
  Calendar, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
  Edit,
  Save,
  X
} from "lucide-react";
import { format, isToday, isPast } from "date-fns";
import { Task } from "@/api/entities";

const priorityColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200", 
  low: "bg-green-100 text-green-700 border-green-200"
};

const statusColors = {
  pending: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
  completed: "bg-green-100 text-green-700 border-green-200"
};

const categoryColors = {
  onboarding: "bg-blue-100 text-blue-700 border-blue-200",
  documentation: "bg-purple-100 text-purple-700 border-purple-200",
  verification: "bg-orange-100 text-orange-700 border-orange-200",
  scheduling: "bg-teal-100 text-teal-700 border-teal-200",
  follow_up: "bg-indigo-100 text-indigo-700 border-indigo-200"
};

export default function TaskDetailsDialog({ open, onOpenChange, task, onUpdate, onStatusChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!task) return null;

  const getDueDateInfo = (dueDateString) => {
    if (!dueDateString) return null;
    const dueDate = new Date(dueDateString);
    
    if (isPast(dueDate)) return { 
      text: `Overdue (${format(dueDate, 'MMM d, yyyy')})`, 
      color: "text-red-600", 
      icon: AlertCircle,
      bgColor: "bg-red-50 border-red-200"
    };
    if (isToday(dueDate)) return { 
      text: "Due Today", 
      color: "text-orange-600", 
      icon: Clock,
      bgColor: "bg-orange-50 border-orange-200"
    };
    return { 
      text: `Due ${format(dueDate, 'MMM d, yyyy')}`, 
      color: "text-gray-600", 
      icon: Calendar,
      bgColor: "bg-gray-50 border-gray-200"
    };
  };

  const dueDateInfo = getDueDateInfo(task.due_date);

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(task.id, newStatus);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating task status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveDescription = async () => {
    setIsUpdating(true);
    try {
      await Task.update(task.id, { description: editedDescription });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error updating task description:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditing = () => {
    setEditedDescription(task.description || "");
    setIsEditing(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{task.title}</h2>
              <p className="text-sm text-gray-500">Task Details & Actions</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Badge className={`${statusColors[task.status]} w-full justify-center py-2`} variant="outline">
                {task.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <Badge className={`${priorityColors[task.priority]} w-full justify-center py-2`} variant="outline">
                {task.priority.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Badge className={`${categoryColors[task.category]} w-full justify-center py-2`} variant="outline">
                {task.category?.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Assignment and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.assigned_to && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Assigned To</p>
                  <p className="text-sm text-gray-900">{task.assigned_to}</p>
                </div>
              </div>
            )}
            
            {dueDateInfo && (
              <div className={`flex items-center gap-3 p-3 rounded-lg ${dueDateInfo.bgColor}`}>
                <dueDateInfo.icon className={`w-4 h-4 ${dueDateInfo.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-700">Due Date</p>
                  <p className={`text-sm font-medium ${dueDateInfo.color}`}>{dueDateInfo.text}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Description</label>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startEditing}
                  className="text-gray-600"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Add task description..."
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={isUpdating}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveDescription}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isUpdating ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg min-h-[80px]">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {task.description || "No description provided."}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t pt-4">
            <div className="flex gap-3 justify-end">
              {task.status === 'pending' && (
                <Button 
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Start Task
                </Button>
              )}
              
              {task.status === 'in_progress' && (
                <Button 
                  onClick={() => handleStatusChange('completed')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
              
              {task.status === 'completed' && (
                <Button 
                  onClick={() => handleStatusChange('pending')}
                  disabled={isUpdating}
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Reopen Task
                </Button>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4 text-xs text-gray-500 grid grid-cols-2 gap-4">
            <div>
              <strong>Created:</strong> {task.created_date ? format(new Date(task.created_date), 'MMM d, yyyy h:mm a') : 'Unknown'}
            </div>
            <div>
              <strong>Last Updated:</strong> {task.updated_date ? format(new Date(task.updated_date), 'MMM d, yyyy h:mm a') : 'Unknown'}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
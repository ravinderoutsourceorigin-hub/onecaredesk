import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  User, 
  UserCheck, 
  MapPin, 
  Edit, 
  Trash2, 
  Calendar,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AppointmentDetailsDialog({ 
  open, 
  onOpenChange, 
  appointment, 
  onUpdate, 
  onDelete,
  patients,
  caregivers 
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (!appointment) return null;

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800 border-blue-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      no_show: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || colors.scheduled;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-orange-600",
      urgent: "text-red-600"
    };
    return colors[priority] || colors.medium;
  };

  const handleStatusChange = (newStatus) => {
    onUpdate(appointment.id, { status: newStatus });
  };

  const handleDelete = () => {
    onDelete(appointment.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Appointment Details</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this appointment. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Delete Appointment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title and Status */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {appointment.title}
            </h2>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(appointment.status)} variant="outline">
                {appointment.status.replace('_', ' ')}
              </Badge>
              <span className={`text-sm font-medium ${getPriorityColor(appointment.priority)}`}>
                {appointment.priority} priority
              </span>
            </div>
          </div>

          {/* Quick Status Update */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status:
            </label>
            <Select value={appointment.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">
                  {format(new Date(appointment.appointment_date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">
                  {appointment.start_time} - {appointment.end_time}
                </p>
                {appointment.duration_minutes && (
                  <p className="text-sm text-gray-500">
                    ({appointment.duration_minutes} minutes)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* People Involved */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Patient</p>
                <p className="font-medium">{appointment.patient_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Caregiver</p>
                <p className="font-medium">{appointment.caregiver_name}</p>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Service Type</p>
              <p className="font-medium capitalize">
                {appointment.service_type.replace('_', ' ')}
              </p>
            </div>
            
            {appointment.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{appointment.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Notes</p>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-800">{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* Recurring Information */}
          {appointment.is_recurring && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Recurring Appointment</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Repeats {appointment.recurrence_pattern}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
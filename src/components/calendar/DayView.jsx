import React from "react";
import { format, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, User, UserCheck } from "lucide-react";

export default function DayView({ appointments, currentDate, onAppointmentClick }) {
  const dayAppointments = appointments
    .filter(apt => isSameDay(new Date(apt.appointment_date), currentDate))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

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

  return (
    <div className="p-6">
      {/* Day Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        <p className="text-gray-600 mt-2">
          {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''} scheduled
        </p>
      </div>

      {/* Appointments List */}
      <div className="max-w-4xl mx-auto">
        {dayAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
            <p className="text-gray-600">This day is free of any scheduled appointments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayAppointments.map((appointment, index) => (
              <div
                key={index}
                onClick={() => onAppointmentClick(appointment)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <Clock className="w-5 h-5 text-gray-500" />
                        {appointment.start_time} - {appointment.end_time}
                      </div>
                      <Badge className={getStatusColor(appointment.status)} variant="outline">
                        {appointment.status.replace('_', ' ')}
                      </Badge>
                      <span className={`text-sm font-medium ${getPriorityColor(appointment.priority)}`}>
                        {appointment.priority} priority
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-medium text-gray-900 mb-3">
                      {appointment.title}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Patient:</span>
                        <span className="font-medium">{appointment.patient_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Caregiver:</span>
                        <span className="font-medium">{appointment.caregiver_name}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="capitalize">
                        {appointment.service_type.replace('_', ' ')}
                      </span>
                      {appointment.location && (
                        <>
                          <span>•</span>
                          <span>{appointment.location}</span>
                        </>
                      )}
                      {appointment.duration_minutes && (
                        <>
                          <span>•</span>
                          <span>{appointment.duration_minutes} minutes</span>
                        </>
                      )}
                    </div>
                    
                    {appointment.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-700">{appointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
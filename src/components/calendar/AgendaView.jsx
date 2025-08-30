import React from "react";
import { format, parseISO, isToday, isTomorrow, isYesterday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, User, UserCheck, MapPin } from "lucide-react";

export default function AgendaView({ appointments, currentDate, onAppointmentClick }) {
  const sortedAppointments = appointments
    .sort((a, b) => {
      const dateCompare = new Date(a.appointment_date) - new Date(b.appointment_date);
      if (dateCompare !== 0) return dateCompare;
      return a.start_time.localeCompare(b.start_time);
    });

  const getDateLabel = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isYesterday(date)) return "Yesterday";
    return format(date, 'EEEE, MMMM d');
  };

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

  // Group appointments by date
  const groupedAppointments = sortedAppointments.reduce((groups, appointment) => {
    const date = appointment.appointment_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(appointment);
    return groups;
  }, {});

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {Object.keys(groupedAppointments).length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600">No appointments match your current filters.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedAppointments).map(([date, dayAppointments]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 pb-2 mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {getDateLabel(date)}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Appointments for this date */}
                <div className="space-y-3">
                  {dayAppointments.map((appointment, index) => (
                    <div
                      key={index}
                      onClick={() => onAppointmentClick(appointment)}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2 font-semibold text-gray-900">
                              <Clock className="w-4 h-4 text-gray-500" />
                              {appointment.start_time} - {appointment.end_time}
                            </div>
                            <Badge className={getStatusColor(appointment.status)} variant="outline">
                              {appointment.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <h3 className="font-medium text-gray-900 mb-2">
                            {appointment.title}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4" />
                              <span>Patient: {appointment.patient_name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <UserCheck className="w-4 h-4" />
                              <span>Caregiver: {appointment.caregiver_name}</span>
                            </div>
                            {appointment.location && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{appointment.location}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="capitalize">
                                {appointment.service_type.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                          
                          {appointment.notes && (
                            <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              {appointment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import React from "react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function WeekView({ appointments, currentDate, onAppointmentClick }) {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getAppointmentsForDay = (day) => {
    return appointments
      .filter(apt => isSameDay(new Date(apt.appointment_date), day))
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
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

  return (
    <div className="p-4">
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-4 mb-4">
        {weekDays.map((day, index) => (
          <div key={index} className={`text-center p-3 rounded-lg ${
            isToday(day) ? 'bg-blue-100 text-blue-800' : 'bg-gray-50'
          }`}>
            <div className="text-sm font-medium text-gray-600">
              {format(day, 'EEE')}
            </div>
            <div className={`text-lg font-bold ${
              isToday(day) ? 'text-blue-800' : 'text-gray-900'
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          
          return (
            <div key={index} className="min-h-[400px] bg-gray-50 rounded-lg p-2">
              <div className="space-y-2">
                {dayAppointments.map((appointment, idx) => (
                  <div
                    key={idx}
                    onClick={() => onAppointmentClick(appointment)}
                    className={`p-2 rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(appointment.status)}`}
                  >
                    <div className="font-medium text-sm">
                      {appointment.start_time} - {appointment.end_time}
                    </div>
                    <div className="text-xs font-medium truncate">
                      {appointment.patient_name}
                    </div>
                    <div className="text-xs truncate opacity-75">
                      {appointment.service_type.replace('_', ' ')}
                    </div>
                    <div className="text-xs truncate">
                      {appointment.caregiver_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
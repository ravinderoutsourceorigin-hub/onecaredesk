import React from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function MonthView({ appointments, currentDate, onAppointmentClick }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const getAppointmentsForDay = (day) => {
    return appointments.filter(apt => 
      isSameDay(new Date(apt.appointment_date), day)
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-emerald-100 text-emerald-800",
      cancelled: "bg-red-100 text-red-800",
      no_show: "bg-gray-100 text-gray-800"
    };
    return colors[status] || colors.scheduled;
  };

  return (
    <div className="p-4">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600 bg-gray-50 rounded-md">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border rounded-lg transition-colors ${
                isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
              } ${isDayToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className={`text-sm font-medium mb-2 ${
                isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              } ${isDayToday ? 'text-blue-600 font-bold' : ''}`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayAppointments.slice(0, 3).map((appointment, idx) => (
                  <div
                    key={idx}
                    onClick={() => onAppointmentClick(appointment)}
                    className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    <div className="font-medium truncate">
                      {appointment.start_time} - {appointment.patient_name}
                    </div>
                    <div className="truncate opacity-75">
                      {appointment.service_type.replace('_', ' ')}
                    </div>
                  </div>
                ))}
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-blue-600 font-medium">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
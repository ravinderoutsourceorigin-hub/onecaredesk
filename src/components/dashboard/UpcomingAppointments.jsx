import React, { useState, useEffect } from "react";
import { Appointment } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, MapPin, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, isTomorrow, startOfDay, addDays } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const ITEMS_PER_PAGE = 3;

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadUpcomingAppointments();
  }, []);

  const loadUpcomingAppointments = async () => {
    try {
      const today = startOfDay(new Date());
      const nextWeek = addDays(today, 7);
      
      // Get all appointments first
      const allAppointments = await Appointment.list();
      console.log("All appointments loaded:", allAppointments);
      
      // Filter for upcoming appointments in the next 7 days
      const upcoming = allAppointments.filter(apt => {
        const aptDate = startOfDay(new Date(apt.appointment_date));
        const isInRange = aptDate >= today && aptDate <= nextWeek;
        const isNotCancelled = apt.status !== 'cancelled';
        
        console.log("Checking appointment:", {
          date: apt.appointment_date,
          aptDate: aptDate,
          today: today,
          nextWeek: nextWeek,
          isInRange: isInRange,
          status: apt.status,
          isNotCancelled: isNotCancelled
        });
        
        return isInRange && isNotCancelled;
      });

      console.log("Filtered upcoming appointments:", upcoming);
      setAppointments(upcoming);
    } catch (error) {
      console.error("Error loading upcoming appointments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDateLabel = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "MMM d");
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-700 border-blue-200",
      confirmed: "bg-green-100 text-green-700 border-green-200",
      in_progress: "bg-yellow-100 text-yellow-700 border-yellow-200",
      completed: "bg-gray-100 text-gray-700 border-gray-200"
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  // Pagination logic
  const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentAppointments = appointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className="h-[400px] flex flex-col">
        <CardHeader className="bg-blue-50 border-b p-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-blue-700 text-base font-semibold">
            <Calendar className="w-4 h-4" />
            Loading Appointments...
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow flex flex-col">
          <div className="flex-grow divide-y">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="bg-blue-50 border-b p-4 flex-shrink-0">
        <CardTitle className="flex items-center justify-between text-blue-700 text-base font-semibold">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Upcoming Appointments
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal">{appointments.length} total</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <span className="text-xs text-gray-500 px-1">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col">
        <div className="flex-grow divide-y min-h-0 overflow-y-auto">
          {currentAppointments.length === 0 ? (
            <div className="p-6 text-center flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">No upcoming appointments</p>
              <p className="text-gray-500 text-sm mb-4">Schedule appointments to see them here</p>
              <Link to={createPageUrl("Calendar")}>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Schedule
                </Button>
              </Link>
            </div>
          ) : (
            currentAppointments.map((appointment) => (
              <div key={appointment.id} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm truncate">{appointment.title}</h4>
                  <Badge className={`${getStatusColor(appointment.status)} text-xs`} variant="outline">
                    {appointment.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <User className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{appointment.patient_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span>{getDateLabel(appointment.appointment_date)} at {appointment.start_time}</span>
                  </div>
                  {appointment.location && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{appointment.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border-t p-3 bg-gray-50 flex-shrink-0">
          <Link to={createPageUrl("Calendar")}>
            <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50">
              View All Appointments
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
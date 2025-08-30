
import React, { useState, useEffect } from "react";
import { Appointment } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Caregiver } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Search,
  List,
  Grid3x3
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday } from "date-fns";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import MonthView from "../components/calendar/MonthView";
import WeekView from "../components/calendar/WeekView";
import DayView from "../components/calendar/DayView";
import AgendaView from "../components/calendar/AgendaView";
import AddAppointmentDialog from "../components/calendar/AddAppointmentDialog";
import AppointmentDetailsDialog from "../components/calendar/AppointmentDetailsDialog";
import CalendarFilters from "../components/calendar/CalendarFilters";

export default function Calendar() {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // Added currentUser state
  const [filters, setFilters] = useState({
    caregiver: "all",
    patient: "all",
    status: "all",
    serviceType: "all"
  });

  // Effect to load the current user on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const userString = localStorage.getItem('app_user');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        } else {
            setIsLoading(false); // No user found, stop loading indicator
        }
      } catch (error) {
        console.error("Failed to load user from session:", error);
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []); // Runs once on mount

  // Effect to load calendar data when currentUser is set
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]); // Runs when currentUser changes

  useEffect(() => {
    filterAppointments();
  }, [appointments, filters]);

  const loadData = async () => {
    // Only load data if currentUser and agency_id are available
    if (!currentUser?.agency_id) {
      console.warn("No agency ID found for current user, skipping data load.");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [appointmentsData, patientsData, caregiversData] = await Promise.all([
        // Filter by agency_id for all entities
        Appointment.filter({ agency_id: currentUser.agency_id }, "-appointment_date"),
        Patient.filter({ agency_id: currentUser.agency_id }),
        Caregiver.filter({ agency_id: currentUser.agency_id })
      ]);
      
      setAppointments(appointmentsData);
      setPatients(patientsData);
      setCaregivers(caregiversData);
    } catch (error) {
      console.error("Error loading calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;
    
    if (filters.caregiver !== "all") {
      filtered = filtered.filter(apt => apt.caregiver_id === filters.caregiver);
    }
    
    if (filters.patient !== "all") {
      filtered = filtered.filter(apt => apt.patient_id === filters.patient);
    }
    
    if (filters.status !== "all") {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }
    
    if (filters.serviceType !== "all") {
      filtered = filtered.filter(apt => apt.service_type === filters.serviceType);
    }
    
    setFilteredAppointments(filtered);
  };

  const handleAddAppointment = async (appointmentData) => {
    if (!currentUser?.agency_id) {
      console.error("Cannot add appointment: no agency ID found for current user.");
      return;
    }
    // Add agency_id to the appointment data before creation
    const dataToCreate = { ...appointmentData, agency_id: currentUser.agency_id };
    await Appointment.create(dataToCreate);
    setIsAddDialogOpen(false);
    loadData();
  };

  const handleUpdateAppointment = async (id, updates) => {
    await Appointment.update(id, updates);
    loadData();
  };

  const handleDeleteAppointment = async (id) => {
    await Appointment.delete(id);
    loadData();
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const navigateMonth = (direction) => {
    if (direction === "prev") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const viewComponents = {
    month: MonthView,
    week: WeekView,
    day: DayView,
    agenda: AgendaView
  };

  const ViewComponent = viewComponents[view];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Calendar</h1>
          </div>
          
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("prev")}
              className="h-9 w-9"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[180px] text-center">
              <h2 className="font-semibold text-lg">
                {format(currentDate, "MMMM yyyy")}
              </h2>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigateMonth("next")}
              className="h-9 w-9"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex rounded-lg border bg-gray-50 p-1">
            <Button
              variant={view === "month" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("month")}
              className="rounded-md text-xs"
            >
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("week")}
              className="rounded-md text-xs"
            >
              Week
            </Button>
            <Button
              variant={view === "day" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("day")}
              className="rounded-md text-xs"
            >
              Day
            </Button>
            <Button
              variant={view === "agenda" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("agenda")}
              className="rounded-md text-xs"
            >
              <List className="w-3 h-3 mr-1" />
              Agenda
            </Button>
          </div>

          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!currentUser?.agency_id} // Disable if no agency ID
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <CalendarFilters
        filters={filters}
        onFiltersChange={setFilters}
        patients={patients}
        caregivers={caregivers}
      />

      {/* Calendar Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Loading calendar...</p>
            </div>
          </div>
        ) : (
          <ViewComponent
            appointments={filteredAppointments}
            currentDate={currentDate}
            onAppointmentClick={handleAppointmentClick}
            onDateChange={setCurrentDate}
          />
        )}
      </div>

      <AddAppointmentDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddAppointment}
        patients={patients}
        caregivers={caregivers}
      />

      <AppointmentDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        appointment={selectedAppointment}
        onUpdate={handleUpdateAppointment}
        onDelete={handleDeleteAppointment}
        patients={patients}
        caregivers={caregivers}
      />
    </div>
  );
}

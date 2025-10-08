
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
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
  Grid3x3,
  Clock,
  CheckSquare,
  TrendingUp
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

  const loadData = useCallback(async () => {
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
  }, [currentUser]); // currentUser is a dependency for loadData

  const filterAppointments = useCallback(() => {
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
  }, [appointments, filters]); // appointments and filters are dependencies for filterAppointments

  // Effect to load calendar data when currentUser is set
  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]); // Runs when currentUser or loadData changes

  useEffect(() => {
    filterAppointments();
  }, [appointments, filters, filterAppointments]); // appointments, filters, and filterAppointments are dependencies

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

  // Calculate stats
  const today = new Date();
  const todayAppointments = appointments.filter(apt => 
    isSameDay(parseISO(apt.scheduled_date), today)
  );
  const upcomingAppointments = appointments.filter(apt => 
    parseISO(apt.scheduled_date) > today
  );
  const completedAppointments = appointments.filter(apt => 
    apt.status === 'completed'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Modern Header with Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl">
            <CalendarIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              Appointment Calendar
            </h1>
            <p className="text-white/90 text-base lg:text-lg">
              Schedule and manage your care appointments
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Appointments", value: appointments.length, icon: CalendarIcon, color: "from-blue-500 to-blue-600" },
          { label: "Today's Schedule", value: todayAppointments.length, icon: Clock, color: "from-indigo-500 to-indigo-600" },
          { label: "Upcoming", value: upcomingAppointments.length, icon: TrendingUp, color: "from-purple-500 to-purple-600" },
          { label: "Completed", value: completedAppointments.length, icon: CheckSquare, color: "from-green-500 to-green-600" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="relative"
          >
            <div className="bg-white rounded-xl p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modern Header Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("prev")}
                className="h-10 w-10 rounded-xl border-gray-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-[200px] text-center">
                <h2 className="font-semibold text-xl text-gray-900">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("next")}
                className="h-10 w-10 rounded-xl border-gray-200"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
              <Button
                variant={view === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("month")}
                className="rounded-lg text-sm"
              >
                Month
              </Button>
              <Button
                variant={view === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("week")}
                className="rounded-lg text-sm"
              >
                Week
              </Button>
              <Button
                variant={view === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("day")}
                className="rounded-lg text-sm"
              >
                Day
              </Button>
            <Button
              variant={view === "agenda" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("agenda")}
              className="rounded-lg text-sm"
            >
              <List className="w-4 h-4 mr-1" />
              Agenda
            </Button>
          </div>

          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={!currentUser?.agency_id} // Disable if no agency ID
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
        </div>
      </motion.div>

      {/* Filters */}
      <CalendarFilters
        filters={filters}
        onFiltersChange={setFilters}
        patients={patients}
        caregivers={caregivers}
      />

      {/* Calendar Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg border-0"
      >
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
      </motion.div>

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

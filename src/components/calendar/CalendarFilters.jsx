import React from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function CalendarFilters({ filters, onFiltersChange, patients, caregivers }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
        <Filter className="w-4 h-4" />
        Filter Appointments
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select value={filters.caregiver} onValueChange={(value) => handleFilterChange('caregiver', value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Caregivers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Caregivers</SelectItem>
            {caregivers.map((caregiver) => (
              <SelectItem key={caregiver.id} value={caregiver.id}>
                {caregiver.first_name} {caregiver.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.patient} onValueChange={(value) => handleFilterChange('patient', value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Patients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={patient.id}>
                {patient.first_name} {patient.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.serviceType} onValueChange={(value) => handleFilterChange('serviceType', value)}>
          <SelectTrigger>
            <SelectValue placeholder="All Services" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="companion_care">Companion Care</SelectItem>
            <SelectItem value="personal_care">Personal Care</SelectItem>
            <SelectItem value="skilled_nursing">Skilled Nursing</SelectItem>
            <SelectItem value="physical_therapy">Physical Therapy</SelectItem>
            <SelectItem value="occupational_therapy">Occupational Therapy</SelectItem>
            <SelectItem value="medical_checkup">Medical Checkup</SelectItem>
            <SelectItem value="assessment">Assessment</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
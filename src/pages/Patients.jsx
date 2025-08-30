
import React, { useState, useEffect, useCallback } from "react";
import { Patient } from "@/api/entities";
// No longer importing User, will get from localStorage
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Plus, HeartHandshake, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

import PatientCard from "../components/patients/PatientCard";
import AddPatientDialog from "../components/patients/AddPatientDialog";
import Pagination from "../components/shared/Pagination";

// Import security functions
import { checkPermission, logAuditEvent } from "@/components/utils/Security";

const ITEMS_PER_PAGE = 12;

export default function Patients() {
  const [allPatients, setAllPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const fetchPatientsForCurrentUserAgency = useCallback(async (user) => {
    if (!user || !user.agency_id) {
      console.error("Cannot fetch patients: user or agency_id is missing.");
      setHasPermission(false);
      return;
    }
    setIsLoading(true);
    try {
      // Ensure current user is defined before logging audit event
      if (user) {
        await logAuditEvent(user, 'view_patients_page', 'Patient');
      }

      const patientsData = await Patient.filter({ agency_id: user.agency_id }, '-created_date');
      setAllPatients(patientsData);
      setFilteredPatients(patientsData);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array means this function is stable and doesn't recreate

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        // --- CORE FIX: Get user from localStorage for consistency ---
        const userString = localStorage.getItem('app_user');
        if (!userString) {
          setHasPermission(false);
          setIsLoading(false);
          console.error("No user found in session.");
          return;
        }
        const user = JSON.parse(userString);
        setCurrentUser(user);

        const permission = await checkPermission(user, 'view_patients');
        setHasPermission(permission);

        if (!permission) {
          setIsLoading(false);
          return;
        }

        if (!user.agency_id) {
          console.error("User has permission but no agency_id.");
          setHasPermission(false); // Can't view patients without an agency
          setIsLoading(false);
          return;
        }

        await fetchPatientsForCurrentUserAgency(user);

      } catch (error) {
        console.error("Initialization error:", error);
        setHasPermission(false);
        setIsLoading(false); // Ensure loading state is reset even on init error
      }
    };
    initialize();
  }, [fetchPatientsForCurrentUserAgency]); // Depend on fetchPatientsForCurrentUserAgency

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = allPatients.filter(p =>
      `${p.first_name} ${p.last_name}`.toLowerCase().includes(lowercasedTerm) ||
      p.email?.toLowerCase().includes(lowercasedTerm) ||
      p.phone?.includes(lowercasedTerm)
    );
    setFilteredPatients(results);
    setCurrentPage(1);
  }, [searchTerm, allPatients]);

  const handlePatientAdded = (newPatient) => {
    // Add new patient to the beginning and update both lists
    const updatedPatients = [newPatient, ...allPatients];
    setAllPatients(updatedPatients);
    setFilteredPatients(updatedPatients); // Ensure filtered list also gets updated
    setIsAddDialogOpen(false);
  };

  const handleViewPatient = (patientId) => {
    console.log(`Viewing patient with ID: ${patientId}`);
    // TODO: Navigate to patient details page or open modal
    navigate(createPageUrl('patient_detail', { patientId: patientId }));
  };

  const handleEditPatient = (patientId) => {
    console.log(`Editing patient with ID: ${patientId}`);
    // TODO: Open edit patient dialog
    // For now, let's just navigate to a placeholder edit page
    navigate(createPageUrl('patient_edit', { patientId: patientId }));
  };

  const handleDeletePatient = async (patientId) => {
    if (!currentUser) {
      console.error("Cannot delete patient: current user not found.");
      return;
    }
    try {
      await Patient.delete(patientId);
      console.log(`Patient with ID: ${patientId} deleted successfully.`);
      await logAuditEvent(currentUser, 'delete_patient', 'Patient', patientId);
      // Refresh the patient list after deletion
      await fetchPatientsForCurrentUserAgency(currentUser);
    } catch (error) {
      console.error("Failed to delete patient:", error);
      // Optionally display an error message to the user
    }
  };

  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array(ITEMS_PER_PAGE).fill(0).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {renderLoadingSkeleton()}
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to view this page. Please contact your administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <AddPatientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onPatientAdded={handlePatientAdded}
        currentUser={currentUser}
      />
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <HeartHandshake className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
              <p className="text-gray-600">Manage your agency's patient records.</p>
            </div>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Patient
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Patient Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onView={handleViewPatient}
              onEdit={handleEditPatient}
              onDelete={handleDeletePatient}
            />
          ))}
        </div>

        {filteredPatients.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <HeartHandshake className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search." : "Get started by adding a new patient."}
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredPatients.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredPatients.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </>
  );
}

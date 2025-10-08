
import React, { useState, useEffect, useCallback } from "react";
import { Patient } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Mail,
  Phone,
  Edit,
  Eye,
  Trash2,
  HeartHandshake,
  Users as UsersIcon,
  Activity,
  UserPlus as NewUser,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import PatientCard from "../components/patients/PatientCard";
import AddPatientDialog from "../components/patients/AddPatientDialog";
import Pagination from "../components/shared/Pagination";

const ITEMS_PER_PAGE = 9;

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("cards");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const userString = localStorage.getItem('app_user');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        setIsLoading(false);
      }
    };
    loadCurrentUser();
  }, []);

  const loadPatients = useCallback(async () => {
    if (!currentUser?.agency_id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await Patient.filter({ agency_id: currentUser.agency_id }, "-created_date");
      setPatients(data || []);
    } catch (error) {
      console.error("Error loading patients:", error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadPatients();
    }
  }, [currentUser, loadPatients]);

  const filterPatients = useCallback(() => {
    let filtered = patients;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredPatients(filtered);
  }, [patients, searchTerm, statusFilter]);

  useEffect(() => {
    filterPatients();
  }, [filterPatients]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleAddPatient = async (patientData) => {
    if (!currentUser?.agency_id) return;
    try {
      const dataToCreate = { ...patientData, agency_id: currentUser.agency_id };
      await Patient.create(dataToCreate);
      setIsAddDialogOpen(false);
      loadPatients();
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  };

  const handleDeletePatient = async (patientId) => {
    try {
      await Patient.delete(patientId);
      loadPatients();
    } catch (error) {
      console.error("Failed to delete patient:", error);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  const statusColors = {
    active: "bg-green-50 text-green-700 border-green-200",
    inactive: "bg-gray-50 text-gray-700 border-gray-200",
    discharged: "bg-red-50 text-red-700 border-red-200",
  };
  
  const careLevelColors = {
      companion: "bg-blue-100 text-blue-800",
      personal_care: "bg-purple-100 text-purple-800",
      skilled_nursing: "bg-red-100 text-red-800",
      respite: "bg-yellow-100 text-yellow-800",
  };

  if (isLoading && !currentUser) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Modern Header with Gradient */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 mb-8 shadow-2xl"
      >
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
              <HeartHandshake className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Patient Management</h1>
              <p className="text-blue-100 mt-1">Manage your patients, view details, and track their care</p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all"
            size="lg"
            disabled={!currentUser?.agency_id}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Patient
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          { label: 'Total Patients', value: filteredPatients.length, icon: UsersIcon, color: 'from-blue-500 to-blue-600' },
          { label: 'Active', value: filteredPatients.filter(p => p.status === 'active').length, icon: Activity, color: 'from-green-500 to-green-600' },
          { label: 'New This Month', value: filteredPatients.filter(p => {
            const createdDate = new Date(p.created_date);
            const now = new Date();
            return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
          }).length, icon: NewUser, color: 'from-purple-500 to-purple-600' },
          { label: 'Inactive', value: filteredPatients.filter(p => p.status === 'inactive').length, icon: UsersIcon, color: 'from-gray-400 to-gray-500' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Modern Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="lg:w-56 h-12 rounded-xl border-gray-200">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="discharged">Discharged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Modern Results Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Patient Directory ({filteredPatients.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {filteredPatients.length === 0 ? 'No patients found' :
               `Showing ${Math.min(startIndex + 1, filteredPatients.length)} to ${Math.min(endIndex, filteredPatients.length)} of ${filteredPatients.length} patients`}
            </p>
          </div>
          <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1 shadow-sm">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="rounded-lg"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-md"
            >
              <List className="w-4 h-4 mr-2" />
              Table
            </Button>
          </div>
        </div>

        <div className="p-4">
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPatients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} onUpdate={loadPatients} />
              ))}
              {currentPatients.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No patients found</p>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold">Care Level</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{patient.first_name} {patient.last_name}</td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span>{patient.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                <span>{patient.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                             <Badge className={`${careLevelColors[patient.care_level]} capitalize`} variant="outline">
                                {patient.care_level?.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${statusColors[patient.status]} capitalize`} variant="outline">
                              {patient.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the patient record for "{patient.first_name} {patient.last_name}". This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeletePatient(patient.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {currentPatients.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-500">
                            No patients found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPatients.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </motion.div>

      <AddPatientDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddPatient}
      />
    </div>
  );
}

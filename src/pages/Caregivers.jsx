
import React, { useState, useEffect } from "react";
import { Caregiver } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Phone,
  Mail,
  Edit,
  Eye,
  Trash2,
  Users
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import CaregiverCard from "../components/caregivers/CaregiverCard";
import AddCaregiverDialog from "../components/caregivers/AddCaregiverDialog";
import Pagination from "../components/shared/Pagination";

const ITEMS_PER_PAGE = 10;

export default function Caregivers() {
  const [caregivers, setCaregivers] = useState([]);
  const [filteredCaregivers, setFilteredCaregivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [specializationFilter, setSpecializationFilter] = useState("All Specializations");
  const [backgroundFilter, setBackgroundFilter] = useState("All Status");
  const [viewMode, setViewMode] = useState("cards");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // --- CORE FIX: Get user from localStorage for consistency ---
    const loadInitialData = async () => {
      try {
        const userString = localStorage.getItem('app_user');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        } else {
          setIsLoading(false); // If no user found, stop loading
        }
      } catch (error) {
        console.error("Failed to load user from session:", error);
        setIsLoading(false); // Ensure loading is false even if user fails to load
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadCaregivers();
    }
  }, [currentUser]);

  useEffect(() => {
    filterCaregivers();
  }, [caregivers, searchTerm, statusFilter, specializationFilter, backgroundFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, specializationFilter, backgroundFilter]);

  const loadCaregivers = async () => {
    if (!currentUser?.agency_id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await Caregiver.filter({ agency_id: currentUser.agency_id }, "-created_date");
      setCaregivers(data);
    } catch (error) {
      console.error("Error loading caregivers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCaregivers = () => {
    let filtered = caregivers;

    if (searchTerm) {
      filtered = filtered.filter(caregiver =>
        `${caregiver.first_name} ${caregiver.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caregiver.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caregiver.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== "All Statuses") {
      filtered = filtered.filter(caregiver => caregiver.status === statusFilter);
    }

    if (specializationFilter !== "All Specializations") {
      filtered = filtered.filter(caregiver => caregiver.specialization === specializationFilter);
    }

    if (backgroundFilter !== "All Status") {
      filtered = filtered.filter(caregiver => caregiver.background_check_status === backgroundFilter);
    }

    setFilteredCaregivers(filtered);
  };

  const handleAddCaregiver = async (caregiverData) => {
    if (!currentUser?.agency_id) {
      console.error("Cannot add caregiver: no agency ID.");
      return;
    }
    const dataToCreate = { ...caregiverData, agency_id: currentUser.agency_id };
    await Caregiver.create(dataToCreate);
    setIsAddDialogOpen(false);
    loadCaregivers();
  };

  const handleViewCaregiver = (caregiverId) => {
    console.log(`Viewing caregiver with ID: ${caregiverId}`);
  };

  const handleEditCaregiver = (caregiverId) => {
    console.log(`Editing caregiver with ID: ${caregiverId}`);
  };

  const handleDeleteCaregiver = async (caregiverId) => {
    try {
      await Caregiver.delete(caregiverId);
      loadCaregivers();
    } catch (error) {
      console.error("Error deleting caregiver:", error);
    }
  };

  const totalPages = Math.ceil(filteredCaregivers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCaregivers = filteredCaregivers.slice(startIndex, endIndex);

  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pending_approval: "bg-blue-100 text-blue-800 border-blue-200"
  };

  const backgroundColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    in_progress: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    failed: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Caregiver Onboarding</h1>
          <p className="text-gray-600 mt-1">Manage caregiver applications, certifications, and qualification processes.</p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!currentUser?.agency_id}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Caregiver
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-gray-900 mb-4">Search Caregivers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Name, license, specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Statuses">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending_approval">Pending Approval</SelectItem>
            </SelectContent>
          </Select>
          <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Specialization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Specializations">All Specializations</SelectItem>
              <SelectItem value="companion_care">Companion Care</SelectItem>
              <SelectItem value="personal_care">Personal Care</SelectItem>
              <SelectItem value="skilled_nursing">Skilled Nursing</SelectItem>
              <SelectItem value="physical_therapy">Physical Therapy</SelectItem>
              <SelectItem value="occupational_therapy">Occupational Therapy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={backgroundFilter} onValueChange={setBackgroundFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Background Check" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Section */}
      <div className="border border-gray-200 rounded-lg bg-white">
        {/* Header with View Toggle */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="font-medium text-gray-900">
              Caregiver Directory ({filteredCaregivers.length})
            </h3>
            <p className="text-sm text-gray-500">
              {filteredCaregivers.length === 0 ? 'No caregivers found' :
               `Showing ${Math.min(startIndex + 1, filteredCaregivers.length)} to ${Math.min(endIndex, filteredCaregivers.length)} of ${filteredCaregivers.length} caregivers`}
            </p>
          </div>
          <div className="flex rounded-lg border bg-gray-50 p-1">
            <Button
              variant={viewMode === "cards" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="rounded-md"
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

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">Loading caregivers...</p>
            </div>
          ) : filteredCaregivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium mb-2">No caregivers registered yet</p>
              <p className="text-gray-500 mb-4">Start building your caregiver team by adding applications.</p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!currentUser?.agency_id}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Caregiver
              </Button>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
              {currentCaregivers.map((caregiver) => (
                <CaregiverCard
                  key={caregiver.id}
                  caregiver={caregiver}
                  statusColors={statusColors}
                  backgroundColors={backgroundColors}
                  onView={handleViewCaregiver}
                  onEdit={handleEditCaregiver}
                  onDelete={handleDeleteCaregiver}
                />
              ))}
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
                        <th className="text-left py-3 px-4 font-semibold">Specialization</th>
                        <th className="text-left py-3 px-4 font-semibold">Background Check</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentCaregivers.map((caregiver) => (
                        <tr key={caregiver.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{caregiver.first_name} {caregiver.last_name}</td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3 h-3" />
                                {caregiver.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3 h-3" />
                                {caregiver.phone}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                            {caregiver.specialization?.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={backgroundColors[caregiver.background_check_status]} variant="outline">
                              {caregiver.background_check_status?.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[caregiver.status]} variant="outline">
                              {caregiver.status?.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewCaregiver(caregiver.id)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCaregiver(caregiver.id)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteCaregiver(caregiver.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCaregivers.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <AddCaregiverDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddCaregiver}
      />
    </div>
  );
}

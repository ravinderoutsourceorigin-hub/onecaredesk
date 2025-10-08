
import React, { useState, useEffect, useCallback } from "react";
import { Lead } from "@/api/entities";
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
  Phone,
  Mail,
  Edit,
  Eye,
  Trash2,
  TrendingUp,
  Users as UsersIcon,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
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

import LeadCard from "../components/leads/LeadCard";
import AddLeadDialog from "../components/leads/AddLeadDialog";
import Pagination from "../components/shared/Pagination";
import LeadDetailsDialog from "../components/leads/LeadDetailsDialog";

const ITEMS_PER_PAGE = 10;

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [viewMode, setViewMode] = useState("cards");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // --- CORE FIX: Get user from localStorage for consistency ---
    const loadCurrentUser = async () => {
      try {
        const userString = localStorage.getItem('app_user');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
        } else {
          // If no user in localStorage, nothing to load, stop loading indicator
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to load user from session:", error);
        // In case of error parsing or reading localStorage, stop loading
        setIsLoading(false);
      }
    };
    loadCurrentUser();
  }, []);

  const loadLeads = useCallback(async () => {
    if (!currentUser?.agency_id) { // Don't load if no agency ID is available for the current user
      console.warn("Cannot load leads: No agency ID found for current user.");
      setIsLoading(false); // Ensure loading state is reset even if no leads are loaded
      return;
    }
    try {
      setIsLoading(true);
      // CORE MULTI-TENANCY CHANGE: Filter leads by the current user's agency_id
      const data = await Lead.filter({ agency_id: currentUser.agency_id }, "-created_date");
      setLeads(data || []);
    } catch (error) {
      console.error("Error loading leads:", error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]); // Depend on currentUser to re-create if user changes

  const filterLeads = useCallback(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== "All Status") {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter]);

  useEffect(() => {
    // Only load leads after we have the current user's info
    if (currentUser) {
      loadLeads();
    } else if (currentUser === null) {
      // If currentUser is explicitly null (meaning user data was checked and not found),
      // we should not continue loading and ensure isLoading is false.
      // This covers the case where localStorage might be empty or invalid.
      setIsLoading(false);
    }
  }, [currentUser, loadLeads]); // Depend on currentUser and the memoized loadLeads function

  useEffect(() => {
    filterLeads();
  }, [filterLeads]); // Depend on the memoized filterLeads function

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleAddLead = async (leadData) => {
    if (!currentUser?.agency_id) {
      console.error("Cannot add lead: no agency ID found for current user.");
      return;
    }
    try {
      // CORE MULTI-TENANCY CHANGE: Add agency_id to the new lead
      const dataToCreate = {
        ...leadData,
        agency_id: currentUser.agency_id,
      };
      await Lead.create(dataToCreate);
      setIsAddDialogOpen(false);
      loadLeads();
    } catch (error) {
      console.error("Error adding lead:", error);
    }
  };
  
  const handleDeleteLead = async (leadId) => {
    try {
      await Lead.delete(leadId);
      loadLeads();
    } catch (error) {
      console.error("Failed to delete lead:", error);
    }
  };

  const handleViewLead = (lead) => {
    setSelectedLead(lead);
    setIsDetailsDialogOpen(true);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentLeads = filteredLeads.slice(startIndex, endIndex);

  const statusColors = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
    qualified: "bg-green-50 text-green-700 border-green-200",
    assessment_scheduled: "bg-purple-50 text-purple-700 border-purple-200",
    converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
    closed: "bg-gray-50 text-gray-700 border-gray-200"
  };

  if (isLoading) {
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
              <UsersIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Lead Management</h1>
              <p className="text-blue-100 mt-1">
                {currentUser?.agency_id ? 'Manage and convert your leads' : 'No agency information available'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all"
            size="lg"
            disabled={!currentUser?.agency_id}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Lead
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
          { label: 'Total Leads', value: filteredLeads.length, icon: UsersIcon, color: 'from-blue-500 to-blue-600' },
          { label: 'New Leads', value: filteredLeads.filter(l => l.status === 'new').length, icon: UserPlus, color: 'from-indigo-500 to-indigo-600' },
          { label: 'Qualified', value: filteredLeads.filter(l => l.status === 'qualified').length, icon: TrendingUp, color: 'from-purple-500 to-purple-600' },
          { label: 'Converted', value: filteredLeads.filter(l => l.status === 'converted').length, icon: CheckCircle2, color: 'from-green-500 to-green-600' },
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
              placeholder="Search leads by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="lg:w-56 h-12 rounded-xl border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Status">All Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="assessment_scheduled">Assessment Scheduled</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
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
        {/* Header with View Toggle */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Lead Directory ({filteredLeads.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {filteredLeads.length === 0 ? 'No leads found' :
               `Showing ${Math.min(startIndex + 1, filteredLeads.length)} to ${Math.min(endIndex, filteredLeads.length)} of ${filteredLeads.length} leads`}
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

        {/* Content */}
        <div className="p-4">
          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  statusColors={statusColors}
                  onUpdate={loadLeads}
                  onView={handleViewLead}
                  onDelete={handleDeleteLead}
                />
              ))}
              {currentLeads.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">No leads found</p>
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
                        <th className="text-left py-3 px-4 font-semibold">Source</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-left py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {currentLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{lead.name}</td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3 h-3" />
                                {lead.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3 h-3" />
                                {lead.phone}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 capitalize">
                            {lead.source}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[lead.status]} variant="outline">
                              {lead.status?.replace('_', ' ')}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewLead(lead)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete the lead for "{lead.name}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteLead(lead.id)}
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
                      {currentLeads.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-12 text-gray-500">
                            No leads found
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLeads.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </motion.div>

      <AddLeadDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddLead}
      />
      
      <LeadDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        lead={selectedLead}
        onUpdate={loadLeads}
      />
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { Lead } from "@/api/entities";
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
  Trash2
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
  }, [currentUser]); // Depend on currentUser

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const loadLeads = async () => {
    try {
      setIsLoading(true);
      // Use list method instead of filter
      const response = await Lead.list();
      const data = response.leads || response || [];
      setLeads(data);
    } catch (error) {
      console.error("Error loading leads:", error);
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeads = () => {
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
  };

  const handleAddLead = async (leadData) => {
    try {
      // Backend automatically assigns agency_id from available agencies
      // so we don't need to check currentUser.agency_id for now
      console.log('🚀 Creating lead with data:', leadData);
      await Lead.create(leadData);
      setIsAddDialogOpen(false);
      loadLeads();
      console.log('✅ Lead created successfully');
    } catch (error) {
      console.error("❌ Error adding lead:", error);
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-1">
            {currentUser?.agency_id ? 'Manage leads for your agency' : 'No agency information available. Please check your user session.'}
          </p>
        </div>
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="lg:w-48">
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

      {/* Results Section */}
      <div className="border border-gray-200 rounded-lg bg-white">
        {/* Header with View Toggle */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="font-medium text-gray-900">
              Lead Directory ({filteredLeads.length})
            </h3>
            <p className="text-sm text-gray-500">
              {filteredLeads.length === 0 ? 'No leads found' :
               `Showing ${Math.min(startIndex + 1, filteredLeads.length)} to ${Math.min(endIndex, filteredLeads.length)} of ${filteredLeads.length} leads`}
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
          <div className="border-t border-gray-200 px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLeads.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

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


import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { SignatureRequest } from "@/api/entities";
import { User } from "@/api/entities"; // Keep this import as User might be used elsewhere or for type definitions
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  FileSignature,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Send,
  RotateCw,
  LayoutGrid,
  List,
  Download,
  Trash,
  Loader2,
  TrendingUp // Added Loader2 icon for refresh button
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
import { format } from "date-fns";

import SignatureRequestCard from "../components/signatures/SignatureRequestCard";
import CreateSignatureRequestDialog from "../components/signatures/CreateSignatureRequestDialog";
import Pagination from "../components/shared/Pagination";

const ITEMS_PER_PAGE = 9;

export default function Signatures() {
  const [signatureRequests, setSignatureRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // Set table as default
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        // --- CORE FIX: Get user from localStorage for consistency ---
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

  const loadSignatureRequests = useCallback(async (showLoading = true) => {
    if (!currentUser?.agency_id) {
      if (showLoading) setIsLoading(false);
      return;
    }
    try {
      if (showLoading) setIsLoading(true);
      const data = await SignatureRequest.filter({ agency_id: currentUser.agency_id }, "-created_date");
      setSignatureRequests(data);
    } catch (error) {
      console.error("Error loading signature requests:", error);
      setSignatureRequests([]);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [currentUser]); // currentUser is a dependency

  useEffect(() => {
    if (currentUser) {
      loadSignatureRequests();
    }
  }, [currentUser, loadSignatureRequests]); // loadSignatureRequests is now a stable function

  const filterRequests = useCallback(() => {
    let filtered = signatureRequests;

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.recipients?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.recipients?.[0]?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.document_title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    setFilteredRequests(filtered);
  }, [signatureRequests, searchTerm, statusFilter]); // Dependencies for filterRequests

  useEffect(() => {
    filterRequests();
  }, [filterRequests]); // filterRequests is now a stable function

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleCreateRequest = (requestData) => {
    setIsCreateDialogOpen(false);
    loadSignatureRequests();
  };

  const handleDownloadPdf = async (request) => {
    // This logic is now handled by the card itself for JotForm.
    // This can be a generic handler for other providers or a fallback.
    if (request.signed_document_url) {
      window.open(request.signed_document_url, '_blank');
    } else {
      alert("Signed document is not available yet.");
    }
  };

  const handleBulkDelete = async () => {
    if (!currentUser?.agency_id) return;

    try {
      setIsLoading(true);
      // Delete all signature requests for this agency
      const allRequests = await SignatureRequest.filter({ agency_id: currentUser.agency_id });

      for (const request of allRequests) {
        await SignatureRequest.delete(request.id);
      }

      // Refresh the list
      loadSignatureRequests();

      console.log(`Deleted ${allRequests.length} signature requests`);
    } catch (error) {
      console.error("Error deleting signature requests:", error);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const statusColors = {
    draft: "bg-slate-500 text-white border-slate-500",
    sent: "bg-blue-500 text-white border-blue-500",
    viewed: "bg-amber-500 text-white border-amber-500",
    signed: "bg-emerald-500 text-white border-emerald-500",
    completed: "bg-green-500 text-white border-green-500",
    declined: "bg-red-500 text-white border-red-500",
    expired: "bg-orange-500 text-white border-orange-500"
  };

  const statusCardBg = {
    draft: "bg-slate-50 border-l-slate-500",
    sent: "bg-blue-50 border-l-blue-500",
    viewed: "bg-amber-50 border-l-amber-500",
    signed: "bg-emerald-50 border-l-emerald-500",
    completed: "bg-green-50 border-l-green-500",
    declined: "bg-red-50 border-l-red-500",
    expired: "bg-orange-50 border-l-orange-500"
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'signed':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'declined':
      case 'expired':
        return <XCircle className="w-4 h-4" />;
      case 'viewed':
        return <Eye className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      case 'draft':
        return <RotateCw className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStats = () => {
    const total = signatureRequests.length;
    const pending = signatureRequests.filter(r => ['draft', 'sent', 'viewed'].includes(r.status)).length;
    const completed = signatureRequests.filter(r => ['signed', 'completed'].includes(r.status)).length;
    const declined = signatureRequests.filter(r => ['declined', 'expired'].includes(r.status)).length;

    return { total, pending, completed, declined };
  };

  const getProviderInfo = (provider) => {
    switch (provider) {
      case 'jotform': return { name: 'JotForm Sign', color: 'bg-orange-100 text-orange-800' };
      default: return { name: 'JotForm', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const stats = getStats();

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
            <FileSignature className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">
              E-Signature Requests
            </h1>
            <p className="text-white/90 text-base lg:text-lg">
              Manage and track all electronic signature requests
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Documents", value: stats.total, icon: FileSignature, color: "from-blue-500 to-blue-600" },
          { label: "Pending Signatures", value: stats.pending, icon: Send, color: "from-amber-500 to-amber-600" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "from-green-500 to-green-600" },
          { label: "Expired", value: stats.expired, icon: XCircle, color: "from-red-500 to-red-600" }
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

      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Signature Requests ({filteredRequests.length})</h3>
          <p className="text-sm text-gray-600">Track document signing progress and status</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadSignatureRequests(true)}
            disabled={isLoading}
            className="rounded-xl border-gray-200"
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          {signatureRequests.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 rounded-xl">
                  <Trash className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All E-Sign Requests?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {signatureRequests.length} e-sign requests in your agency. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete All ({signatureRequests.length})
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            disabled={!currentUser?.agency_id}
          >
            <Plus className="w-4 h-4 mr-2" />
            New E-Sign Request
          </Button>
        </div>
      </motion.div>

      {/* Remove old summary cards since we have stats at top */}
      {/* Summary Cards - Only show if there's data */}
      {false && signatureRequests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileSignature className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Issues</p>
                  <p className="text-2xl font-bold">{stats.declined}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6 bg-white rounded-2xl shadow-lg p-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search requests by name, email, or document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 rounded-xl border-gray-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="lg:w-56 h-12 rounded-xl border-gray-200">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="viewed">Viewed</SelectItem>
            <SelectItem value="signed">Signed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              E-Sign Requests ({filteredRequests.length})
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {filteredRequests.length === 0 ? 'No requests found' :
               `Showing ${Math.min(startIndex + 1, filteredRequests.length)} to ${Math.min(endIndex, filteredRequests.length)} of ${filteredRequests.length} requests`}
            </p>
          </div>
          <div className="flex rounded-xl border border-gray-200 bg-gray-50 p-1">
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
              className="rounded-lg"
            >
              <List className="w-4 h-4 mr-2" />
              Table
            </Button>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileSignature className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium mb-2">No e-sign requests found</p>
              <p className="text-gray-500 mb-4">Create your first e-sign request to get started</p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={!currentUser?.agency_id}
              >
                <Plus className="w-4 h-4 mr-2" />
                New E-Sign Request
              </Button>
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentRequests.map((request) => (
                <SignatureRequestCard
                  key={request.id}
                  request={request}
                  statusColors={statusColors}
                  cardBgColor={statusCardBg[request.status]}
                  statusIcon={getStatusIcon(request.status)}
                  onUpdate={loadSignatureRequests}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Document</th>
                    <th className="text-left py-3 px-4 font-semibold">Recipient</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Date Sent</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{request.title}</td>
                      <td className="py-3 px-4">{request.recipients?.[0]?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[request.status]} variant="outline">
                          {request.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {request.sent_date ? format(new Date(request.sent_date), "MMM d, yyyy") : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {request.status === 'completed' && request.signed_document_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadPdf(request)}
                            title="Download Signed PDF"
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <Download className="w-5 h-5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-100 px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRequests.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </motion.div>

      <CreateSignatureRequestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
}

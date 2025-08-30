
import React, { useState, useEffect } from "react";
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
  Loader2 // Added Loader2 icon for refresh button
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
  const [providerFilter, setProviderFilter] = useState("all");
  const [viewMode, setViewMode] = useState("cards");
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

  useEffect(() => {
    if (currentUser) {
      loadSignatureRequests();
    }
  }, [currentUser]);

  useEffect(() => {
    filterRequests();
  }, [signatureRequests, searchTerm, statusFilter, providerFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, providerFilter]);

  const loadSignatureRequests = async (showLoading = true) => {
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
  };

  const filterRequests = () => {
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

    if (providerFilter !== "all") {
      filtered = filtered.filter(request => request.provider === providerFilter);
    }

    setFilteredRequests(filtered);
  };

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
      case 'boldsign': return { name: 'BoldSign', color: 'bg-blue-100 text-blue-800' };
      case 'jotform': return { name: 'JotForm Sign', color: 'bg-orange-100 text-orange-800' };
      case 'fillout': return { name: 'Fillout', color: 'bg-purple-100 text-purple-800' };
      case 'hellosign': return { name: 'HelloSign', color: 'bg-green-100 text-green-800' };
      case 'docusign': return { name: 'DocuSign', color: 'bg-indigo-100 text-indigo-800' };
      case 'adobe_sign': return { name: 'Adobe Sign', color: 'bg-red-100 text-red-800' };
      default: return { name: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const stats = getStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">E-Signatures</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => loadSignatureRequests(true)}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RotateCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          {signatureRequests.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  <Trash className="w-4 h-4 mr-2" />
                  Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete All Signature Requests?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {signatureRequests.length} signature requests in your agency. This action cannot be undone.
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
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!currentUser?.agency_id}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Signature Request
          </Button>
        </div>
      </div>

      {/* Summary Cards - Only show if there's data */}
      {signatureRequests.length > 0 && (
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
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search requests by name, email, or document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="lg:w-48">
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
        <Select value={providerFilter} onValueChange={setProviderFilter}>
          <SelectTrigger className="lg:w-48">
            <SelectValue placeholder="Filter by Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="boldsign">BoldSign</SelectItem>
            <SelectItem value="jotform">JotForm Sign</SelectItem>
            <SelectItem value="fillout">Fillout</SelectItem>
            <SelectItem value="hellosign">HelloSign</SelectItem>
            <SelectItem value="docusign">DocuSign</SelectItem>
            <SelectItem value="adobe_sign">Adobe Sign</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Section */}
      <div className="border border-gray-200 rounded-lg bg-white">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div>
            <h3 className="font-medium text-gray-900">
              Signature Requests ({filteredRequests.length})
            </h3>
            <p className="text-sm text-gray-500">
              {filteredRequests.length === 0 ? 'No requests found' :
               `Showing ${Math.min(startIndex + 1, filteredRequests.length)} to ${Math.min(endIndex, filteredRequests.length)} of ${filteredRequests.length} requests`}
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

        <div className="p-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-56 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileSignature className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 font-medium mb-2">No signature requests found</p>
              <p className="text-gray-500 mb-4">Create your first signature request to get started</p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!currentUser?.agency_id}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Signature Request
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
                    <th className="text-left py-3 px-4 font-semibold">Provider</th>
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
                      <td className="py-3 px-4 capitalize">
                        <Badge className={`${getProviderInfo(request.provider).color} text-xs`} >
                            {getProviderInfo(request.provider).name}
                        </Badge>
                      </td>
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
          <div className="border-t border-gray-200 px-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredRequests.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <CreateSignatureRequestDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateRequest}
      />
    </div>
  );
}

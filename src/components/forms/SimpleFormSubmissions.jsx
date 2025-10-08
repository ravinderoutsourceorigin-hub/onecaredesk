
import React, { useState, useEffect, useCallback } from 'react';
import { WebhookCall } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  RefreshCw, 
  Trash2, 
  Send, 
  Eye, 
  Search,
  Calendar,
  User,
  Hash,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { format } from 'date-fns';
import { resendFormEmail } from '@/api/functions';
import Pagination from '@/components/shared/Pagination';

const ITEMS_PER_PAGE = 10;

export default function SimpleFormSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingIds, setProcessingIds] = new useState(new Set());
  const [selectedPayload, setSelectedPayload] = useState(null);
  const [isPayloadDialogOpen, setIsPayloadDialogOpen] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem('app_user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  const loadSubmissions = useCallback(async () => {
    // DEBUG: Log current user info
    console.log('🔍 SimpleFormSubmissions - Current user:', currentUser);
    console.log('🔍 SimpleFormSubmissions - Agency ID:', currentUser?.agency_id);
    
    if (!currentUser?.agency_id) {
        console.warn('❌ No agency_id found for current user, skipping data load');
        setIsLoading(false);
        return;
    }
    
    try {
      setIsLoading(true);
      console.log('🔍 Filtering WebhookCall by agency_id:', currentUser.agency_id);
      
      // Try getting all webhook calls first to debug
      const allCalls = await WebhookCall.list('-created_date', 50);
      console.log('🔍 All webhook calls:', allCalls.length, allCalls.map(c => ({ id: c.id, agency_id: c.agency_id, webhook_type: c.webhook_type })));
      
      // Then filter by agency
      const calls = await WebhookCall.filter({ agency_id: currentUser.agency_id }, '-created_date', 100);
      console.log('🔍 Filtered webhook calls for agency:', calls.length, calls);
      
      setSubmissions(calls || []);
    } catch (error) {
      console.error('❌ Error loading submissions:', error);
      setSubmissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  useEffect(() => {
    let filtered = submissions;

    if (searchTerm) {
      filtered = filtered.filter(submission => {
        const bodyData = submission.body_data || '';
        const searchLower = searchTerm.toLowerCase();
        try {
          const parsedBody = JSON.parse(bodyData);
          const stringifiedBody = JSON.stringify(parsedBody).toLowerCase();
          return stringifiedBody.includes(searchLower);
        } catch {
          return bodyData.toLowerCase().includes(searchLower);
        }
      });
    }

    setFilteredSubmissions(filtered);
    setCurrentPage(1);
  }, [submissions, searchTerm]);

  const getSubmissionData = (submission) => {
    try {
      const bodyData = JSON.parse(submission.body_data || '{}');
      return {
        formID: bodyData.formID || bodyData.form_id || 'N/A',
        submissionID: bodyData.submissionID || bodyData.submission_id || 'N/A',
        email: bodyData.email || 'N/A',
        emailResult: bodyData._email_processing_result,
        allData: bodyData
      };
    } catch {
      return {
        formID: 'Parse error',
        submissionID: 'Parse error',
        email: 'Parse error',
        emailResult: null,
        allData: {}
      };
    }
  };

  const getStatusBadge = (submission) => {
    const data = getSubmissionData(submission);
    
    if (submission.error_details) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Error
        </Badge>
      );
    }
    
    if (data.emailResult?.status === 'success') {
      return (
        <Badge className="flex items-center gap-1 bg-green-600 text-white">
          <CheckCircle className="w-3 h-3" />
          Sent
        </Badge>
      );
    }
    
    if (data.emailResult?.status === 'failed') {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <X className="w-3 h-3" />
          Failed
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary">
        Processed
      </Badge>
    );
  };

  const handleResendEmail = async (submission) => {
    const submissionId = submission.id;
    setProcessingIds(prev => new Set([...prev, submissionId]));
    
    try {
      const data = getSubmissionData(submission);
      const response = await resendFormEmail({
        webhookCallId: submissionId,
        recipientEmail: data.email
      });
      
      if (response.data.success) {
        setMessage({ text: 'Email sent successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        loadSubmissions();
      } else {
        setMessage({ text: response.data.error || 'Failed to send email', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      }
    } catch (error) {
      setMessage({ text: 'Error sending email: ' + error.message, type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  const handleDeleteSubmission = async (submission) => {
    const submissionId = submission.id;
    setProcessingIds(prev => new Set([...prev, submissionId]));
    
    try {
      await WebhookCall.delete(submissionId);
      setMessage({ text: 'Submission deleted successfully', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      loadSubmissions();
    } catch (error) {
      setMessage({ text: 'Error deleting submission: ' + error.message, type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(submissionId);
        return newSet;
      });
    }
  };

  const handleViewPayload = (submission) => {
    const data = getSubmissionData(submission);
    setSelectedPayload({
      submission,
      data: data.allData,
      formatted: JSON.stringify(data.allData, null, 2)
    });
    setIsPayloadDialogOpen(true);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSubmissions = filteredSubmissions.slice(startIndex, endIndex);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Add Debug Info at the top */}
      {currentUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <strong>Debug Info:</strong>
          <br />Current User: {currentUser.email}
          <br />Agency ID: {currentUser.agency_id || 'NOT SET'}
          <br />Submissions Found: {submissions.length}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Form Submissions</h1>
            <p className="text-gray-600">Recent form submissions from your website</p>
          </div>
        </div>
        
        <Button onClick={loadSubmissions} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Messages */}
      {message.text && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by form ID, email, submission ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions ({filteredSubmissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : currentSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">No form submissions found</p>
              <p className="text-gray-500">Submit a form or adjust your search to see results</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form & Submission</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentSubmissions.map((submission) => {
                    const data = getSubmissionData(submission);
                    const isProcessing = processingIds.has(submission.id);
                    
                    return (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Hash className="w-3 h-3 text-gray-400" />
                              <span className="font-mono">Form: {data.formID}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>ID: {data.submissionID}</span>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{data.email}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {getStatusBadge(submission)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(submission.created_date), 'MMM d, HH:mm')}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewPayload(submission)}
                              title="View Payload"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleResendEmail(submission)}
                              disabled={isProcessing}
                              title="Resend Email"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={isProcessing}
                                  title="Delete Submission"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Submission</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this form submission? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteSubmission(submission)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredSubmissions.length}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Payload Dialog */}
      <Dialog open={isPayloadDialogOpen} onOpenChange={setIsPayloadDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Form Submission Data</DialogTitle>
          </DialogHeader>
          
          {selectedPayload && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Form ID:</strong> {getSubmissionData(selectedPayload.submission).formID}
                </div>
                <div>
                  <strong>Submission ID:</strong> {getSubmissionData(selectedPayload.submission).submissionID}
                </div>
                <div>
                  <strong>Email:</strong> {getSubmissionData(selectedPayload.submission).email}
                </div>
                <div>
                  <strong>Date:</strong> {format(new Date(selectedPayload.submission.created_date), 'PPP p')}
                </div>
              </div>
              
              <div>
                <strong className="text-sm">Raw Payload:</strong>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-96 border">
                  {selectedPayload.formatted}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


import React, { useState, useEffect, useCallback } from 'react';
import { WebhookCall } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  RefreshCw, 
  Trash2, 
  AlertCircle,
  Clock,
  Server,
  Code
} from 'lucide-react';
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
import { formatDistanceToNow } from 'date-fns';

export default function GenericFormDebugPanel() {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const loadSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await WebhookCall.filter({ webhook_type: 'generic_form_submission' }, '-created_date', 50);
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error loading form submissions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleDeleteAll = async () => {
    setIsLoading(true);
    try {
      const allSubmissions = await WebhookCall.filter({ webhook_type: 'generic_form_submission' });
      for (const sub of allSubmissions) {
        await WebhookCall.delete(sub.id);
      }
      loadSubmissions();
    } catch (error) {
      console.error("Error deleting submissions:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const parseBodyData = (bodyString) => {
    try {
      return JSON.parse(bodyString);
    } catch (e) {
      return { parsingError: "Could not parse body data.", raw: bodyString };
    }
  };

  return (
    <div className="flex gap-6">
      <div className="w-1/3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Submissions ({submissions.length})</h3>
          <div className="flex gap-2">
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={submissions.length === 0}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will delete all {submissions.length} submission logs. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAll} className="bg-red-600 hover:bg-red-700">Delete All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" size="sm" onClick={loadSubmissions} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? (
            <p>Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <p className="text-gray-500 text-sm">No submissions recorded yet.</p>
          ) : (
            submissions.map(sub => {
              const body = parseBodyData(sub.body_data);
              const emailResult = body._email_processing_result;

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubmission(sub)}
                  className={`p-3 rounded-lg border cursor-pointer ${selectedSubmission?.id === sub.id ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm truncate">
                      {body.submissionID || body.submission_id || 'Unknown Submission'}
                    </p>
                    <Badge variant={emailResult?.status === 'success' ? 'default' : 'destructive'} className="capitalize">
                      {emailResult?.status || 'Unknown'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(sub.created_date), { addSuffix: true })}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="w-2/3 border-l pl-6">
        <h3 className="font-semibold mb-4">Submission Details</h3>
        {selectedSubmission ? (
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            <Card>
              <CardHeader className="bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                   <Server className="w-5 h-5 text-gray-600"/>
                   <h4 className="font-semibold">Processing Summary</h4>
                </div>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div><strong>Status:</strong> {parseBodyData(selectedSubmission.body_data)._email_processing_result?.status}</div>
                <div><strong>Source IP:</strong> {selectedSubmission.source_ip}</div>
                <div><strong>Timestamp:</strong> {new Date(selectedSubmission.created_date).toLocaleString()}</div>
                <div><strong>Time Taken:</strong> {selectedSubmission.processing_time_ms}ms</div>
                {parseBodyData(selectedSubmission.body_data)._email_processing_result?.details && (
                  <div className="col-span-2">
                    <strong>Details:</strong> 
                    <p className="text-xs bg-red-50 text-red-700 p-2 rounded mt-1">{parseBodyData(selectedSubmission.body_data)._email_processing_result.details}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
                <CardHeader className="bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                        <Code className="w-5 h-5 text-gray-600"/>
                        <h4 className="font-semibold">Request Payload</h4>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <pre className="text-xs bg-white p-4 rounded-b-lg overflow-x-auto">
                        {JSON.stringify(parseBodyData(selectedSubmission.body_data), null, 2)}
                    </pre>
                </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <p>Select a submission from the left to see details.</p>
          </div>
        )}
      </div>
    </div>
  );
}

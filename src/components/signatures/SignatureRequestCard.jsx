import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  FileText,
  Clock,
  FileSignature,
  Users,
  Download,
  RefreshCw,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { jotFormAPI } from "@/api/functions"; // Import backend function directly
import { SignatureRequest } from "@/api/entities";

export default function SignatureRequestCard({
  request,
  statusColors,
  cardBgColor,
  statusIcon,
  onUpdate
}) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const handleSyncJotForm = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    setIsSyncing(true);
    setSyncError(null);
    try {
      if (!request.external_request_id) {
        throw new Error("Missing JotForm Form ID.");
      }
      
      const { data, error } = await jotFormAPI({
          action: 'getSubmissions',
          formId: request.external_request_id
      });
      
      if(error) {
        throw new Error(error.error || 'JotForm sync failed');
      }

      const { submissions } = data;
      
      if (submissions && submissions.length > 0) {
        const latestSubmission = submissions[0];
        
        if (latestSubmission.status === 'ACTIVE') {
          const pdfAnswer = Object.values(latestSubmission.answers).find(ans => ans.type === 'control_pdf' && ans.answer);
          const pdfUrl = pdfAnswer ? pdfAnswer.answer : `https://www.jotform.com/pdf-submission/${latestSubmission.id}`;

          await SignatureRequest.update(request.id, {
            status: "completed",
            signed_date: latestSubmission.created_at,
            signed_document_url: pdfUrl,
            webhook_data: latestSubmission
          });
          onUpdate();
        } else {
           alert("Signature is still pending on JotForm.");
        }
      } else {
        alert("No submissions found for this request on JotForm yet.");
      }

    } catch (error) {
      console.error("JotForm sync failed:", error);
      setSyncError(error.message);
      alert(`Sync Failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const getProviderInfo = (provider) => {
    const providers = {
      boldsign: {
        name: "BoldSign",
        color: "bg-blue-500 text-white",
        icon: <FileSignature className="w-3 h-3" />
      },
      hellosign: {
        name: "HelloSign",
        color: "bg-orange-500 text-white",
        icon: <FileSignature className="w-3 h-3" />
      },
      docusign: {
        name: "DocuSign",
        color: "bg-indigo-500 text-white",
        icon: <FileSignature className="w-3 h-3" />
      },
      goformz: {
          name: "GoFormz",
          color: "bg-purple-500 text-white",
          icon: <FileSignature className="w-3 h-3" />
      },
      adobe_sign: {
        name: "Adobe Sign",
        color: "bg-red-500 text-white",
        icon: <FileSignature className="w-3 h-3" />
      },
      jotform: {
        name: "JotForm Sign",
        color: "bg-yellow-500 text-white",
        icon: <FileSignature className="w-3 h-3" />
      }
    };
    return providers[provider] || { name: provider.charAt(0).toUpperCase() + provider.slice(1), color: "bg-gray-500 text-white", icon: <FileSignature className="w-3 h-3" /> };
  };

  const providerInfo = getProviderInfo(request.provider);
  const firstRecipient = request.recipients?.[0];

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 border-l-4 ${cardBgColor}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate" title={request.title}>{request.title}</h3>
              <p className="text-sm text-gray-600 truncate" title={request.document_title}>{request.document_title}</p>
            </div>
          </div>
          <Badge className={statusColors[request.status]} variant="outline">
            <span className="flex items-center gap-1">
              {statusIcon}
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={providerInfo.color}>
              <span className="flex items-center gap-1">
                {providerInfo.icon}
                {providerInfo.name}
              </span>
            </Badge>
            
            {request.provider === 'jotform' && request.status !== 'completed' && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={handleSyncJotForm}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="w-3 h-3 mr-1" />
                )}
                Sync Status
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm truncate">{firstRecipient?.name || 'No recipient'}</p>
              <p className="text-xs text-gray-500 truncate">
                {request.recipients?.length > 1 ? `+ ${request.recipients.length - 1} more` : firstRecipient?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {request.sent_date ? 'Sent' : 'Created'}
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(request.sent_date || request.created_date), 'MMM d, yyyy')}
              </p>
            </div>
          </div>

          {request.signed_date && (
            <div className="text-xs text-gray-500 pt-2 border-t">
              <span className="text-green-600 font-medium">
                Signed: {format(new Date(request.signed_date), 'MMM d, yyyy')}
              </span>
            </div>
          )}

          {request.expires_date && !['signed', 'completed'].includes(request.status) && (
            <div className="text-xs text-gray-500 pt-2 border-t">
              <span className="text-orange-600 font-medium">
                Expires: {format(new Date(request.expires_date), 'MMM d, yyyy')}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t">
          {request.status === 'completed' && request.signed_document_url ? (
            <a
              href={request.signed_document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                View Signed Document
              </Button>
            </a>
          ) : (
             <p className="text-xs text-gray-500 text-center">Document not yet completed.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from "react";
import { SignatureRequest } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSignature, Users, Clock, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const ITEMS_PER_PAGE = 3;

export default function PendingSignatures() {
  const [signatures, setSignatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadPendingSignatures();
  }, []);

  const loadPendingSignatures = async () => {
    try {
      const allRequests = await SignatureRequest.list("-created_date", 50);
      const pending = allRequests.filter(req => ['draft', 'sent', 'viewed'].includes(req.status));
      setSignatures(pending);
    } catch (error) {
      console.error("Error loading pending signatures:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return '';
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(signatures.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSignatures = signatures.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (isLoading) {
    return (
      <Card className="h-[400px] flex flex-col">
        <CardHeader className="bg-green-50 border-b p-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-green-700 text-base font-semibold">
            <FileSignature className="w-4 h-4" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow flex flex-col">
          <div className="flex-grow divide-y">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="p-4">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="bg-green-50 border-b p-4 flex-shrink-0">
        <CardTitle className="flex items-center justify-between text-green-700 text-base font-semibold">
          <div className="flex items-center gap-2">
            <FileSignature className="w-4 h-4" />
            Pending Signatures
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal">{signatures.length} pending</span>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <span className="text-xs text-gray-500 px-1">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col">
        <div className="flex-grow divide-y min-h-0 overflow-y-auto">
          {currentSignatures.length === 0 ? (
            <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <FileSignature className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-medium mb-1">No pending signatures</p>
              <p className="text-sm mb-4">All signature requests are complete</p>
              <Link to={createPageUrl("Signatures")}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Create Request
                </Button>
              </Link>
            </div>
          ) : (
            currentSignatures.map((sig) => {
              const firstRecipient = sig.recipients?.[0];
              return (
                <div key={sig.id} className="p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Send className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{sig.document_title}</h4>
                        <Badge variant="outline" className="text-xs capitalize bg-yellow-50 text-yellow-700 border-yellow-200">
                          {sig.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                        <Users className="w-3 h-3" />
                        <span className="truncate">{firstRecipient?.name}</span>
                        {sig.recipients?.length > 1 && (
                          <span className="text-gray-500">+ {sig.recipients.length - 1} more</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{sig.provider}</span>
                        {sig.sent_date && (
                          <span>Sent {getTimeAgo(sig.sent_date)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="border-t p-3 bg-gray-50 flex-shrink-0">
          <Link to={createPageUrl("Signatures")}>
            <Button variant="outline" size="sm" className="w-full text-green-600 border-green-200 hover:bg-green-50">
              View All Signatures
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
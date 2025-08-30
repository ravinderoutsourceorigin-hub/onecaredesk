import React, { useState, useEffect } from "react";
import { Caregiver } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 5; // Updated to show more items per page

export default function BackgroundVerifications() {
  const [verifications, setVerifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadBackgroundVerifications();
  }, []);

  const loadBackgroundVerifications = async () => {
    try {
      const allCaregivers = await Caregiver.list("-created_date", 50);
      const pendingVerifications = allCaregivers
        .filter(c => ['pending', 'in_progress'].includes(c.background_check_status))
        .map(c => ({
          id: c.id,
          name: `${c.first_name} ${c.last_name}`,
        }));

      setVerifications(pendingVerifications);
    } catch (error) {
      console.error("Error loading background verifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(verifications.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentVerifications = verifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (isLoading) {
    return (
      <Card className="h-[400px] flex flex-col">
        <CardHeader className="bg-purple-50 border-b p-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-purple-700 text-base font-semibold">
            <Shield className="w-4 h-4" />
            <Skeleton className="h-5 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow flex flex-col">
          <div className="flex-grow divide-y">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-4 flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-4 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="bg-purple-50 border-b p-4 flex-shrink-0">
        <CardTitle className="flex items-center justify-between text-purple-700 text-base font-semibold">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Pending Verifications
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal">{verifications.length} total</span>
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
          {currentVerifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-medium mb-1">All verifications complete</p>
              <p className="text-sm">No background checks pending</p>
            </div>
          ) : (
            currentVerifications.map((verification) => (
              <div key={verification.id} className="p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm truncate">{verification.name}</h4>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
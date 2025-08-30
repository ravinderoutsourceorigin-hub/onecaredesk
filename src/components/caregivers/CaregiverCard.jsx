import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  Eye, 
  Edit, 
  Trash2,
  UserCheck,
  FileSignature
} from "lucide-react";

import CreateSignatureRequestDialog from "../signatures/CreateSignatureRequestDialog";

export default function CaregiverCard({ caregiver, statusColors, backgroundColors, onView, onEdit, onDelete }) {
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${caregiver.first_name} ${caregiver.last_name}? This action cannot be undone.`)) {
      onDelete(caregiver.id);
    }
  };

  return (
    <>
      <Card className="bg-teal-50 hover:shadow-md transition-shadow border border-teal-200 h-full flex flex-col">
        <CardContent className="p-4 flex-grow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-teal-200">
                <UserCheck className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{caregiver.first_name} {caregiver.last_name}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {caregiver.specialization?.replace('_', ' ')}
                </p>
              </div>
            </div>
            <Badge className={statusColors[caregiver.status]} variant="outline">
              {caregiver.status?.replace('_', ' ')}
            </Badge>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{caregiver.email || 'No email'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{caregiver.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Background Check:</span>
              <Badge className={backgroundColors[caregiver.background_check_status]} variant="outline" size="sm">
                {caregiver.background_check_status?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </CardContent>

        {/* Better organized actions with proper spacing */}
        <div className="p-4 mt-auto border-t border-teal-200">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-white hover:bg-teal-100 text-teal-700 border-teal-300"
                onClick={() => onView && onView(caregiver.id)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-white hover:bg-teal-100 text-teal-700 border-teal-300"
                onClick={() => onEdit && onEdit(caregiver.id)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 bg-white hover:bg-teal-100 text-teal-700 border-teal-300"
                onClick={() => setIsSignatureDialogOpen(true)}
              >
                <FileSignature className="w-4 h-4 mr-1" />
                E-Sign
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-red-600 border-red-300 hover:bg-red-50 bg-white"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <CreateSignatureRequestDialog
        open={isSignatureDialogOpen}
        onOpenChange={setIsSignatureDialogOpen}
        entity={caregiver}
        onSubmit={() => { /* Do nothing on submit, dialog closes itself */ }}
      />
    </>
  );
}
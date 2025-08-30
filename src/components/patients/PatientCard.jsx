import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  Eye, 
  Edit, 
  Trash2,
  HeartHandshake
} from "lucide-react";

export default function PatientCard({ patient, onView, onEdit, onDelete }) {
  // Define status colors within the component
  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-yellow-100 text-yellow-800 border-yellow-200",
    discharged: "bg-gray-100 text-gray-800 border-gray-200"
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${patient.first_name} ${patient.last_name}? This action cannot be undone.`)) {
      onDelete && onDelete(patient.id);
    }
  };

  const handleView = () => {
    onView && onView(patient.id);
  };

  const handleEdit = () => {
    onEdit && onEdit(patient.id);
  };

  return (
    <Card className="bg-green-50 hover:shadow-md transition-shadow h-full border border-green-200">
      <CardContent className="p-4 h-full flex flex-col">
        {/* Main content area */}
        <div className="flex-grow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-green-200">
                <HeartHandshake className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{patient.first_name} {patient.last_name}</h3>
                <p className="text-sm text-gray-600 capitalize">
                  {patient.care_level?.replace('_', ' ') || 'N/A'}
                </p>
              </div>
            </div>
            <Badge className={statusColors[patient.status] || statusColors.active} variant="outline">
              {patient.status || 'active'}
            </Badge>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span className="truncate">{patient.email || 'No email'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{patient.phone || 'No phone'}</span>
            </div>
          </div>
        </div>

        {/* Actions - Fixed at bottom with better spacing */}
        <div className="mt-auto pt-3 border-t border-green-200">
          <div className="flex gap-2 mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-white hover:bg-green-100 text-green-700 border-green-300"
              onClick={handleView}
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 bg-white hover:bg-green-100 text-green-700 border-green-300"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-red-600 border-red-300 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
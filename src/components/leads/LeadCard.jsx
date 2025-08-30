import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  Edit,
  Trash2,
  FileSignature,
  ArrowRight,
  Eye
} from "lucide-react";
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

import CreateSignatureRequestDialog from "../signatures/CreateSignatureRequestDialog";

export default function LeadCard({ lead, statusColors, onUpdate, onView, onDelete }) {
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);

  return (
    <>
      <Card className="bg-green-50 border-2 border-green-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          {/* Header - Name and Source Badge */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{lead.name}</h3>
            <Badge 
              variant="outline" 
              className="bg-white border-gray-300 text-gray-600 px-3 py-1 rounded-full text-sm font-medium"
            >
              {lead.source}
            </Badge>
          </div>

          {/* ID */}
          <div className="bg-gray-100/60 inline-block px-3 py-1 rounded-md mb-4">
            <p className="text-gray-600 text-sm font-mono">
              ID: {lead.id.substring(0, 8)}...
            </p>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Email: {lead.email || 'No email provided'}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Phone: {lead.phone}</span>
            </div>
            
            <div className="flex items-center gap-3 text-gray-600">
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm capitalize">Source: {lead.source}</span>
            </div>
          </div>

          {/* Action Buttons - Compact Single Row */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 flex items-center justify-center gap-1.5 bg-white border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              onClick={() => onView(lead)}
            >
              <Eye className="w-3.5 h-3.5" />
              View/Edit
            </Button>
            
            <Button 
              size="sm" 
              className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-700"
              onClick={() => setIsSignatureDialogOpen(true)}
            >
              <FileSignature className="w-3.5 h-3.5" />
              E-sign
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-10 h-8 p-0 flex items-center justify-center bg-white border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
                    onClick={() => onDelete(lead.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <CreateSignatureRequestDialog
        open={isSignatureDialogOpen}
        onOpenChange={setIsSignatureDialogOpen}
        entity={lead}
        onSubmit={onUpdate}
      />
    </>
  );
}
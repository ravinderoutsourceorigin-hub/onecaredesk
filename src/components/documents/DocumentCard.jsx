
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Eye, 
  Trash2, 
  CopyPlus 
} from "lucide-react";
import { format } from "date-fns"; // This import is no longer used but is part of the original code, keeping for minimal change principle if not explicitly removed. However, given the date display is removed, it could be removed. The outline doesn't mention it. I'll remove it as its usage in the component is gone.
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
import { createPageUrl } from "@/utils"; // This import is no longer used as handleEditPDF is removed. I'll remove it.

export default function DocumentCard({ document, statusColors, onConvertToTemplate, onDelete, onPreview }) {
  const handleDelete = () => {
    onDelete(document.id);
  };
  
  // handleDownload and handleEditPDF functions are removed as their corresponding UI elements are no longer present.

  return (
    <Card className="flex flex-col h-full bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden">
      <div className="p-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate" title={document.title}>{document.title}</h3>
              <p className="text-xs text-gray-500 truncate" title={document.file_name}>{document.file_name}</p>
            </div>
          </div>
          {document.is_template ? (
            <Badge className="bg-blue-100 text-blue-800 border-blue-200" variant="outline">Template</Badge>
          ) : (
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">Standard</Badge>
          )}
        </div>

        {/* Metadata & Tags */}
        <div className="flex-1 space-y-2 mb-4">
          <p className="text-sm text-gray-600 capitalize">
            <span className="font-medium text-gray-800">Category:</span> {document.category?.replace('_', ' ')}
          </p>
          <div className="flex flex-wrap gap-1">
            {document.tags?.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                {tag}
              </Badge>
            ))}
            {document.tags?.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="bg-gray-50/70 p-3 border-t flex justify-end gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-gray-500 hover:text-blue-600"
          onClick={() => onPreview(document)}
          title="Preview Document"
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-gray-500 hover:text-green-600"
          onClick={() => onConvertToTemplate(document)}
          title={document.is_template ? "Edit Template Settings" : "Convert to Template"}
        >
          <CopyPlus className="w-4 h-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600" title="Delete Document">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the document "{document.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );
}

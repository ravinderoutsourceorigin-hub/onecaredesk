import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  FileText,
  Clock,
  User
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function ActivityLog({ activities = [], onAddActivity, isActivityFormOpen, setIsActivityFormOpen }) {
  const [newActivity, setNewActivity] = useState("");
  const activityFormRef = React.useRef(null);

  useEffect(() => {
    if (isActivityFormOpen) {
      setNewActivity(""); // Clear any previous text
      // Scroll form into view smoothly
      setTimeout(() => {
        activityFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [isActivityFormOpen]);

  const handleAddNote = async () => {
    if (!newActivity.trim()) return;

    const activityEntry = {
      timestamp: new Date().toISOString(),
      type: 'note',
      action: newActivity.trim(),
      details: {},
      source: 'manual'
    };

    try {
      await onAddActivity(activityEntry);
      setNewActivity("");
      setIsActivityFormOpen(false); // Close form on success
    } catch (error) {
      console.error("Error adding activity:", error);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'phone_call': return <Phone className="w-4 h-4 text-blue-600" />;
      case 'email': return <Mail className="w-4 h-4 text-green-600" />;
      case 'note': return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'status_change': return <FileText className="w-4 h-4 text-orange-600" />;
      case 'lead_updated': return <User className="w-4 h-4 text-indigo-600" />;
      case 'signature_status_change': return <FileText className="w-4 h-4 text-emerald-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityTypeLabel = (type) => {
    const labels = {
      phone_call: "Phone Call",
      email: "Email",
      note: "Note",
      status_change: "Status Change",
      lead_updated: "Lead Updated",
      signature_status_change: "E-Signature Update"
    };
    return labels[type] || "Activity";
  };

  return (
    <div className="space-y-4">
      {/* Add Activity Form - controlled by parent */}
      {isActivityFormOpen && (
        <div ref={activityFormRef} className="space-y-3 p-4 bg-white border border-green-200 rounded-lg">
          <Textarea
            placeholder="Add a note or update about this lead..."
            value={newActivity}
            onChange={(e) => setNewActivity(e.target.value)}
            rows={3}
            className="border-green-300"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsActivityFormOpen(false);
                setNewActivity("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={!newActivity.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Note
            </Button>
          </div>
        </div>
      )}

      {/* Activity List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No activity recorded yet</p>
            <p className="text-xs text-gray-400 mt-1">Add the first note to start tracking interactions</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="flex gap-3 p-3 bg-white border border-green-100 rounded-lg hover:border-green-200 transition-colors">
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                    {getActivityTypeLabel(activity.type)}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-800 break-words">{activity.action}</p>
                {activity.details && Object.keys(activity.details).length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Details: {JSON.stringify(activity.details)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
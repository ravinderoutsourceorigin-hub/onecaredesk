import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Calendar
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

export default function RelatedTasks({ tasks, isLoading }) {

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-blue-100 text-blue-800 border-blue-200"
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-gray-100 text-gray-800 border-gray-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200"
    };
    return colors[status] || colors.pending;
  };

  const isTaskOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    // Compare only dates, ignoring time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  const openTasks = tasks.filter(task => task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tasks List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No tasks assigned yet</p>
            <p className="text-xs text-gray-400 mt-1">Create the first task to track follow-ups</p>
          </div>
        ) : (
          <>
            {/* Open Tasks */}
            {openTasks.map((task) => (
              <div key={task.id} className={`p-3 bg-white border rounded-lg hover:border-orange-200 transition-colors ${
                isTaskOverdue(task.due_date, task.status) ? 'border-red-300 bg-red-50' : 'border-orange-200'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge className={getPriorityColor(task.priority)} variant="outline">
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(task.priority)}
                          <span className="text-xs font-semibold">{task.priority.toUpperCase()}</span>
                        </div>
                      </Badge>
                      <Badge className={getStatusColor(task.status)} variant="outline">
                        {task.status.replace('_', ' ')}
                      </Badge>
                      {isTaskOverdue(task.due_date, task.status) && (
                        <Badge variant="destructive" className="text-xs">OVERDUE</Badge>
                      )}
                    </div>
                    <p className="font-medium text-gray-800">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600 space-y-2 flex-shrink-0">
                     {task.due_date && (
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-medium">
                          {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                        <Calendar className="w-4 h-4" />
                      </div>
                    )}
                    {task.assigned_to && (
                      <div className="flex items-center justify-end gap-2">
                        <span>{task.assigned_to}</span>
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Completed Tasks */}
            {completedTasks.map((task) => (
              <div key={task.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-70">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-500 line-through">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Completed {formatDistanceToNow(new Date(task.updated_date), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
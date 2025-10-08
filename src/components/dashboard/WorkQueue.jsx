import React, { useState, useEffect } from "react";
import { Task } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TaskDetailsDialog from "@/components/dashboard/TaskDetailsDialog";
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";

const ITEMS_PER_PAGE = 3;

export default function WorkQueue() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const userString = localStorage.getItem('app_user');
        if (userString) {
          const user = JSON.parse(userString);
          setCurrentUser(user);
          if (user.agency_id) {
            await loadTasks(user.agency_id);
          } else {
             setIsLoading(false);
          }
        } else {
            setIsLoading(false);
        }
      } catch (error) {
        console.error("Initialization error in WorkQueue:", error);
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const loadTasks = async (agencyId) => {
    try {
      const allTasks = await Task.list();
      const activeTasks = allTasks
        .filter(task => task.agency_id === agencyId && ['pending', 'in_progress'].includes(task.status))
        .sort((a, b) => new Date(a.due_date || '9999') - new Date(b.due_date || '9999'))
        .slice(0, 50); // Limit to 50 results
      setTasks(activeTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 border-blue-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-red-100 text-red-800 border-red-200",
  };

  const getDueDateLabel = (dueDateString) => {
    if (!dueDateString) return null;
    const dueDate = new Date(dueDateString);
    if (isPast(dueDate) && !isToday(dueDate)) return { text: "Overdue", color: "text-red-600 font-medium" };
    if (isToday(dueDate)) return { text: "Due Today", color: "text-orange-600 font-medium" };
    return { text: `Due ${format(dueDate, 'MMM d')}`, color: "text-gray-600" };
  };

  const handleTaskAction = async (taskId, newStatus) => {
    try {
      await Task.update(taskId, { status: newStatus });
      if (currentUser?.agency_id) {
        await loadTasks(currentUser.agency_id);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTasks = tasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  if (isLoading) {
    return (
      <Card className="h-[400px] flex flex-col">
        <CardHeader className="bg-orange-50 border-b p-4 flex-shrink-0">
          <CardTitle className="flex items-center gap-2 text-orange-700 text-base font-semibold">
            <ClipboardList className="w-4 h-4" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex-grow flex flex-col">
          <div className="flex-grow divide-y">
            {Array(ITEMS_PER_PAGE).fill(0).map((_, i) => (
              <div key={i} className="p-3">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-[400px] flex flex-col">
        <CardHeader className="bg-orange-50 border-b p-4 flex-shrink-0">
          <CardTitle className="flex items-center justify-between text-orange-700 text-base font-semibold">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Work Queue / Task List
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal">{tasks.length} active</span>
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
            {currentTasks.length === 0 ? (
              <div className="p-6 text-center text-gray-500 flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <ClipboardList className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium mb-1">All caught up! 🎉</p>
                <p className="text-sm">No pending tasks at the moment</p>
              </div>
            ) : (
              currentTasks.map((task) => {
                const dueDateInfo = getDueDateLabel(task.due_date);
                const isOverdue = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));

                return (
                  <div
                    key={task.id}
                    className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${isOverdue ? 'bg-red-50' : ''}`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{task.title}</h4>
                          <Badge className={`${priorityColors[task.priority]} text-xs`}>
                            {task.priority}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-600">
                            {task.assigned_to && <span>@{task.assigned_to}</span>}
                          </div>
                          {dueDateInfo && (
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className={dueDateInfo.color}>{dueDateInfo.text}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="border-t p-3 bg-gray-50 flex-shrink-0">
            <Button variant="outline" size="sm" className="w-full text-orange-600 border-orange-200 hover:bg-orange-50">
              View All Tasks
            </Button>
          </div>
        </CardContent>
      </Card>

      <TaskDetailsDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={selectedTask}
        onUpdate={
          currentUser?.agency_id ? () => loadTasks(currentUser.agency_id) : () => {}
        }
        onStatusChange={handleTaskAction}
      />
    </>
  );
}
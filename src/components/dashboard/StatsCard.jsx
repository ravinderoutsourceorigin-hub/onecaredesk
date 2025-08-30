import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const colorClasses = {
  blue: "bg-blue-500 text-white",
  green: "bg-green-500 text-white", 
  purple: "bg-purple-500 text-white",
  orange: "bg-orange-500 text-white"
};

export default function StatsCard({ title, value, icon: Icon, color, isLoading }) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className={`${colorClasses[color]} px-4 py-3`}>
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 bg-white/20 rounded" />
              <div className="flex-1">
                <Skeleton className="h-2 w-16 bg-white/20 mb-1" />
                <Skeleton className="h-6 w-8 bg-white/20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className={`${colorClasses[color]} px-4 py-3`}>
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-white flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs font-medium tracking-wide uppercase truncate">
                {title}
              </p>
              <p className="text-xl font-bold text-white">
                {value}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
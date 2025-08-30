
import React, { useState, useEffect } from "react";
import { Lead } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Caregiver } from "@/api/entities";
import { Task } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  HeartHandshake, 
  UserCheck, 
  Calendar,
  ClipboardList,
  FileSignature,
  AlertTriangle,
  TrendingUp,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import StatsCard from "../components/dashboard/StatsCard";
import UpcomingAppointments from "../components/dashboard/UpcomingAppointments";
import WorkQueue from "../components/dashboard/WorkQueue";
import PendingSignatures from "../components/dashboard/PendingSignatures";
import BackgroundVerifications from "../components/dashboard/BackgroundVerifications";
import APITestComponent from "../components/shared/APITestComponent";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    activePatients: 0,
    availableCaregivers: 0,
    pendingTasks: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Get user from localStorage since we're using custom auth now
        const userString = localStorage.getItem('app_user');
        if (!userString) {
          console.error("No user session found");
          return;
        }

        const user = JSON.parse(userString);
        setCurrentUser(user);
        
        console.log("🔍 Dashboard - User details:", {
          email: user.email,
          role: user.role,
          agency_id: user.agency_id,
          temp_password: user.temp_password
        });
        
        // Platform admin dashboard
        if (['admin', 'super_admin'].includes(user.role)) {
          console.log("✅ Platform admin detected - showing admin dashboard");
          setIsLoadingStats(false);
          return;
        }
        
        // Regular agency user - need agency_id
        if (!user.agency_id) {
          console.error("❌ User has no agency_id and is not platform admin.");
          setIsLoadingStats(false); 
          return;
        }
        
        console.log("Loading dashboard for agency:", user.agency_id);
        await loadStats(user.agency_id);
      } catch (error) {
        console.error("Error initializing dashboard:", error);
        setIsLoadingStats(false);
      }
    };
    
    initializeDashboard();
  }, []);

  const loadStats = async (agencyId) => {
    try {
      setIsLoadingStats(true);
      
      const [leads, patients, caregivers, tasks] = await Promise.all([
        Lead.filter({ agency_id: agencyId }),
        Patient.filter({ agency_id: agencyId, status: 'active' }),
        Caregiver.filter({ agency_id: agencyId, status: 'active' }),
        Task.filter({ agency_id: agencyId, status: ['pending', 'in_progress'] })
      ]);

      setStats({
        totalLeads: leads.length,
        activePatients: patients.length,
        availableCaregivers: caregivers.length,
        pendingTasks: tasks.length
      });
    } catch (error) {
      console.error("Error loading dashboard stats:", error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Loading state
  if (!currentUser) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <p>Loading user information...</p>
        </div>
      </div>
    );
  }

  const isPlatformAdmin = ['admin', 'super_admin'].includes(currentUser.role);

  // Platform Admin Dashboard
  if (isPlatformAdmin) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
          <h4 className="font-semibold text-green-800">✅ Platform Admin Dashboard</h4>
          <div className="text-sm text-green-700 mt-2 space-y-1">
            <p><strong>Email:</strong> {currentUser.email}</p>
            <p><strong>Role:</strong> {currentUser.role}</p>
            <p><strong>Status:</strong> ✅ Platform Admin - Properly Configured</p>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Platform Administration</h1>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-2">User Management</h3>
              <p className="text-gray-600 mb-4">Manage all users and create agency accounts</p>
              <Button 
                onClick={() => window.location.href = createPageUrl('UserManagement')}
                className="w-full"
              >
                Manage Users
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
              <h3 className="text-lg font-semibold mb-2">Agency Management</h3>
              <p className="text-gray-600 mb-4">View and manage all agencies on the platform</p>
              <Button 
                onClick={() => window.location.href = createPageUrl('Agencies')}
                className="w-full"
                variant="outline"
              >
                View Agencies
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold mb-2">System Settings</h3>
              <p className="text-gray-600 mb-4">Configure platform-wide settings and integrations</p>
              <Button 
                onClick={() => window.location.href = createPageUrl('Settings')}
                className="w-full"
                variant="outline"
              >
                System Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle cases where user is not a platform admin and has no agency_id
  if (!currentUser.agency_id) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600">Missing Agency Assignment</h1>
          <p className="mt-2 text-gray-600">
            Your account exists but isn't linked to an agency yet. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  // Default Dashboard for agency users
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Overview Stats Section */}
      <fieldset className="border border-gray-200 rounded-lg p-4 mb-6 bg-white">
        <legend className="text-sm font-medium text-gray-700 px-2">Overview</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <StatsCard
            title="TOTAL LEADS"
            value={stats.totalLeads}
            icon={Users}
            color="blue"
            isLoading={isLoadingStats}
          />
          <StatsCard
            title="ACTIVE PATIENTS"
            value={stats.activePatients}
            icon={HeartHandshake}
            color="green"
            isLoading={isLoadingStats}
          />
          <StatsCard
            title="AVAILABLE CAREGIVERS"
            value={stats.availableCaregivers}
            icon={UserCheck}
            color="purple"
            isLoading={isLoadingStats}
          />
          <StatsCard
            title="PENDING TASKS"
            value={stats.pendingTasks}
            icon={ClipboardList}
            color="orange"
            isLoading={isLoadingStats}
          />
        </div>
      </fieldset>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingAppointments />
        <WorkQueue key={stats.pendingTasks} />
        <PendingSignatures />
        <BackgroundVerifications />
      </div>

      {/* API Test Component - Development Only */}
      {import.meta.env.VITE_ENABLE_DEBUG === 'true' && (
        <div className="mt-6">
          <APITestComponent />
        </div>
      )}
    </div>
  );
}

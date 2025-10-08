import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lead, Patient, Caregiver, Task } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, HeartHandshake, UserCheck, Calendar, ClipboardList,
  AlertTriangle, TrendingUp, TrendingDown, Plus, ArrowUpRight,
  Activity, Clock, Building2, Settings as SettingsIcon, 
  UsersIcon, Zap, Target, CheckCircle2, BarChart3, 
  Phone, Star, Award, Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    activePatients: 0,
    availableCaregivers: 0,
    pendingTasks: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const userString = localStorage.getItem('app_user');
        if (!userString) return;

        const user = JSON.parse(userString);
        setCurrentUser(user);
        
        if (['admin', 'super_admin'].includes(user.role)) {
          setIsLoadingStats(false);
          return;
        }
        
        if (!user.agency_id) {
          setIsLoadingStats(false); 
          return;
        }
        
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
      
      const [allLeads, allPatients, allCaregivers, allTasks] = await Promise.all([
        Lead.list(), Patient.list(), Caregiver.list(), Task.list()
      ]);

      const leads = (allLeads || []).filter(lead => lead.agency_id === agencyId);
      const patients = (allPatients || []).filter(patient => patient.agency_id === agencyId && patient.status === 'active');
      const caregivers = (allCaregivers || []).filter(caregiver => caregiver.agency_id === agencyId && caregiver.status === 'active');
      const tasks = (allTasks || []).filter(task => task.agency_id === agencyId && ['pending', 'in_progress'].includes(task.status));

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

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const isPlatformAdmin = ['admin', 'super_admin'].includes(currentUser.role);

  // Platform Admin Dashboard
  if (isPlatformAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Platform Command Center
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                Welcome back, <span className="font-semibold text-gray-900">{currentUser.full_name || currentUser.email}</span>
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Action
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "User Management", description: "Manage all users and permissions", icon: UsersIcon, gradient: "from-blue-500 via-blue-600 to-indigo-600", link: createPageUrl('UserManagement'), stats: "248 users", trend: "+12%" },
              { title: "Agency Control", description: "Monitor and manage agencies", icon: Building2, gradient: "from-emerald-500 via-green-600 to-teal-600", link: createPageUrl('Agencies'), stats: "47 agencies", trend: "+8%" },
              { title: "System Config", description: "Platform settings and integrations", icon: SettingsIcon, gradient: "from-purple-500 via-violet-600 to-purple-600", link: createPageUrl('Settings'), stats: "98% uptime", trend: "Optimal" }
            ].map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Link to={item.link}>
                  <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white">
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <CardContent className="relative p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                          <item.icon className="w-8 h-8 text-white" />
                        </div>
                        <ArrowUpRight className="w-6 h-6 text-gray-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">{item.title}</h3>
                      <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300 mb-4">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">{item.stats}</span>
                        <Badge className={`bg-gradient-to-r ${item.gradient} text-white border-0 group-hover:bg-white group-hover:text-gray-900 transition-all duration-300`}>{item.trend}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
              <CardContent className="relative p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Platform Analytics</h3>
                    <p className="text-white/70">Real-time system overview</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[ 
                    { label: "Total Revenue", value: "$284K", icon: Activity },
                    { label: "Active Users", value: "1,249", icon: Users },
                    { label: "Satisfaction", value: "98.5%", icon: Star },
                    { label: "Response Time", value: "1.2s", icon: Zap }
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <stat.icon className="w-8 h-8 mx-auto mb-2 text-white/70" />
                      <div className="text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-sm text-white/70">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!currentUser.agency_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Agency Not Assigned</h2>
            <p className="text-gray-600">Contact your administrator to get assigned to an agency.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const mainStats = [
    { title: "Total Leads", value: stats.totalLeads, icon: Users, gradient: "from-blue-500 to-cyan-500", iconBg: "bg-blue-500", change: "+12.5%", trend: "up", link: createPageUrl('Leads') },
    { title: "Active Patients", value: stats.activePatients, icon: HeartHandshake, gradient: "from-emerald-500 to-teal-500", iconBg: "bg-emerald-500", change: "+8.2%", trend: "up", link: createPageUrl('Patients') },
    { title: "Caregivers", value: stats.availableCaregivers, icon: UserCheck, gradient: "from-purple-500 to-pink-500", iconBg: "bg-purple-500", change: "+5.1%", trend: "up", link: createPageUrl('Caregivers') },
    { title: "Pending Tasks", value: stats.pendingTasks, icon: ClipboardList, gradient: "from-orange-500 to-red-500", iconBg: "bg-orange-500", change: "-3.4%", trend: "down", link: createPageUrl('Dashboard') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-[1800px] mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold  ">
              Welcome Back! 👋
            </h1>
            <p className="text-gray-600 text-lg">Here's what's happening with your agency today</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
              {['Today', 'Week', 'Month'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedTimeframe(period.toLowerCase())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTimeframe === period.toLowerCase()
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <Link to={createPageUrl('Leads')}>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                New Lead
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {mainStats.map((stat, index) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Link to={stat.link}>
                <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  <CardContent className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                    </div>
                    {isLoadingStats ? (
                      <div className="space-y-3">
                        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">
                          {stat.value}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-600 group-hover:text-white/90 transition-colors duration-300">{stat.title}</p>
                          <div className={`flex items-center gap-1 text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'} group-hover:text-white transition-colors duration-300`}>
                            {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {stat.change}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white overflow-hidden">
              <CardContent className="relative p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[ 
                    { icon: Users, label: "Add Lead", link: createPageUrl('Leads') },
                    { icon: HeartHandshake, label: "New Patient", link: createPageUrl('Patients') },
                    { icon: Calendar, label: "Schedule", link: createPageUrl('Calendar') },
                    { icon: ClipboardList, label: "Documents", link: createPageUrl('Documents') }
                  ].map((action, idx) => (
                    <Link key={idx} to={action.link}>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full p-4 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 border border-white/20">
                        <action.icon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">{action.label}</span>
                      </motion.button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Users, color: "blue", title: "New lead added", description: "John Smith - Home care inquiry", time: "2 hours ago" },
                  { icon: CheckCircle2, color: "green", title: "Assessment completed", description: "Patient Mary Johnson - Initial evaluation", time: "5 hours ago" },
                  { icon: UserCheck, color: "purple", title: "Caregiver assigned", description: "Sarah Williams assigned to patient care", time: "1 day ago" }
                ].map((activity, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + idx * 0.1 }} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer group">
                    <div className={`w-12 h-12 rounded-xl bg-${activity.color}-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                      <activity.icon className={`w-6 h-6 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1">{activity.title}</h4>
                      <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Target className="w-5 h-5 text-purple-600" />
                  Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: "Follow-up call", priority: "high", completed: false },
                  { title: "Review care plan", priority: "medium", completed: true },
                  { title: "Schedule visit", priority: "medium", completed: false },
                  { title: "Update records", priority: "low", completed: false }
                ].map((task, idx) => (
                  <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border-2 ${task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white hover:border-blue-300'} transition-all duration-200 cursor-pointer`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.completed ? 'border-green-600 bg-green-600' : 'border-gray-300'}`}>
                      {task.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`flex-1 text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</span>
                    <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className={`text-xs ${task.priority === 'high' ? 'bg-red-100 text-red-700 border-red-300' : task.priority === 'medium' ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <CardContent className="relative p-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <Phone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Need Help?</h3>
                <p className="text-white/90 text-sm mb-4">Our support team is here 24/7</p>
                <Button className="w-full bg-white text-purple-600 hover:bg-white/90">Contact Support</Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
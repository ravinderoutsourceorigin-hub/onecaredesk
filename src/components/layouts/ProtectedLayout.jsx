
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { createPageUrl } from "@/utils";
import { Agency } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  UserCheck,
  ClipboardList,
  Calendar,
  FileText,
  FileSignature,
  Settings,
  LogOut,
  Menu,
  Building2,
  UserPlus,
  User as UserIcon,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export default function ProtectedLayout({ children, currentPageName }) {
  const { logout } = useKindeAuth();
  const [user, setUser] = useState(null);
  const [agencyInfo, setAgencyInfo] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // 🔍 DEBUG: Log when ProtectedLayout is called
  console.log('🔒 PROTECTED LAYOUT DEBUG - Called with:', {
    currentPageName,
    locationPathname: location.pathname,
    children: !!children
  });

  useEffect(() => {
    const loadUser = async () => {
      console.log('🔍 PROTECTED LAYOUT DEBUG - Starting user load...');
      
      try {
        const userString = localStorage.getItem('app_user');
        
        // 🔍 DEBUG: Log what we find in localStorage
        console.log('🔍 PROTECTED LAYOUT DEBUG - localStorage check:', {
          hasUserString: !!userString,
          userStringLength: userString?.length || 0
        });
        
        if (!userString) {
          console.log('❌ PROTECTED LAYOUT DEBUG - No user in localStorage, redirecting to Auth');
          navigate(createPageUrl('Auth'));
          return;
        }

        const userData = JSON.parse(userString);
        
        // 🔍 DEBUG: Log user data
        console.log('🔍 PROTECTED LAYOUT DEBUG - Parsed user data:', {
          email: userData.email,
          expiresAt: userData.expires_at,
          currentTime: new Date().toISOString(),
          isExpired: new Date() > new Date(userData.expires_at)
        });

        // Check if session expired
        if (new Date() > new Date(userData.expires_at)) {
          console.log('❌ PROTECTED LAYOUT DEBUG - Session expired, clearing and redirecting');
          localStorage.removeItem('app_user');
          navigate(createPageUrl('Auth'));
          return;
        }
        
        console.log('✅ PROTECTED LAYOUT DEBUG - User session valid, setting user');
        setUser(userData);

        // Check if user needs password change
        if (userData.temp_password && currentPageName !== 'ChangePassword') {
          console.log('🔑 PROTECTED LAYOUT DEBUG - User needs password change');
          navigate(createPageUrl('ChangePassword'));
          return;
        }

        if (!userData.temp_password && currentPageName === 'ChangePassword') {
          console.log('🔑 PROTECTED LAYOUT DEBUG - User already changed password, redirecting to dashboard');
          navigate(createPageUrl('Dashboard'));
          return;
        }

        // Load agency info if user has agency_id
        if (userData.agency_id) {
          try {
            const agencyData = await Agency.get(userData.agency_id);
            setAgencyInfo(agencyData);
            console.log('✅ PROTECTED LAYOUT DEBUG - Loaded agency info');
          } catch (agencyError) {
            console.warn("⚠️ PROTECTED LAYOUT DEBUG - Could not load agency info:", agencyError);
            setAgencyInfo(null);
          }
        } else {
          setAgencyInfo(null);
        }
      } catch (error) {
        console.error("❌ PROTECTED LAYOUT DEBUG - Error loading user session:", error);
        localStorage.removeItem('app_user');
        navigate(createPageUrl('Auth'));
      } finally {
        console.log('🔍 PROTECTED LAYOUT DEBUG - Setting isLoading to false');
        setIsLoading(false);
      }
    };
    loadUser();
  }, [location.pathname, currentPageName]);

  // 🔍 DEBUG: Log current state
  console.log('🔍 PROTECTED LAYOUT DEBUG - Current state:', {
    isLoading,
    hasUser: !!user,
    userEmail: user?.email
  });

  const handleLogout = async () => {
    // Clear all local storage data
    localStorage.removeItem('app_user');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authToken');
    setUser(null);
    setAgencyInfo(null);
    
    // Call Kinde logout
    logout();
  };

  const isPlatformAdmin = user && ['admin', 'super_admin'].includes(user.role);

  const getNavigationItems = () => {
    if (isPlatformAdmin) {
      return [
        { name: "Dashboard", icon: Home, href: createPageUrl('Dashboard') },
        { name: "Agencies", icon: Building2, href: createPageUrl('Agencies') },
        { name: "User Management", icon: UserPlus, href: createPageUrl('UserManagement') },
        { name: "Settings", icon: Settings, href: createPageUrl('Settings') }
      ];
    }
    return [
        { name: "Dashboard", icon: Home, href: createPageUrl('Dashboard') },
        { name: "Leads", icon: Users, href: createPageUrl('Leads') },
        { name: "Patients", icon: UserCheck, href: createPageUrl('Patients') },
        { name: "Caregivers", icon: ClipboardList, href: createPageUrl('Caregivers') },
        { name: "Calendar", icon: Calendar, href: createPageUrl('Calendar') },
        { name: "Documents", icon: FileText, href: createPageUrl('Documents') },
        { name: "Form Templates", icon: FileText, href: createPageUrl('FormTemplates') },
        { name: "Signatures", icon: FileSignature, href: createPageUrl('Signatures') },
        { name: "Settings", icon: Settings, href: createPageUrl('Settings') }
    ];
  };

  if (isLoading) {
    console.log('⏳ PROTECTED LAYOUT DEBUG - Showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading your workspace...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ PROTECTED LAYOUT DEBUG - No user found, showing please log in message');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to continue</p>
        </div>
      </div>
    );
  }

  console.log('✅ PROTECTED LAYOUT DEBUG - Rendering protected content for user:', user.email);

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Desktop Sidebar - MODERN GRADIENT DESIGN */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-50">
        <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-2xl backdrop-blur-xl">
          {/* Logo Area */}
          <div className="flex-shrink-0 px-6 py-6 border-b border-white/10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OneCareDesk</h1>
                {agencyInfo && (
                  <p className="text-xs text-blue-100 font-medium truncate max-w-[160px]">{agencyInfo.name}</p>
                )}
                {user.agency_id && !agencyInfo && (
                  <p className="text-xs text-blue-200 truncate max-w-[160px]">Loading agency...</p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigationItems.map((item, index) => {
              const isActive = location.pathname === item.href;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-lg'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-blue-600' : 'text-white/70'
                      }`}
                    />
                    {item.name}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 border-t border-white/10 p-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="w-full text-left justify-between items-center text-white p-3 hover:bg-white/10 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                            <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user.full_name}</p>
                            <p className="text-xs text-blue-100 capitalize truncate">{user.role?.replace('_', ' ')}</p>
                        </div>
                    </div>
                    <ChevronUp className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="w-56 bg-white border-gray-200 shadow-xl p-2 mb-2">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign Out
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Mobile header & Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 lg:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 p-6 border-b border-white/10">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">OneCareDesk</h1>
                    {agencyInfo && (
                      <p className="text-xs text-blue-100 font-medium">{agencyInfo.name}</p>
                    )}
                  </div>
                </div>
                
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                          isActive
                            ? 'bg-white text-blue-600 shadow-lg'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 flex-shrink-0 h-5 w-5 ${
                            isActive ? 'text-blue-600' : 'text-white/70'
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <Separator className="bg-white/10" />

                <div className="p-4">
                    <Popover>
                        <PopoverTrigger asChild>
                           <Button variant="ghost" className="w-full text-left justify-between items-center text-white p-3 hover:bg-white/10 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                                        <UserIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{user.full_name}</p>
                                        <p className="text-xs text-blue-100 capitalize truncate">{user.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <ChevronUp className="w-4 h-4" />
                            </Button>
                        </PopoverTrigger>
                      <PopoverContent side="top" align="start" className="w-60 bg-white border-gray-200 shadow-xl p-2 mb-2">
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Sign Out
                        </Button>
                      </PopoverContent>
                    </Popover>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

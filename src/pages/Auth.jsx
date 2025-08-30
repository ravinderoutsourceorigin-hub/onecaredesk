
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Home, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { auth } from "@/api/functions";
import { requestPasswordReset } from "@/api/functions";
import { requestUsernameRecovery } from "@/api/functions";
import Logo from '@/components/shared/Logo';

export default function Auth() {
  const [mode, setMode] = useState('login'); // 'login', 'forgot-password', 'forgot-username'
  const [formData, setFormData] = useState({ identifier: "", password: "", email: "" }); // Changed 'username' to 'identifier'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // Added rememberMe state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const navigate = useNavigate();
  // Removed emergencyUsername state as emergency login is removed
  // const [emergencyUsername, setEmergencyUsername] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear messages when user starts typing
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Prevent rapid successive submissions
    const now = Date.now();
    if (now - lastSubmitTime < 2000) {
      setError("Please wait a moment before trying again.");
      return;
    }
    setLastSubmitTime(now);

    // Changed username to identifier in validation
    if (!formData.identifier.trim() || !formData.password.trim()) {
      setError("Please enter both your username/email and password.");
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Attempting login...');
      
      const response = await auth({
        action: 'login',
        identifier: formData.identifier.trim(), // Changed username to identifier
        password: formData.password,
        rememberMe: rememberMe // Added rememberMe to auth payload
      });

      console.log('📡 Login response status:', response.status);

      if (response.data?.success) {
        console.log('✅ Login successful');
        
        // Show bypass warning if active
        if (response.data?.bypass_active) {
          console.warn('🚨 PASSWORD BYPASS IS ACTIVE - Remember to disable this in production!');
        }
        
        localStorage.setItem('app_user', JSON.stringify(response.data.user));
        
        if (response.data.needs_password_change) {
          navigate(createPageUrl('ChangePassword'));
        } else {
          navigate(createPageUrl('Dashboard'));
        }
      } else {
        console.log('❌ Login failed:', response.data?.error);
        setError(response.data?.error || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response?.status === 429) {
        errorMessage = "Too many login attempts. Please wait a minute and try again.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message?.includes('rate limit')) {
        errorMessage = "Server is busy. Please wait a moment and try again.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestPasswordReset({
        email: formData.email.trim(),
        baseUrl: window.location.origin
      });

      if (response.data?.success) {
        setSuccess("Password reset instructions have been sent to your email address.");
      } else {
        setError(response.data?.error || "Failed to send password reset email.");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError("Failed to send password reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernameRecovery = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await requestUsernameRecovery({
        email: formData.email.trim()
      });

      if (response.data?.success) {
        setSuccess("Your username has been sent to your email address.");
      } else {
        setError(response.data?.error || "Failed to send username recovery email.");
      }
    } catch (error) {
      console.error("Username recovery error:", error);
      setError("Failed to send username recovery email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Removed handleEmergencyLogin as emergency login is removed
  // const handleEmergencyLogin = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setSuccess("");
  //   if (!emergencyUsername.trim()) {
  //     setError("Please enter a username for emergency login.");
  //     return;
  //   }
  //   setIsLoading(true);
  //   try {
  //     const response = await emergencyLogin({ username: emergencyUsername.trim() });
  //     if (response.data?.success) {
  //       localStorage.setItem('app_user', JSON.stringify(response.data.user));
  //       navigate(createPageUrl('Dashboard'));
  //     } else {
  //       setError(response.data?.error || "Emergency login failed.");
  //     }
  //   } catch (error) {
  //     console.error("Emergency login error:", error);
  //     setError(error.response?.data?.error || "An error occurred during emergency login.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const renderLoginForm = () => (
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">Sign In</CardTitle>
        <p className="text-center text-gray-600">Enter your credentials to access your account</p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="identifier">Username or Email</Label>
            <Input
              id="identifier"
              name="identifier"
              type="text"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter your username or email"
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
                className="pr-10"
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={setRememberMe} />
              <label
                htmlFor="remember-me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        {/* Forgot Links */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center text-sm">
          <button
            type="button"
            onClick={() => setMode('forgot-password')}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Forgot Password?
          </button>
          <span className="hidden sm:inline text-gray-400">•</span>
          <button
            type="button"
            onClick={() => setMode('forgot-username')}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Forgot Username?
          </button>
        </div>
      </CardContent>
    </>
  );

  const renderPasswordResetForm = () => (
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">Reset Password</CardTitle>
        <p className="text-center text-gray-600">Enter your email to receive reset instructions</p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Reset Email...
              </>
            ) : (
              "Send Reset Instructions"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMode('login')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sign In
          </button>
        </div>
      </CardContent>
    </>
  );

  const renderUsernameRecoveryForm = () => (
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">Recover Username</CardTitle>
        <p className="text-center text-gray-600">Enter your email to receive your username</p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleUsernameRecovery} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Username...
              </>
            ) : (
              "Send My Username"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setMode('login')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Sign In
          </button>
        </div>
      </CardContent>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-block">
            <Logo size="large" showSubtitle={true} linkTo={null} />
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          {mode === 'login' && renderLoginForm()}
          {mode === 'forgot-password' && renderPasswordResetForm()}
          {mode === 'forgot-username' && renderUsernameRecoveryForm()}
        </Card>

        {/* Emergency Login Card for Development - Removed */}
        {/*
        <Card className="bg-orange-50 border-orange-200">
            <CardHeader>
                <CardTitle className="text-base text-orange-800">Developer Emergency Login</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleEmergencyLogin} className="space-y-4">
                    <div>
                        <Label htmlFor="emergency-username" className="text-orange-700">Username</Label>
                        <Input
                            id="emergency-username"
                            type="text"
                            value={emergencyUsername}
                            onChange={(e) => setEmergencyUsername(e.target.value)}
                            placeholder="e.g., admin or super_admin"
                            className="border-orange-300 focus:border-orange-500"
                        />
                    </div>
                    <Button type="submit" variant="outline" className="w-full border-orange-600 text-orange-600 hover:bg-orange-100" disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Log In (Bypass Password)"}
                    </Button>
                </form>
            </CardContent>
        </Card>
        */}

        {/* Support Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact your administrator or support team.
          </p>
        </div>
      </div>
    </div>
  );
}

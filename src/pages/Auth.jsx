
import React, { useState } from "react";
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, Eye, EyeOff, Mail, Lock, User, ArrowLeft, Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { auth, requestPasswordReset, signup, login } from "@/api/functions";
import Logo from '@/components/shared/Logo';

export default function Auth() {
  const { login: kindeLogin, isLoading: kindeLoading } = useKindeAuth();
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot-password'
  const [formData, setFormData] = useState({ 
    identifier: "", 
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const navigate = useNavigate();

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
      
      const response = await login({
        identifier: formData.identifier.trim(),
        password: formData.password
      });

      console.log('📡 Login response:', response);

      if (response.data?.success) {
        console.log('✅ Login successful');
        
        // Store user data and token
        localStorage.setItem('app_user', JSON.stringify(response.data.user));
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
        
        // Navigate to dashboard
        navigate(createPageUrl('Dashboard'));
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

  // Sign Up Handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email.trim() || !formData.username.trim() || 
        !formData.firstName.trim() || !formData.lastName.trim() || 
        !formData.password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      console.log('📝 Attempting signup...');
      
      const response = await signup({
        email: formData.email.trim(),
        username: formData.username.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        password: formData.password
      });

      console.log('📡 Signup response:', response);

      if (response.data?.success) {
        console.log('✅ Signup successful');
        setSuccess("Account created successfully! You can now sign in.");
        
        // Reset form and switch to login
        setFormData({
          identifier: formData.username,
          email: "",
          username: "",
          firstName: "",
          lastName: "",
          password: "",
          confirmPassword: ""
        });
        
        setTimeout(() => {
          setMode('login');
          setSuccess("");
        }, 2000);
      } else {
        console.log('❌ Signup failed:', response.data?.error);
        setError(response.data?.error || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("❌ Signup error:", error);
      setError(error.response?.data?.error || error.message || "Signup failed. Please try again.");
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

        {/* Kinde Google Sign In */}
        <Button 
          onClick={() => kindeLogin()} 
          variant="outline" 
          className="w-full mb-4 h-11 border-gray-300 hover:bg-gray-50"
          disabled={kindeLoading}
          type="button"
        >
          {kindeLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-4 w-4 text-blue-600" />
          )}
          Continue with Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or continue with email</span>
          </div>
        </div>

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

        {/* Sign Up Link */}
        <div className="text-center text-sm mt-4">
          <span className="text-gray-600">Don't have an account? </span>
          <Button
            type="button"
            variant="link"
            className="px-0 text-blue-600 hover:text-blue-700 font-semibold"
            onClick={() => setMode('signup')}
          >
            Sign up
          </Button>
        </div>
      </CardContent>
    </>
  );

  // Render Signup Form
  const renderSignupForm = () => (
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">Create Account</CardTitle>
        <CardDescription className="text-center">Sign up to get started</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Kinde Google Sign Up */}
        <Button 
          onClick={() => kindeLogin()} 
          variant="outline" 
          className="w-full mb-4 h-11 border-gray-300 hover:bg-gray-50"
          disabled={kindeLoading}
          type="button"
        >
          {kindeLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-4 w-4 text-blue-600" />
          )}
          Sign up with Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">Or sign up with email</span>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                className="pl-10"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 pr-10"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="text-center text-sm mt-4">
          <span className="text-gray-600">Already have an account? </span>
          <Button
            type="button"
            variant="link"
            className="px-0 text-blue-600 hover:text-blue-700 font-semibold"
            onClick={() => setMode('login')}
          >
            Sign in
          </Button>
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
          {mode === 'signup' && renderSignupForm()}
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

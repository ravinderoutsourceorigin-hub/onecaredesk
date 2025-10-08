
import React from "react";
import ProtectedLayout from "../components/layouts/ProtectedLayout";

// Define which pages are public. This is the single source of truth.
const publicPages = [
  'Home', 
  'Home_new', 
  'Landing', 
  'Pricing', 
  'Features', 
  'ServiceAgreement', 
  'About', 
  'Contact',
  'Auth', 
  'ChangePassword', 
  'EmailVerification', 
  'InvitationAcceptance', 
  'ResetPassword', 
  'InitializeFirstSuperAdmin',
  'AuthCallback'
];

/**
 * FINAL FIX for the layout routing.
 * This version uses the most robust method to determine the page.
 */
export default function Layout({ children, currentPageName }) {
  
  // Get effective page name
  let effectivePageName = currentPageName;
  
  // Handle root URL case
  if (!effectivePageName && typeof window !== 'undefined' && window.location.pathname === '/') {
    effectivePageName = 'Home_new';
  }
  
  // If still no page name, try to extract from URL
  if (!effectivePageName && typeof window !== 'undefined') {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      // Capitalize first letter to match page names
      effectivePageName = lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    }
  }

  // 🔍 DEBUG: Log layout decisions
  console.log('🎨 LAYOUT DEBUG:', {
    currentPageName,
    effectivePageName,
    pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR',
    isPublic: publicPages.includes(effectivePageName)
  });

  const isPublic = publicPages.includes(effectivePageName);

  if (isPublic) {
    // Render public pages directly. No auth checks happen here.
    console.log('✅ LAYOUT DEBUG: Rendering public page:', effectivePageName);
    return <>{children}</>;
  }

  // For any other page, wrap it in the ProtectedLayout which will
  // handle the authentication checks and redirects.
  console.log('🔒 LAYOUT DEBUG: Rendering protected page:', effectivePageName);
  return (
    <ProtectedLayout currentPageName={effectivePageName}>
      {children}
    </ProtectedLayout>
  );
}

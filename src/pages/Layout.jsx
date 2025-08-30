
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
  
  // Explicitly handle the root URL case.
  // If currentPageName is not provided AND the browser path is the root '/',
  // we force the page to be 'Home_new'.
  let effectivePageName = currentPageName;
  if (!effectivePageName && typeof window !== 'undefined' && window.location.pathname === '/') {
    effectivePageName = 'Home_new';
  }

  const isPublic = publicPages.includes(effectivePageName);

  if (isPublic) {
    // Render public pages directly. No auth checks happen here.
    return children;
  }

  // For any other page, wrap it in the ProtectedLayout which will
  // handle the authentication checks and redirects.
  return (
    <ProtectedLayout currentPageName={effectivePageName}>
      {children}
    </ProtectedLayout>
  );
}

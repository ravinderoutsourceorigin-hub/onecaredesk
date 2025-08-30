import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const ArchitectureNode = ({ title, description, icon, className }) => (
  <div className={`flex items-start gap-4 p-4 rounded-lg shadow-sm ${className}`}>
    <div className="flex-shrink-0 text-white p-3 rounded-full bg-black/20">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-white">{title}</h3>
      <p className="text-sm text-white/80">{description}</p>
    </div>
  </div>
);

const Arrow = ({ className, children }) => (
  <div className={`absolute flex items-center justify-center text-white/70 ${className}`}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <path d="M0,50 L100,50" stroke="currentColor" strokeWidth="2" strokeDasharray="4" />
      <path d="M95,45 L100,50 L95,55" fill="currentColor" />
    </svg>
    {children && <span className="absolute bg-gray-800 px-2 py-1 text-xs rounded-md shadow-lg">{children}</span>}
  </div>
);

export default function Architecture() {
  const diagramUrl = "https://i.imgur.com/your-diagram-image.png"; // Replace with the actual URL of the diagram image if you have one.

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">System Architecture</h1>
            <p className="text-lg text-gray-400 mt-2">A visual overview of the OneCareDesk platform.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/Settings">
              <Button variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Settings
              </Button>
            </Link>
            <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={() => window.print()}>
              <Download className="w-4 h-4 mr-2" />
              Save as PDF
            </Button>
          </div>
        </div>

        {/* Diagram Container */}
        <div className="relative p-8 rounded-xl bg-gray-800/50 border border-gray-700 shadow-2xl overflow-auto">
          {/* This is a simplified representation using divs and arrows. */}
          {/* For a real-world scenario, you might use an iframe, an img tag with the diagram, or a library like React Flow. */}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
            {/* Column 1: Core Platform */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center text-cyan-400">Core Platform</h2>
              <ArchitectureNode 
                title="Frontend (React)"
                description="User interface built with React and TailwindCSS for a responsive experience."
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>}
                className="bg-cyan-500/30 border border-cyan-400/50"
              />
              <ArchitectureNode 
                title="Backend Functions"
                description="Serverless functions for business logic, data processing, and API integrations."
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>}
                className="bg-cyan-500/30 border border-cyan-400/50"
              />
              <ArchitectureNode 
                title="Base44 Database"
                description="Secure and scalable storage for all application data (agencies, users, patients, etc.)."
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>}
                className="bg-cyan-500/30 border border-cyan-400/50"
              />
            </div>

            {/* Column 2: Key Modules */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center text-amber-400">Key Modules</h2>
              <ArchitectureNode 
                title="Multi-Tenancy"
                description="Data is strictly segregated by Agency ID to ensure privacy and security."
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 17H4.18a2 2 0 0 1-1.79-1.11l-1.27-3.2A2 2 0 0 1 .21 10.5l3.5-3.5a2 2 0 0 1 1.41-.59H19.88a2 2 0 0 1 1.79 1.11l1.27 3.2A2 2 0 0 1 23.79 14.5l-3.5 3.5a2 2 0 0 1-1.41.59H15"/><path d="M12 2v5"/></svg>}
                className="bg-amber-500/30 border border-amber-400/50"
              />
              <ArchitectureNode 
                title="User & Role Management"
                description="Controls access levels: Super Admin, Agency Admin, Care Manager."
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                className="bg-amber-500/30 border border-amber-400/50"
              />
              <ArchitectureNode 
                title="CRM (Leads, Patients)"
                description="Manages the entire client lifecycle from initial lead to active patient care."
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                className="bg-amber-500/30 border border-amber-400/50"
              />
            </div>

            {/* Column 3: External Integrations */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center text-violet-400">External Integrations</h2>
              <ArchitectureNode 
                title="BoldSign API"
                description="For legally binding e-signatures on documents and contracts."
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5a.5.5 0 0 0-.5-.5H14a.5.5 0 0 0-.5.5v4a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5V17a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 0 .5.5h.5a.5.5 0 0 0 .5-.5v-4Z"/><path d="M4 18a4 4 0 0 1-3-3.7V9a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v2.7"/><path d="M12 18.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0-2-2H2"/></svg>}
                className="bg-violet-500/30 border border-violet-400/50"
              />
               <ArchitectureNode 
                title="JotForm / Fillout"
                description="For creating dynamic forms for patient intake and caregiver applications."
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>}
                className="bg-violet-500/30 border border-violet-400/50"
              />
              <ArchitectureNode 
                title="Resend API"
                description="Handles reliable delivery of system emails, invitations, and notifications."
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>}
                className="bg-violet-500/30 border border-violet-400/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
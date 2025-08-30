import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Leads from "./Leads";

import Patients from "./Patients";

import Caregivers from "./Caregivers";

import Documents from "./Documents";

import Calendar from "./Calendar";

import Signatures from "./Signatures";

import PDFEditor from "./PDFEditor";

import Settings from "./Settings";

import BoldSignCallback from "./BoldSignCallback";

import Architecture from "./Architecture";

import IntegrationTest from "./IntegrationTest";

import UserManagement from "./UserManagement";

import Landing from "./Landing";

import ServiceAgreement from "./ServiceAgreement";

import Home from "./Home";

import Agencies from "./Agencies";

import EmailVerification from "./EmailVerification";

import InvitationAcceptance from "./InvitationAcceptance";

import ChangePassword from "./ChangePassword";

import Auth from "./Auth";

import ResetPassword from "./ResetPassword";

import Features from "./Features";

import About from "./About";

import Contact from "./Contact";

import Pricing from "./Pricing";

import Home_new from "./Home_new";

import AuthCallback from "./AuthCallback";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Leads: Leads,
    
    Patients: Patients,
    
    Caregivers: Caregivers,
    
    Documents: Documents,
    
    Calendar: Calendar,
    
    Signatures: Signatures,
    
    PDFEditor: PDFEditor,
    
    Settings: Settings,
    
    BoldSignCallback: BoldSignCallback,
    
    Architecture: Architecture,
    
    IntegrationTest: IntegrationTest,
    
    UserManagement: UserManagement,
    
    Landing: Landing,
    
    ServiceAgreement: ServiceAgreement,
    
    Home: Home,
    
    Agencies: Agencies,
    
    EmailVerification: EmailVerification,
    
    InvitationAcceptance: InvitationAcceptance,
    
    ChangePassword: ChangePassword,
    
    Auth: Auth,
    
    ResetPassword: ResetPassword,
    
    Features: Features,
    
    About: About,
    
    Contact: Contact,
    
    Pricing: Pricing,
    
    Home_new: Home_new,
    
    AuthCallback: AuthCallback,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Leads" element={<Leads />} />
                
                <Route path="/Patients" element={<Patients />} />
                
                <Route path="/Caregivers" element={<Caregivers />} />
                
                <Route path="/Documents" element={<Documents />} />
                
                <Route path="/Calendar" element={<Calendar />} />
                
                <Route path="/Signatures" element={<Signatures />} />
                
                <Route path="/PDFEditor" element={<PDFEditor />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/BoldSignCallback" element={<BoldSignCallback />} />
                
                <Route path="/Architecture" element={<Architecture />} />
                
                <Route path="/IntegrationTest" element={<IntegrationTest />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/ServiceAgreement" element={<ServiceAgreement />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Agencies" element={<Agencies />} />
                
                <Route path="/EmailVerification" element={<EmailVerification />} />
                
                <Route path="/InvitationAcceptance" element={<InvitationAcceptance />} />
                
                <Route path="/ChangePassword" element={<ChangePassword />} />
                
                <Route path="/Auth" element={<Auth />} />
                
                <Route path="/ResetPassword" element={<ResetPassword />} />
                
                <Route path="/Features" element={<Features />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/Home_new" element={<Home_new />} />
                
                <Route path="/auth/callback" element={<AuthCallback />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
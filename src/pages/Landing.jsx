import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { CheckCircle, Users, HeartHandshake, FileSignature } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            The All-In-One Platform for Home Care Agencies
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your operations, from lead management and patient onboarding to caregiver scheduling and e-signatures. Focus on what matters most: providing excellent care.
          </p>
          <div className="flex justify-center gap-4">
            <Link to={createPageUrl("Pricing")}>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">View Pricing</Button>
            </Link>
            <Button size="lg" variant="outline">Request a Demo</Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything Your Agency Needs</h2>
            <p className="text-gray-600 mt-2">A complete toolkit to manage and grow your business efficiently.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Client & Staff Management</h3>
              <p className="text-gray-600">
                Effortlessly manage leads, patients, and caregivers from a centralized dashboard. Track onboarding status, certifications, and care plans.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-600 mb-4">
                <FileSignature className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure E-Signatures</h3>
              <p className="text-gray-600">
                Go paperless with integrated, secure e-signatures for contracts, consent forms, and service agreements. Track document status in real-time.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 text-purple-600 mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">HIPAA-Compliant Platform</h3>
              <p className="text-gray-600">
                Built with security at its core. Our platform helps you maintain HIPAA compliance with features like audit logs and session timeouts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Trusted by Agencies Nationwide</h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-700 text-lg italic mb-4">
              "CareConnect has been a game-changer for our agency. We've cut down our administrative time by 50% and can focus more on our patients. The e-signature integration alone is worth its weight in gold."
            </p>
            <p className="font-semibold text-gray-900">Sarah Johnson, Director</p>
            <p className="text-sm text-gray-500">Caring Hands Home Health</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Agency?</h2>
          <p className="text-gray-600 mb-8">
            Start your free trial today. No credit card required.
          </p>
          <Link to={createPageUrl("Pricing")}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">Choose Your Plan</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
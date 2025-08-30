import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Logo from '@/components/shared/Logo';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo size="small" showSubtitle={false} linkTo="/" />
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')} className="text-sm font-semibold leading-6 text-blue-800 hover:text-blue-900 hover:bg-blue-100 px-3 py-2 rounded">Home</Link>
              <Link to={createPageUrl('Features')} className="text-sm font-semibold leading-6 text-blue-800 hover:text-blue-900 hover:bg-blue-100 px-3 py-2 rounded">Features</Link>
              <Link to={createPageUrl('About')} className="text-sm font-semibold leading-6 text-blue-800 hover:text-blue-900 hover:bg-blue-100 px-3 py-2 rounded">About</Link>
              <Link to={createPageUrl('Contact')} className="text-sm font-semibold leading-6 text-blue-800 hover:text-blue-900 hover:bg-blue-100 px-3 py-2 rounded">Contact</Link>
              <Button asChild>
                <Link to={createPageUrl('Auth')}>Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-8">
              Simple, Transparent
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">Pricing</span>
            </h1>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed">
              Get started with our comprehensive home care management platform. All features included, no hidden costs.
            </p>
          </div>
        </section>

        {/* Single Plan Section */}
        <section className="py-10 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-200">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white text-center">
                <h2 className="text-3xl font-bold mb-4">OneCareDesk Professional</h2>
                <p className="text-blue-100 text-lg mb-8">Everything you need to manage your home care agency</p>
                <div className="text-6xl font-bold mb-4">Free Trial</div>
                <p className="text-blue-100">Start with a 14-day free trial, no credit card required</p>
              </div>
              
              <div className="px-8 py-12">
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div>
                    <h3 className="text-xl font-semibold mb-6 text-gray-900">Lead Management</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Unlimited lead tracking</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Automated follow-up reminders</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Conversion analytics</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-6 text-gray-900">Patient & Caregiver Management</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Comprehensive patient profiles</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Caregiver onboarding & tracking</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Background check management</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-6 text-gray-900">Scheduling & Calendar</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Advanced scheduling system</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Automated appointment reminders</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Mobile access for caregivers</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-6 text-gray-900">Documents & E-Signatures</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">Document management system</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">E-signature integrations</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">HIPAA compliant storage</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg px-12"
                    asChild
                  >
                    <Link to={createPageUrl('Auth')}>
                      Start Your 14-Day Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <p className="text-gray-500 mt-4">No credit card required • Cancel anytime</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Frequently Asked Questions</h2>
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Is there really no setup fee?</h3>
                <p className="text-gray-700">Absolutely! We believe in transparent pricing. There are no setup fees, hidden costs, or long-term contracts required.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Can I cancel my subscription at any time?</h3>
                <p className="text-gray-700">Yes, you can cancel your subscription at any time. We don't believe in locking you into long-term contracts.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Do you offer customer support?</h3>
                <p className="text-gray-700">Yes! We provide comprehensive customer support including email support, knowledge base, and onboarding assistance.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Is my data secure and HIPAA compliant?</h3>
                <p className="text-gray-700">Security is our top priority. OneCareDesk is built with HIPAA compliance in mind and uses industry-standard encryption to protect your data.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-16 rounded-3xl shadow-2xl">
              <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Agency?</h2>
              <p className="text-xl text-blue-100 mb-8">
                Join hundreds of home care agencies already using OneCareDesk to streamline their operations.
              </p>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg px-12"
                asChild
              >
                <Link to={createPageUrl('Auth')}>
                  Start Your Free Trial Today <ArrowRight className="ml-2 w-6 h-6" />
                </Link>
              </Button>
              <p className="text-blue-200 mt-4 text-sm">14-day free trial • No credit card required</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

import React from 'react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import Logo from '@/components/shared/Logo';
import { Check, Users, FileText, Calendar, DollarSign, Star, TrendingUp, ShieldCheck, BarChart2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedHero from '../components/home/AnimatedHero';

// Reusable Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
    <div className="text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
      <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 border-4 border-white ring-4 ring-blue-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-base">{description}</p>
    </div>
);

// Reusable Testimonial Card Component
const TestimonialCard = ({ quote, author, role, company, avatar }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full">
    <div className="flex-grow">
      <div className="flex text-yellow-400 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
      </div>
      <p className="text-gray-600 italic">"{quote}"</p>
    </div>
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center">
        <img className="w-12 h-12 rounded-full object-cover mr-4" src={avatar} alt={author} />
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-500">{role}, {company}</p>
        </div>
      </div>
    </div>
  </div>
);

export default function Home_new() {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between h-20" aria-label="Global">
            <div className="flex lg:flex-1">
              <Logo size="medium" showSubtitle={false} linkTo="/" />
            </div>
            <div className="hidden lg:flex lg:gap-x-10">
              <a href={createPageUrl('Features')} className="text-sm font-semibold leading-6 text-gray-700 hover:text-blue-600">Features</a>
              <a href={createPageUrl('Pricing')} className="text-sm font-semibold leading-6 text-gray-700 hover:text-blue-600">Pricing</a>
              <a href={createPageUrl('About')} className="text-sm font-semibold leading-6 text-gray-700 hover:text-blue-600">About Us</a>
            </div>
            <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-x-6">
              <Link to={createPageUrl('Auth')} className="text-sm font-semibold leading-6 text-gray-700 hover:text-blue-600">
                Log in
              </Link>
              <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
                <Link to={createPageUrl('Auth')}>Request a Demo</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative bg-gray-50 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                  Empowering Your Agency,<br />Elevating Your Care
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
                  The all-in-one platform designed to streamline your operations, ensure compliance, and empower your caregivers to provide exceptional service.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-transform hover:scale-105">
                    <Link to={createPageUrl('Contact')}>Request a Demo</Link>
                  </Button>
                  <Button asChild size="lg" variant="link" className="text-gray-900 font-semibold">
                    <Link to={createPageUrl('Features')}>
                      Learn more <span aria-hidden="true" className="ml-1">→</span>
                    </Link>
                  </Button>
                </div>
            </div>
            
            <AnimatedHero />

          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-24 sm:py-32 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-600">Everything You Need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                A better way to manage your agency
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                From client intake to caregiver payroll, our platform simplifies your most complex workflows so you can focus on delivering quality care.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mt-24 lg:max-w-none lg:grid-cols-4">
              <FeatureCard 
                icon={<Users className="w-8 h-8" />}
                title="Client & Caregiver CRM"
                description="Manage profiles, track history, and maintain all records in one secure, centralized database."
              />
              <FeatureCard 
                icon={<ShieldCheck className="w-8 h-8" />}
                title="Compliance & Documents"
                description="Ensure regulatory compliance with automated tracking, e-signatures, and secure document storage."
              />
              <FeatureCard 
                icon={<BarChart2 className="w-8 h-8" />}
                title="Scheduling & Billing"
                description="Optimize schedules, manage appointments, and streamline your billing and payroll processes."
              />
              <FeatureCard 
                icon={<CheckCircle2 className="w-8 h-8" />}
                title="Task Management"
                description="Create, assign, and track tasks related to onboarding, care plans, and administrative duties."
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 sm:py-32 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Trusted by Agencies Nationwide</h2>
              <p className="mt-4 text-lg leading-8 text-gray-600">
                See why top home care agencies choose OneCareDesk to power their growth.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
              <TestimonialCard
                quote="OneCareDesk has been a complete game-changer for our operations. The efficiency gains are incredible, and the support is top-notch. I can't imagine running my agency without it."
                author="Sarah Johnson"
                role="Director of Operations"
                company="Sunshine Home Care"
                avatar="https://i.pravatar.cc/150?img=1"
              />
              <TestimonialCard
                quote="The compliance and documentation features alone are worth their weight in gold. We're saving countless hours and have peace of mind knowing everything is organized and secure."
                author="Michael Chen"
                role="Owner & Administrator"
                company="Caring Hands LLC"
                avatar="https://i.pravatar.cc/150?img=3"
              />
              <TestimonialCard
                quote="Our caregivers love the mobile app, and our scheduling has never been smoother. It's user-friendly, powerful, and has significantly improved our client and employee satisfaction."
                author="Emily Rodriguez"
                role="Lead Care Coordinator"
                company="Serenity Caregivers"
                avatar="https://i.pravatar.cc/150?img=5"
              />
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-blue-600">
          <div className="mx-auto max-w-4xl text-center px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to streamline your agency?
            </h2>
            <p className="mt-4 text-lg leading-8 text-blue-100">
              Stop juggling multiple systems. See how OneCareDesk can unify your operations, improve efficiency, and help you deliver better care.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-transform hover:scale-105">
                <Link to={createPageUrl('Auth')}>Request Your Free Demo</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Logo size="medium" showSubtitle={false} />
              <p className="text-sm text-gray-400 mt-4">The Operating System for Home Care</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-200">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Book a demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-200">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white">About us</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-gray-200">Legal</h3>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} OneCareDesk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, ArrowRight, Users, TrendingUp, FileSignature, Shield, Star, Quote, Linkedin, Twitter, Facebook } from "lucide-react";
import Logo from '@/components/shared/Logo';

// Navigation links for header and mobile menu
const navigation = [
  { name: 'Features', href: 'Features' },
  { name: 'About', href: 'About' },
  { name: 'Contact', href: 'Contact' },
];

// Feature data for the features section
const features = [
  {
    title: "Smart Lead Management",
    description: "Turn inquiries into admissions with a streamlined process. Nurture leads efficiently and track your pipeline's performance.",
    icon: TrendingUp,
    color: "blue"
  },
  {
    title: "Patient & Caregiver Profiles", 
    description: "Manage comprehensive profiles for both patients and caregivers, ensuring perfect matches and personalized care delivery.",
    icon: Users,
    color: "indigo"
  },
  {
    title: "Digital Documentation",
    description: "Securely handle all documentation, from intake forms to care plans, with compliant digital signatures and storage.",
    icon: FileSignature,
    color: "sky"
  },
  {
    title: "Compliance & Security",
    description: "Operate with confidence. Our platform is built with HIPAA compliance and robust security at its core to protect your data.",
    icon: Shield,
    color: "purple"
  }
];

// Testimonial data for the testimonials section
const testimonials = [
  {
    quote: "OneCareDesk has transformed our agency's operations. The platform is intuitive, comprehensive, and has saved us countless administrative hours. Our staff and clients are happier.",
    author: "Sarah Johnson",
    title: "Director, Sunshine Home Care",
    rating: 5
  },
  {
    quote: "Managing patient records and caregiver schedules used to be a nightmare. With OneCareDesk, everything is centralized and accessible. It's a game-changer for compliance and efficiency.",
    author: "David Chen", 
    title: "Operations Manager, Caring Hands LLC",
    rating: 5
  },
  {
    quote: "The best home care software we've used. The implementation was smooth, and the support team is always responsive. Highly recommended for any agency looking to modernize.",
    author: "Maria Garcia",
    title: "Founder, Serenity Caregivers", 
    rating: 5
  }
];

// Footer navigation links
const footerNavigation = {
  platform: [
    { name: 'Features', href: 'Features' },
    { name: 'Integrations', href: '#' },
    { name: 'Demo', href: '#' },
  ],
  company: [
    { name: 'About', href: 'About' },
    { name: 'Contact', href: 'Contact' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'HIPAA Compliance', href: '#' },
  ],
};


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-200/60 sticky top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
          <div className="flex lg:flex-1">
            <Logo size="small" showSubtitle={true} linkTo="/" />
          </div>
          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                >
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-sm">
                <div className="flex items-center justify-between">
                  <Logo size="small" showSubtitle={false} linkTo="/" />
                </div>
                <div className="mt-6 flow-root">
                  <div className="-my-6 divide-y divide-gray-500/10">
                    <div className="space-y-2 py-6">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={createPageUrl(item.href)}
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="py-6 space-y-4">
                      <Link
                        to={createPageUrl('Auth')}
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      >
                        Log in
                      </Link>
                      <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all">
                        <Link to={createPageUrl('Auth')}>Start Free Trial</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navigation.map((item) => (
              <Link key={item.name} to={createPageUrl(item.href)} className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-700">
                {item.name}
              </Link>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end items-center gap-x-6">
            <Link
              to={createPageUrl('Auth')}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-700"
            >
              Log in
            </Link>
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all">
              <Link to={createPageUrl('Auth')}>Start Free Trial</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-100 via-white to-purple-100 opacity-60"></div>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Empowering Your Agency,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mt-2">Elevating Your Care</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
                The all-in-one platform designed to streamline your operations, ensure compliance, and empower your caregivers to provide exceptional service.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all">
                  <Link to={createPageUrl('Auth')}>
                    Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-white/50 border-gray-300 hover:bg-white">
                  <Link to="#">Request a Demo</Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Image Stack */}
            <div className="relative h-96 lg:h-auto lg:min-h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=1887&auto=format&fit=crop"
                alt="Nurse with tablet"
                className="absolute top-0 right-0 lg:left-1/2 lg:-translate-x-1/4 w-3/4 h-auto rounded-2xl shadow-2xl object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1612531385447-aa82d5b9d35c?q=80&w=1887&auto=format&fit=crop"
                alt="Caregiver with elderly patient"
                className="absolute bottom-0 left-0 w-1/2 h-auto rounded-2xl shadow-2xl object-cover border-4 border-white"
              />
              <div className="absolute top-1/4 -left-8 bg-white/70 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200 hidden lg:flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 flex items-center justify-center rounded-full">
                  <Star className="w-6 h-6 text-green-500 fill-current" />
                </div>
                <div>
                  <p className="font-bold text-gray-800">5-Star Rated</p>
                  <p className="text-xs text-gray-500">by Agencies</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest text-blue-600 uppercase">One Platform, Total Control</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
                Features Designed for Home Care Success
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                OneCareDesk is engineered to tackle the unique challenges of the home care industry, providing you with the tools to grow and thrive.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature) => {
                const colors = {
                  blue: 'from-blue-500 to-blue-600',
                  indigo: 'from-indigo-500 to-indigo-600',
                  sky: 'from-sky-500 to-sky-600',
                  purple: 'from-purple-500 to-purple-600'
                }
                return (
                  <div key={feature.title} className="bg-gray-50 p-8 rounded-2xl hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-t-4 border-blue-500">
                    <div className={`w-12 h-12 bg-gradient-to-r ${colors[feature.color]} rounded-xl flex items-center justify-center mb-6 shadow-md`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trusted by Growing Home Care Agencies</h2>
              <p className="text-lg text-gray-600">Discover why agencies across the country choose OneCareDesk to power their operations.</p>
            </div>
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-200/50 flex flex-col">
                  <Quote className="w-10 h-10 text-blue-300 mb-4" />
                  <p className="text-gray-700 mb-6 text-base leading-relaxed flex-grow">"{testimonial.quote}"</p>
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{testimonial.author}</p>
                        <p className="text-blue-600 text-sm">{testimonial.title}</p>
                      </div>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-12 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-16 -right-5 w-48 h-48 bg-white/10 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Home Care Agency?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join hundreds of successful agencies using OneCareDesk to streamline operations, reduce administrative burden, and improve patient care.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-4 shadow-lg hover:scale-105 transition-all duration-300"
              >
                <Link to={createPageUrl('Auth')}>
                  Start Your 14-Day Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <p className="text-blue-200 mt-4 text-sm">No credit card required • Setup in minutes</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Logo size="small" showSubtitle={true} linkTo="/" textColor="text-white" subtitleColor="text-gray-400" />
              <p className="text-gray-400 text-sm mt-4">The all-in-one platform for modern home care agencies.</p>
              <div className="flex space-x-4 mt-6">
                <a href="#" className="text-gray-400 hover:text-white"><Twitter /></a>
                <a href="#" className="text-gray-400 hover:text-white"><Facebook /></a>
                <a href="#" className="text-gray-400 hover:text-white"><Linkedin /></a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-blue-300">Platform</h3>
              <ul className="space-y-3 text-gray-300">
                {footerNavigation.platform.map(item => (
                  <li key={item.name}><a href={createPageUrl(item.href)} className="hover:text-blue-300 transition-colors">{item.name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-blue-300">Company</h3>
              <ul className="space-y-3 text-gray-300">
                {footerNavigation.company.map(item => (
                  <li key={item.name}><a href={createPageUrl(item.href)} className="hover:text-blue-300 transition-colors">{item.name}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-blue-300">Legal</h3>
              <ul className="space-y-3 text-gray-300">
                {footerNavigation.legal.map(item => (
                  <li key={item.name}><a href={item.href} className="hover:text-blue-300 transition-colors">{item.name}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} OneCareDesk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
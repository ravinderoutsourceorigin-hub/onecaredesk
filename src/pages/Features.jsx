import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, FileText, Shield, TrendingUp, Clock, CheckCircle, Star, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from '@/components/shared/Logo';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Features() {
  const features = [
    {
      category: "Lead Management",
      title: "Turn Every Inquiry Into an Admission",
      description: "Our intuitive lead management system helps you track inquiries from first contact to admission, ensuring no opportunity is missed.",
      features: [
        "Automated lead capture from web forms and calls",
        "Visual pipeline to track lead stages", 
        "Follow-up reminders and task automation",
        "Family communication log",
        "In-depth analytics on conversion rates",
      ],
      icon: TrendingUp,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
    },
    {
      category: "Patient & Caregiver Profiles",
      title: "Holistic Care and Staff Management",
      description: "Create detailed profiles for patients and caregivers to ensure perfect matches, personalized care, and efficient staff management.",
      features: [
        "Comprehensive patient profiles & care plans",
        "Medication and appointment tracking",
        "Caregiver skill and availability matching",
        "Certification and compliance tracking",
        "Secure internal messaging",
      ],
      icon: Users,
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?q=80&w=2070&auto=format&fit=crop"
    },
    {
      category: "Digital Documentation & eSign",
      title: "Go Paperless with Confidence", 
      description: "Streamline your documentation process with secure, HIPAA-compliant digital forms and e-signatures, reducing administrative time and errors.",
      features: [
        "Customizable form and document builder",
        "Secure e-signature workflows (BoldSign, etc.)",
        "Centralized document repository",
        "Automated reminders for expiring documents",
        "Version control and audit trails",
      ],
      icon: FileText,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2070&auto=format&fit=crop"
    },
    {
      category: "Scheduling & Compliance",
      title: "Simplify Scheduling, Ensure Compliance",
      description: "Our powerful scheduling engine makes it easy to manage shifts and visits, while built-in compliance checks give you peace of mind.",
      features: [
        "Drag-and-drop calendar interface",
        "Automated shift reminders for caregivers", 
        "Mobile access to schedules and visit notes",
        "HIPAA and regulatory compliance checks",
        "Time tracking and visit verification",
      ],
      icon: Shield,
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=2039&auto=format&fit=crop"
    }
  ];

  const navigation = [
    { name: 'Home', href: 'Home' },
    { name: 'About', href: 'About' },
    { name: 'Contact', href: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-blue-200/60 sticky top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8 max-w-7xl mx-auto" aria-label="Global">
          <div className="flex lg:flex-1">
            <Logo size="small" showSubtitle={false} linkTo="/" />
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
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-8">
              A Smarter Way to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">Manage Home Care</span>
            </h1>
            <p className="text-xl text-gray-700 mb-10 leading-relaxed">
              Discover the tools designed to help your agency operate more efficiently, so you can focus on delivering exceptional care.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl">
              <Link to={createPageUrl('Auth')}>
                Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto space-y-32">
            {features.map((feature, index) => (
              <div key={index} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'md:col-start-2' : ''}>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                    <feature.icon className="w-4 h-4 mr-2" />
                    {feature.category}
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{feature.title}</h2>
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">{feature.description}</p>
                  <ul className="space-y-3">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? 'md:col-start-1' : ''}>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl blur-3xl opacity-20"></div>
                    <img 
                      src={feature.image}
                      alt={feature.title}
                      className="rounded-2xl shadow-2xl relative z-10 w-full h-80 object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-6 bg-white/60">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white p-16 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full"></div>
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full"></div>
              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Join hundreds of agencies who use OneCareDesk to streamline operations and deliver better care.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 text-xl px-8 py-4 shadow-lg transform hover:scale-105 transition-all"
                >
                  <Link to={createPageUrl('Auth')}>
                    Start Your Free Trial
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Link>
                </Button>
                <p className="text-blue-200 mt-4 text-sm">No credit card required • Setup in minutes</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
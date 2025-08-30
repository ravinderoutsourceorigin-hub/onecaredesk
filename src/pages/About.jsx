import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, Target, Heart, Award, CheckCircle, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/shared/Logo';

export default function About() {
  const values = [
    {
      name: 'Compassionate Care',
      description: 'We believe that technology should enhance the human connection in healthcare, not replace it.',
      icon: Heart,
    },
    {
      name: 'Innovation',
      description: 'Continuously evolving our platform to meet the changing needs of home care agencies.',
      icon: Target,
    },
    {
      name: 'Reliability',
      description: 'Building robust, secure systems that agencies can depend on for their daily operations.',
      icon: Award,
    },
    {
      name: 'Partnership',
      description: 'Working closely with our clients to understand their unique challenges and goals.',
      icon: Users,
    },
  ];

  const stats = [
    { name: 'Agencies Served', value: '500+' },
    { name: 'Patients Managed', value: '10K+' },
    { name: 'Documents Processed', value: '50K+' },
    { name: 'Uptime Guarantee', value: '99.9%' },
  ];

  const navigation = [
    { name: 'Home', href: 'Home' },
    { name: 'Features', href: 'Features' },
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
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-4xl py-16 sm:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Empowering Home Care 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600">
                  Agencies Nationwide
                </span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                OneCareDesk was founded with a simple mission: to provide home care agencies with the tools they need to deliver exceptional patient care while growing their business efficiently.
              </p>
            </div>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:mx-0">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Story</h2>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Founded by industry veterans who understood the unique challenges facing home care agencies, OneCareDesk was built from the ground up to address the real needs of care providers.
              </p>
            </div>
            <div className="mx-auto mt-10 max-w-2xl lg:mx-0 lg:max-w-none">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-y-10">
                <div>
                  <h3 className="border-l border-indigo-600 pl-6 font-semibold text-gray-900">The Challenge</h3>
                  <p className="mt-2 pl-6">
                    Home care agencies were struggling with outdated systems, paper-based processes, and disconnected tools that made it difficult to provide quality care efficiently.
                  </p>
                </div>
                <div>
                  <h3 className="border-l border-indigo-600 pl-6 font-semibold text-gray-900">Our Solution</h3>
                  <p className="mt-2 pl-6">
                    We created an integrated platform that brings together lead management, patient care, scheduling, documentation, and e-signatures in one seamless experience.
                  </p>
                </div>
                <div>
                  <h3 className="border-l border-indigo-600 pl-6 font-semibold text-gray-900">The Impact</h3>
                  <p className="mt-2 pl-6">
                    Today, hundreds of agencies use OneCareDesk to manage thousands of patients, streamline operations, and focus on what matters most - providing exceptional care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Trusted by agencies nationwide
                </h2>
                <p className="mt-4 text-lg leading-8 text-gray-600">
                  Join hundreds of home care agencies who trust OneCareDesk to power their operations.
                </p>
              </div>
              <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div key={stat.name} className="flex flex-col bg-white p-8">
                    <dt className="text-sm font-semibold leading-6 text-gray-600">{stat.name}</dt>
                    <dd className="order-first text-3xl font-bold tracking-tight text-gray-900">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Our Values</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                What drives us every day
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Our core values guide everything we do, from product development to customer support.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                {values.map((value) => (
                  <div key={value.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                      <value.icon className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                      {value.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{value.description}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to transform your agency?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Join the hundreds of agencies already using OneCareDesk to streamline their operations and improve patient care.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl">
                <Link to={createPageUrl('Auth')}>Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={createPageUrl('Contact')}>Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
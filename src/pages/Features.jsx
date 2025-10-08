import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRight, 
  TrendingUp, 
  Users, 
  FileSignature, 
  Shield,
  CheckCircle,
  Sparkles,
  Calendar,
  BarChart3,
  Bell,
  Clock,
  Lock,
  Zap,
  Globe,
  Smartphone
} from "lucide-react";
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import ModernNav from '@/components/shared/ModernNav';
import ModernFooter from '@/components/shared/ModernFooter';
import AnimatedSection from '@/components/shared/AnimatedSection';
import GradientText from '@/components/shared/GradientText';
import FloatingCard from '@/components/shared/FloatingCard';
import MagneticButton from '@/components/shared/MagneticButton';
import { staggerContainer, staggerItem } from '@/lib/animations';

gsap.registerPlugin(ScrollTrigger);

const featureSections = [
  {
    category: "Lead Management",
    title: "Convert More Inquiries Into Admissions",
    description: "AI-powered lead management system that helps you capture, nurture, and convert prospects faster than ever.",
    icon: TrendingUp,
    gradient: "from-blue-500 to-cyan-500",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop",
    features: [
      "Automated lead capture from website, phone, and referrals",
      "AI-powered lead scoring and prioritization",
      "Smart follow-up reminders and task automation",
      "Complete family communication history",
      "Real-time pipeline visualization and analytics",
      "Integration with popular CRM systems"
    ]
  },
  {
    category: "Patient & Caregiver Management",
    title: "Perfect Matching, Every Time",
    description: "Intelligent algorithms ensure optimal patient-caregiver relationships based on skills, availability, and preferences.",
    icon: Users,
    gradient: "from-purple-500 to-pink-500",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1200&h=800&fit=crop",
    features: [
      "Comprehensive patient profiles with care plans",
      "Medication tracking and appointment reminders",
      "Caregiver skill matching and availability calendar",
      "Real-time care notes and progress tracking",
      "Family portal for updates and communication",
      "Certification and compliance tracking"
    ]
  },
  {
    category: "Digital Documentation & E-Signatures",
    title: "Go Paperless with Confidence",
    description: "Secure, HIPAA-compliant document management with integrated e-signatures that streamline your workflow.",
    icon: FileSignature,
    gradient: "from-orange-500 to-red-500",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=800&fit=crop",
    features: [
      "Drag-and-drop custom form builder",
      "Secure e-signature workflows (BoldSign integration)",
      "Centralized document repository with search",
      "Automated reminders for expiring documents",
      "Full audit trail and version control",
      "Mobile-friendly signing experience"
    ]
  },
  {
    category: "Scheduling & Compliance",
    title: "Intelligent Scheduling, Zero Conflicts",
    description: "Advanced scheduling engine with built-in compliance checks ensures proper coverage and regulatory adherence.",
    icon: Calendar,
    gradient: "from-green-500 to-emerald-500",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=800&fit=crop",
    features: [
      "Drag-and-drop calendar with conflict detection",
      "Automated shift reminders for caregivers",
      "GPS check-in/out with geofencing",
      "Real-time schedule updates and notifications",
      "HIPAA and state regulatory compliance checks",
      "Time tracking and payroll integration"
    ]
  }
];

const additionalFeatures = [
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Stay informed with intelligent alerts and reminders"
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Data-driven insights to optimize operations"
  },
  {
    icon: Lock,
    title: "Bank-Level Security",
    description: "SOC 2 Type II certified with 256-bit encryption"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized performance with 99.9% uptime SLA"
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Native apps for iOS and Android"
  },
  {
    icon: Globe,
    title: "Multi-Location",
    description: "Manage multiple agencies from one platform"
  }
];

export default function Features() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax effect for feature images
      gsap.utils.toArray('.feature-image').forEach((image, i) => {
        gsap.to(image, {
          yPercent: i % 2 === 0 ? -15 : 15,
          ease: 'none',
          scrollTrigger: {
            trigger: image,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Modern Navigation */}
      <ModernNav />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            <motion.div
              className="absolute top-20 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -50, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">
                Comprehensive Feature Set
              </span>
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Features Built for
              <br />
              <GradientText>Home Care Excellence</GradientText>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-600 max-w-3xl mx-auto mb-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Everything you need to streamline operations, ensure compliance, and deliver exceptional care—all in one powerful platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <MagneticButton 
                size="lg"
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-lg px-8 py-6 h-auto hover:shadow-2xl"
                asChild
              >
                <Link to={createPageUrl('Auth')}>
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </MagneticButton>
            </motion.div>
          </div>
        </section>

        {/* Feature Sections */}
        {featureSections.map((section, index) => (
          <AnimatedSection
            key={index}
            className={`py-32 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                {/* Content */}
                <motion.div
                  className={index % 2 === 1 ? 'lg:col-start-2' : ''}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${section.gradient} bg-opacity-10 rounded-full mb-4`}>
                    <section.icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{section.category}</span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    {section.title}
                  </h2>

                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    {section.description}
                  </p>

                  <ul className="space-y-4 mb-8">
                    {section.features.map((feature, idx) => (
                      <motion.li
                        key={idx}
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                      >
                        <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 leading-relaxed">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <Link
                    to={createPageUrl('Auth')}
                    className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:gap-3 transition-all group"
                  >
                    Try this feature now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                {/* Image */}
                <motion.div
                  className={`feature-image relative ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-20`} />
                  </div>

                  {/* Floating Badge */}
                  <FloatingCard
                    className="absolute -bottom-6 -right-6 p-4 max-w-[200px]"
                    delay={0.4}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${section.gradient} flex items-center justify-center`}>
                        <section.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{section.category}</p>
                        <p className="text-xs text-gray-600">Fully Integrated</p>
                      </div>
                    </div>
                  </FloatingCard>
                </motion.div>
              </div>
            </div>
          </AnimatedSection>
        ))}

        {/* Additional Features Grid */}
        <AnimatedSection className="py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.span
                className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                And Much More
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Built for Scale,
                <br />
                <GradientText>Designed for Success</GradientText>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {additionalFeatures.map((feature, index) => (
                <FloatingCard
                  key={index}
                  className="p-8 text-center group"
                  delay={index * 0.1}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </FloatingCard>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
          
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                Experience All Features
                <br />
                Free for 14 Days
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                No credit card required. Full access to all features. Start transforming your agency today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <MagneticButton 
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-gray-50 text-lg px-10 py-7 h-auto shadow-2xl"
                  asChild
                >
                  <Link to={createPageUrl('Auth')}>
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </MagneticButton>
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-lg px-10 py-7 h-auto border-2 border-white text-white hover:bg-white/10"
                  asChild
                >
                  <Link to={createPageUrl('Pricing')}>
                    View Pricing
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  ArrowRight, 
  Users, 
  TrendingUp, 
  FileSignature, 
  Shield, 
  Star,
  CheckCircle,
  Sparkles,
  Zap,
  BarChart3,
  Clock,
  Globe
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

const features = [
  {
    title: "Smart Lead Management",
    description: "Turn inquiries into admissions with AI-powered lead scoring and automated follow-ups.",
    icon: TrendingUp,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    title: "Patient & Caregiver Matching", 
    description: "Intelligent matching algorithm ensures perfect care relationships every time.",
    icon: Users,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    title: "Digital Documentation",
    description: "HIPAA-compliant e-signatures and document management in one place.",
    icon: FileSignature,
    gradient: "from-orange-500 to-red-500"
  },
  {
    title: "Enterprise Security",
    description: "Bank-level encryption with SOC 2 Type II compliance and 99.9% uptime.",
    icon: Shield,
    gradient: "from-green-500 to-emerald-500"
  }
];

const stats = [
  { value: "10k+", label: "Active Agencies", icon: Users },
  { value: "99.9%", label: "Uptime SLA", icon: Zap },
  { value: "50%", label: "Time Saved", icon: Clock },
  { value: "150+", label: "Countries", icon: Globe }
];

const testimonials = [
  {
    quote: "OneCareDesk transformed our operations completely. We went from chaos to complete control in just 2 weeks. The ROI has been incredible.",
    author: "Sarah Johnson",
    title: "Director, Sunshine Home Care",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    rating: 5
  },
  {
    quote: "The best investment we've made. Their customer support is outstanding, and the platform just works. Our caregivers love the mobile app.",
    author: "David Chen", 
    title: "CEO, Caring Hands",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    rating: 5
  },
  {
    quote: "We've tried 5 different platforms. OneCareDesk is the only one that actually understands home care. Game-changer doesn't even describe it.",
    author: "Maria Garcia",
    title: "Founder, Serenity Care", 
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    rating: 5
  }
];

export default function HomeModern() {
  const heroRef = useRef(null);

  useEffect(() => {
    // Advanced GSAP animations
    const ctx = gsap.context(() => {
      // Hero elements animation
      gsap.from('.hero-title', {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out'
      });

      gsap.from('.hero-subtitle', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out'
      });

      gsap.from('.hero-cta', {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 0.4,
        ease: 'power3.out'
      });

      // Floating animation for hero image
      gsap.to('.hero-image', {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });

      // Stats counter animation
      gsap.from('.stat-card', {
        scrollTrigger: {
          trigger: '.stats-section',
          start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Modern Navigation */}
      <ModernNav />

      <main>
        {/* Hero Section - Modern & Premium */}
        <section 
          ref={heroRef}
          className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-20"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
              animate={{
                scale: [1, 1.2, 1],
                x: [0, 50, 0],
                y: [0, 30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
              animate={{
                scale: [1, 1.3, 1],
                x: [0, -50, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
              animate={{
                scale: [1, 1.4, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Text Content */}
              <div className="text-center lg:text-left">
                <motion.div
                  className="hero-title inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-gray-700">
                    Trusted by 10,000+ Agencies Worldwide
                  </span>
                </motion.div>

                <h1 className="hero-title text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight mb-6">
                  Home Care
                  <br />
                  <GradientText 
                    from="from-blue-600" 
                    via="via-indigo-600" 
                    to="to-purple-600"
                    className="inline-block"
                  >
                    Reimagined
                  </GradientText>
                </h1>

                <p className="hero-subtitle text-xl sm:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  The only platform that combines AI-powered automation with human-centric design. Transform your agency in days, not months.
                </p>

                <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <MagneticButton 
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white text-lg px-8 py-6 h-auto hover:shadow-2xl hover:shadow-blue-500/30 transition-all"
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
                    className="text-lg px-8 py-6 h-auto border-2 hover:bg-gray-50"
                    asChild
                  >
                    <Link to={createPageUrl('Features')}>
                      Explore Features
                    </Link>
                  </Button>
                </div>

                <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>14-day free trial</span>
                  </div>
                </div>
              </div>

              {/* Right: Hero Image/Visual */}
              <motion.div
                className="hero-image relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative">
                  {/* Main Dashboard Preview */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/50 bg-white">
                    <img
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop"
                      alt="OneCareDesk Dashboard"
                      className="w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent" />
                  </div>

                  {/* Floating Stats Card */}
                  <FloatingCard 
                    className="absolute -bottom-6 -left-6 p-4 shadow-xl max-w-[200px]"
                    delay={0.4}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">+125%</p>
                        <p className="text-xs text-gray-600">Growth Rate</p>
                      </div>
                    </div>
                  </FloatingCard>

                  {/* Floating Users Card */}
                  <FloatingCard 
                    className="absolute -top-6 -right-6 p-4 shadow-xl max-w-[180px]"
                    delay={0.6}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white" />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white" />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">10k+</p>
                        <p className="text-xs text-gray-600">Active Users</p>
                      </div>
                    </div>
                  </FloatingCard>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
              <motion.div
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <AnimatedSection className="stats-section py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="stat-card text-center"
                  variants={staggerItem}
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 mb-4">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Features Section - Modern Cards */}
        <AnimatedSection className="py-32 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.span
                className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Powerful Features
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Everything You Need,
                <br />
                <GradientText>Nothing You Don't</GradientText>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built specifically for home care agencies. Every feature designed to save time and improve outcomes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <FloatingCard
                  key={index}
                  className="p-8 group"
                  delay={index * 0.1}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <Link 
                    to={createPageUrl('Features')}
                    className="inline-flex items-center mt-4 text-blue-600 font-semibold hover:gap-2 transition-all group"
                  >
                    Learn more
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </FloatingCard>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* Testimonials Section - Modern Design */}
        <AnimatedSection className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.span
                className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Loved by Thousands
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Don't Just Take Our Word
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join thousands of agencies transforming home care delivery
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <FloatingCard
                  key={index}
                  className="p-8"
                  delay={index * 0.15}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                    <img
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.title}</p>
                    </div>
                  </div>
                </FloatingCard>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* CTA Section - Premium Design */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
          
          {/* Animated Background Pattern */}
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
                Ready to Transform
                <br />
                Your Agency?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
                Join 10,000+ agencies using OneCareDesk to deliver exceptional care and grow their business.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
                  <Link to={createPageUrl('Contact')}>
                    Talk to Sales
                  </Link>
                </Button>
              </div>

              <p className="mt-8 text-blue-200 text-sm">
                ✓ No credit card required  •  ✓ 14-day free trial  •  ✓ Cancel anytime
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <ModernFooter />
    </div>
  );
}

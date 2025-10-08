import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles, Shield, Zap, Users, MessageCircle, Star } from 'lucide-react';
import AnimatedSection from '@/components/shared/AnimatedSection';
import GradientText from '@/components/shared/GradientText';
import FloatingCard from '@/components/shared/FloatingCard';
import MagneticButton from '@/components/shared/MagneticButton';
import ModernNav from '@/components/shared/ModernNav';
import ModernFooter from '@/components/shared/ModernFooter';

export default function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      name: "Starter",
      description: "Perfect for small agencies getting started",
      monthlyPrice: 49,
      annualPrice: 39,
      features: [
        "Up to 50 patients",
        "Up to 10 caregivers",
        "Basic lead management",
        "Document storage (5GB)",
        "Email support",
        "Mobile app access"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      description: "For growing agencies with advanced needs",
      monthlyPrice: 149,
      annualPrice: 119,
      features: [
        "Unlimited patients",
        "Unlimited caregivers",
        "Advanced lead management",
        "Document storage (50GB)",
        "Priority support",
        "Mobile app access",
        "Electronic signatures",
        "Custom forms",
        "Advanced reporting",
        "API access"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      description: "Custom solutions for large organizations",
      monthlyPrice: null,
      annualPrice: null,
      features: [
        "Everything in Professional",
        "Unlimited storage",
        "Dedicated account manager",
        "24/7 phone support",
        "Custom integrations",
        "White-label options",
        "Advanced security",
        "SLA guarantee",
        "Onboarding assistance",
        "Training sessions"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "Can I try before I buy?",
      answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required."
    },
    {
      question: "What happens after the trial?",
      answer: "You can choose a plan that fits your needs. Your data will be preserved when you upgrade."
    },
    {
      question: "Can I change plans later?",
      answer: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes! All plans include email support. Professional and Enterprise plans get priority and phone support."
    },
    {
      question: "Is my data secure and HIPAA compliant?",
      answer: "Yes, we are fully HIPAA compliant with enterprise-grade security, encryption, and regular audits."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <ModernNav />
      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-50" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg mb-8"
            >
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">14-day free trial • No credit card required</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <GradientText>Simple, Transparent Pricing</GradientText>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Choose the perfect plan for your agency. All plans include our core features with a 14-day free trial.
            </p>

            <div className="flex items-center justify-center gap-4 mb-16">
              <span className={`text-lg font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-16 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-300 shadow-lg"
              >
                <motion.div
                  className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                  animate={{ x: billingPeriod === 'annual' ? 32 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-lg font-medium ${billingPeriod === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
                Annual
              </span>
              {billingPeriod === 'annual' && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                >
                  Save 20%
                </motion.span>
              )}
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <AnimatedSection key={plan.name} delay={index * 0.1}>
                <FloatingCard
                  className={`h-full ${
                    plan.popular
                      ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white border-0 shadow-2xl scale-105'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold flex items-center gap-1 shadow-lg">
                      <Star className="w-4 h-4 fill-current" />
                      Most Popular
                    </div>
                  )}

                  <div className="p-8">
                    <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>
                    <p className={`mb-6 ${plan.popular ? 'text-purple-100' : 'text-gray-600'}`}>
                      {plan.description}
                    </p>

                    <div className="mb-8">
                      {plan.monthlyPrice ? (
                        <>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                              ${billingPeriod === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                            </span>
                            <span className={`text-lg ${plan.popular ? 'text-purple-100' : 'text-gray-600'}`}>
                              /month
                            </span>
                          </div>
                          {billingPeriod === 'annual' && (
                            <p className={`text-sm mt-2 ${plan.popular ? 'text-purple-100' : 'text-gray-500'}`}>
                              Billed annually (${plan.annualPrice * 12}/year)
                            </p>
                          )}
                        </>
                      ) : (
                        <div className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                          Custom
                        </div>
                      )}
                    </div>

                    <Link to={plan.monthlyPrice ? "/auth?mode=signup" : "/contact"}>
                      <MagneticButton
                        className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          plan.popular
                            ? 'bg-white text-purple-600 hover:bg-gray-50 shadow-lg'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl'
                        }`}
                      >
                        {plan.cta}
                        <ArrowRight className="w-5 h-5" />
                      </MagneticButton>
                    </Link>

                    <ul className="mt-8 space-y-4">
                      {plan.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            plan.popular ? 'text-purple-200' : 'text-green-500'
                          }`} />
                          <span className={plan.popular ? 'text-purple-50' : 'text-gray-700'}>
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </FloatingCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-center mb-16">
              <GradientText>All Plans Include</GradientText>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: "HIPAA Compliant", desc: "Enterprise-grade security" },
              { icon: Zap, title: "Lightning Fast", desc: "Optimized performance" },
              { icon: Users, title: "Team Collaboration", desc: "Work together seamlessly" },
              { icon: MessageCircle, title: "24/7 Support", desc: "Always here to help" }
            ].map((feature, index) => (
              <AnimatedSection key={feature.title} delay={index * 0.1}>
                <FloatingCard className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                  <feature.icon className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </FloatingCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-center mb-4">
              <GradientText>Frequently Asked Questions</GradientText>
            </h2>
            <p className="text-xl text-gray-600 text-center mb-16">
              Everything you need to know about our pricing
            </p>
          </AnimatedSection>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <AnimatedSection key={index} delay={index * 0.05}>
                <FloatingCard className="bg-white border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight className="w-5 h-5 text-gray-400 transform rotate-90" />
                    </motion.div>
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{
                      height: openFaq === index ? 'auto' : 0,
                      opacity: openFaq === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6 text-gray-600">
                      {faq.answer}
                    </div>
                  </motion.div>
                </FloatingCard>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <AnimatedSection>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Agency?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of agencies already using OneCare Desk to streamline their operations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=signup">
                <MagneticButton className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 shadow-2xl flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </MagneticButton>
              </Link>
              <Link to="/contact">
                <MagneticButton className="px-8 py-4 bg-purple-500 bg-opacity-20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-opacity-30 transition-all duration-300 border border-white border-opacity-20">
                  Contact Sales
                </MagneticButton>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <ModernFooter />
    </div>
  );
}

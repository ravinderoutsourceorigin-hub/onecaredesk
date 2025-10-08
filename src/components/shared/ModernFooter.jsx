import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import Logo from '@/components/shared/Logo';
import { staggerItem } from '@/lib/animations';

const footerLinks = {
  product: [
    { name: 'Features', href: 'Features' },
    { name: 'Pricing', href: 'Pricing' },
    { name: 'Integrations', href: '#' },
    { name: 'Changelog', href: '#' },
  ],
  company: [
    { name: 'About Us', href: 'About' },
    { name: 'Careers', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Press Kit', href: '#' },
  ],
  resources: [
    { name: 'Documentation', href: '#' },
    { name: 'Help Center', href: '#' },
    { name: 'Community', href: '#' },
    { name: 'Contact', href: 'Contact' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'HIPAA Compliance', href: '#' },
    { name: 'Security', href: '#' },
  ],
};

const socialLinks = [
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
];

/**
 * Modern Footer Component
 * Premium design with gradients and smooth animations
 */
export default function ModernFooter() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <motion.div
            className="col-span-2 md:col-span-3 lg:col-span-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerItem}
          >
            <Logo 
              size="small" 
              showSubtitle={true} 
              linkTo="/" 
              textColor="text-white" 
              subtitleColor="text-gray-400" 
            />
            <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm">
              The all-in-one platform for modern home care agencies. Streamline operations, ensure compliance, and deliver exceptional care.
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a 
                href="mailto:hello@onecaredesk.com" 
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                hello@onecaredesk.com
              </a>
              <a 
                href="tel:+1234567890" 
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                +1 (234) 567-890
              </a>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={item.name}
                >
                  <item.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerItem}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href.startsWith('#') ? link.href : createPageUrl(link.href)}
                      className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                    >
                      {link.name}
                      <span className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div
          className="py-8 border-t border-white/10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-1">Stay Updated</h3>
              <p className="text-sm text-gray-400">
                Get the latest updates, tips, and insights delivered to your inbox.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <motion.button
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-sm font-medium transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} OneCareDesk. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="#" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link to="#" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link to="#" className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

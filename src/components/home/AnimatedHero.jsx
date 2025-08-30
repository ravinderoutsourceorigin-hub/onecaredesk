import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileSignature, Users, ClipboardEdit, Calendar, ShieldCheck, 
  FileText, BarChart2, HeartHandshake, Star, CheckCircle2, UserPlus 
} from 'lucide-react';

const features = [
  { id: 1, title: 'E-Sign', description: 'Paperless Admissions', icon: <FileSignature />, color: 'bg-pink-500', position: { top: '5%', left: '10%' } },
  { id: 2, title: 'Lead Management', description: null, icon: <UserPlus />, color: 'bg-blue-500', position: { top: '10%', left: '40%' } },
  { id: 3, title: 'Patient Intake', description: null, icon: <ClipboardEdit />, color: 'bg-purple-500', position: { top: '15%', right: '15%' } },
  { id: 4, title: 'Caregivers', description: null, icon: <Users />, color: 'bg-teal-500', position: { top: '30%', left: '20%' } },
  { id: 5, title: 'Compliance', description: null, icon: <ShieldCheck />, color: 'bg-indigo-600', position: { top: '50%', left: '5%' } },
  { id: 6, title: 'Scheduling', description: null, icon: <Calendar />, color: 'bg-rose-500', position: { top: '45%', right: '10%' } },
  { id: 7, title: 'Documentation', description: null, icon: <FileText />, color: 'bg-amber-500', position: { bottom: '20%', left: '35%' } },
  { id: 8, title: 'Billing & Reports', description: null, icon: <BarChart2 />, color: 'bg-yellow-400', position: { bottom: '15%', left: '15%' } },
  { id: 9, title: 'Care Delivery', description: null, icon: <HeartHandshake />, color: 'bg-green-500', position: { bottom: '15%', right: '20%' } },
  { id: 10, title: 'all-in-one', description: 'complete solution', icon: <Star />, color: 'bg-violet-500', position: { bottom: '5%', left: '5%' } },
  { id: 11, title: 'hipaa compliant', description: 'secure & protected', icon: <CheckCircle2 />, color: 'bg-emerald-500', position: { bottom: '5%', right: '5%' } },
];

const FloatingBubble = ({ feature }) => {
  const isTextOnly = !feature.description;
  const animation = {
    y: ["-8px", "8px"],
  };

  return (
    <motion.div
      className="absolute"
      style={{ ...feature.position }}
      animate={animation}
      transition={{
        duration: Math.random() * 2 + 3, // 3-5 seconds
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
        delay: Math.random() * 2,
      }}
    >
      <div className={`flex items-center gap-3 p-3 rounded-full text-white shadow-2xl ${feature.color}`}>
        <div className="p-2 bg-white/20 rounded-full">
          {React.cloneElement(feature.icon, { className: 'w-6 h-6' })}
        </div>
        <div>
          <h4 className="font-bold text-sm leading-tight">{feature.title}</h4>
          {feature.description && <p className="text-xs text-white/80 leading-tight">{feature.description}</p>}
        </div>
      </div>
    </motion.div>
  );
};


const AnimatedHero = () => {
  return (
    <div className="relative w-full h-[600px] my-12">
      {/* Background Image: Caregiver and Patient */}
      <img
        src="https://images.unsplash.com/photo-1612531385447-aa82d5b9d35c?q=80&w=1887&auto=format&fit=crop"
        alt="Caregiver with patient"
        className="absolute inset-0 w-full h-full object-cover opacity-10 rounded-2xl"
      />
      
      {/* Background Image: Faded UI */}
      <img
        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
        alt="UI dashboard"
        className="absolute inset-0 w-full h-full object-cover opacity-5 rounded-2xl"
      />
      
      {/* Centerpiece Image */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full overflow-hidden shadow-2xl border-4 border-white"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <img
          src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=1932&auto=format&fit=crop"
          alt="Central focus"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Floating Feature Bubbles */}
      {features.map(feature => (
        <FloatingBubble key={feature.id} feature={feature} />
      ))}
    </div>
  );
};

export default AnimatedHero;
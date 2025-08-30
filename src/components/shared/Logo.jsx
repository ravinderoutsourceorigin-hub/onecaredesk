import React from 'react';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Logo({ size = 'medium', className = '', showSubtitle = true, linkTo = null }) {
  const sizes = {
    small: {
      box: 'w-8 h-8',
      icon: 'w-5 h-5',
      title: 'text-xl',
      subtitle: 'text-xs'
    },
    medium: {
      box: 'w-10 h-10',
      icon: 'w-6 h-6',
      title: 'text-2xl',
      subtitle: 'text-sm'
    },
    large: {
      box: 'w-12 h-12',
      icon: 'w-7 h-7',
      title: 'text-2xl', // Keep title size consistent for large logo
      subtitle: 'text-sm'
    }
  };

  const currentSize = sizes[size] || sizes.medium;

  const LogoContent = () => (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`${currentSize.box} bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0`}>
        <Home className={`${currentSize.icon} text-white`} />
      </div>
      <div className="text-left">
        <h1 className={`${currentSize.title} font-bold text-gray-900`}>OneCareDesk</h1>
        {showSubtitle && <p className={`${currentSize.subtitle} text-gray-500`}>Empowering Care, Simplified.</p>}
      </div>
    </div>
  );
  
  if (linkTo) {
    return (
      <Link to={createPageUrl(linkTo.replace('/', ''))}>
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
}
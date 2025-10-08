/**
 * Professional Animation Library
 * Inspired by top-tier websites like Apple, Stripe, and Linear
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Framer Motion Variants
export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] // Custom cubic bezier
    }
  }
};

export const fadeIn = {
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  }
};

export const scaleIn = {
  hidden: { 
    opacity: 0, 
    scale: 0.9 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const slideInLeft = {
  hidden: { 
    opacity: 0, 
    x: -50 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const slideInRight = {
  hidden: { 
    opacity: 0, 
    x: 50 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

// Smooth scroll reveal for GSAP
export const initScrollReveal = (selector, options = {}) => {
  const defaults = {
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: selector,
      start: 'top 85%',
      toggleActions: 'play none none none'
    }
  };

  gsap.from(selector, { ...defaults, ...options });
};

// Parallax effect
export const initParallax = (selector, speed = 0.5) => {
  gsap.to(selector, {
    y: (i, target) => -ScrollTrigger.maxScroll(window) * target.dataset.speed || -ScrollTrigger.maxScroll(window) * speed,
    ease: 'none',
    scrollTrigger: {
      start: 0,
      end: 'max',
      invalidateOnRefresh: true,
      scrub: 0
    }
  });
};

// Smooth stagger animation
export const staggerReveal = (selector, options = {}) => {
  const defaults = {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: selector,
      start: 'top 85%',
    }
  };

  gsap.from(selector, { ...defaults, ...options });
};

// Counter animation
export const animateCounter = (element, end, duration = 2) => {
  const obj = { value: 0 };
  gsap.to(obj, {
    value: end,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      if (element) {
        element.textContent = Math.round(obj.value);
      }
    }
  });
};

// Magnetic button effect
export const magneticButton = (button, strength = 0.3) => {
  const handleMouseMove = (e) => {
    const { left, top, width, height } = button.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    gsap.to(button, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)'
    });
  };

  button.addEventListener('mousemove', handleMouseMove);
  button.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    button.removeEventListener('mousemove', handleMouseMove);
    button.removeEventListener('mouseleave', handleMouseLeave);
  };
};

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

// Hover scale effect
export const hoverScale = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Smooth gradient animation
export const animateGradient = (element) => {
  gsap.to(element, {
    backgroundPosition: '200% center',
    duration: 3,
    ease: 'none',
    repeat: -1
  });
};

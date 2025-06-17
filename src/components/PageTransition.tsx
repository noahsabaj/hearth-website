import { motion, AnimatePresence, Variants } from 'framer-motion';
import React from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'slide' | 'fade' | 'scale' | 'slideUp' | 'slideDown';
  duration?: number;
  delay?: number;
}

const pageVariants: Record<string, Variants> = {
  slide: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.2 },
  },
  slideUp: {
    initial: { opacity: 0, y: 100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -100 },
  },
  slideDown: {
    initial: { opacity: 0, y: -100 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100 },
  },
};

const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'fade',
  duration = 0.6,
  delay = 0,
}) => {
  const location = useLocation();
  const selectedVariants = pageVariants[variant] || (pageVariants.fade as Variants);

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={location.pathname}
        variants={selectedVariants}
        initial='initial'
        animate='animate'
        exit='exit'
        transition={{
          duration,
          delay,
          ease: 'easeInOut',
        }}
        style={{
          width: '100%',
          minHeight: '100vh',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Animated section wrapper for content within pages
interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  variant?: 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scaleIn';
  threshold?: number;
}

const sectionVariants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  },
};

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  delay = 0,
  duration = 0.6,
  variant = 'fadeUp',
  threshold = 0.1,
}) => {
  const selectedSectionVariants = sectionVariants[variant] || (sectionVariants.fadeUp as Variants);

  return (
    <motion.div
      variants={selectedSectionVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
};

// Staggered container for animating lists of items
interface StaggerContainerProps {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  staggerDelay = 0.1,
  className,
}) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, amount: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

// Individual item in staggered list
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem: React.FC<StaggerItemProps> = ({ children, className }) => {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
};

export default PageTransition;

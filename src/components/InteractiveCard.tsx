import { Card, CardProps } from '@mui/material';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import React, { useRef, useCallback } from 'react';

interface InteractiveCardProps extends CardProps {
  children: React.ReactNode;
  tiltIntensity?: number;
  hoverScale?: number;
  shadowIntensity?: number;
  glowEffect?: boolean;
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
  disableInteraction?: boolean;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  tiltIntensity = 15,
  hoverScale = 1.02,
  shadowIntensity = 0.3,
  glowEffect = false,
  springConfig = { damping: 25, stiffness: 400 },
  disableInteraction = false,
  sx,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for mouse position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring animations for smooth movement
  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [tiltIntensity, -tiltIntensity]),
    springConfig
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-tiltIntensity, tiltIntensity]),
    springConfig
  );

  // Scale and shadow animations
  const scale = useSpring(1, springConfig);
  const shadowScale = useSpring(1, springConfig);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disableInteraction || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize mouse position (-0.5 to 0.5)
      const x = (event.clientX - centerX) / rect.width;
      const y = (event.clientY - centerY) / rect.height;

      mouseX.set(x);
      mouseY.set(y);
    },
    [disableInteraction, mouseX, mouseY]
  );

  const handleMouseEnterCard = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disableInteraction) {
        scale.set(hoverScale);
        shadowScale.set(1.5);
      }

      if (onMouseEnter) {
        onMouseEnter(event);
      }
    },
    [disableInteraction, scale, shadowScale, hoverScale, onMouseEnter]
  );

  const handleMouseLeaveCard = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disableInteraction) {
        mouseX.set(0);
        mouseY.set(0);
        scale.set(1);
        shadowScale.set(1);
      }

      if (onMouseLeave) {
        onMouseLeave(event);
      }
    },
    [disableInteraction, mouseX, mouseY, scale, shadowScale, onMouseLeave]
  );

  const cardStyles = {
    cursor: disableInteraction ? 'default' : 'pointer',
    transformStyle: 'preserve-3d' as const,
    ...sx,
  };

  const enhancedSx = {
    ...cardStyles,
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(sx as any)?.['&:hover'],
      boxShadow: glowEffect
        ? `0 20px 40px rgba(255, 69, 0, ${shadowIntensity}), 0 0 20px rgba(255, 69, 0, 0.1)`
        : `0 20px 40px rgba(0, 0, 0, ${shadowIntensity})`,
    },
  };

  if (disableInteraction) {
    return (
      <Card
        ref={cardRef}
        sx={enhancedSx}
        onMouseEnter={handleMouseEnterCard}
        onMouseLeave={handleMouseLeaveCard}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      >
        {children}
      </Card>
    );
  }

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnterCard}
      onMouseLeave={handleMouseLeaveCard}
    >
      <Card
        sx={enhancedSx}
        component={motion.div}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', ...springConfig }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      >
        <motion.div
          style={{
            transform: 'translateZ(20px)',
            transformStyle: 'preserve-3d',
          }}
        >
          {children}
        </motion.div>
      </Card>
    </motion.div>
  );
};

// Enhanced icon button with hover effects
interface InteractiveIconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  hoverColor?: string;
  className?: string;
}

export const InteractiveIconButton: React.FC<InteractiveIconButtonProps> = ({
  children,
  onClick,
  href,
  target,
  size = 'medium',
  color = 'inherit',
  hoverColor = '#ff4500',
  className,
}) => {
  const sizeMap = {
    small: 32,
    medium: 40,
    large: 48,
  };

  const buttonSize = sizeMap[size];

  const buttonProps = href ? { as: 'a', href, target, onClick } : { as: 'button', onClick };

  return (
    <motion.div
      className={className}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...buttonProps}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: buttonSize,
        height: buttonSize,
        borderRadius: '50%',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color,
        transition: 'color 0.3s ease',
      }}
      whileHover={{
        scale: 1.1,
        color: hoverColor,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }}
      whileTap={{ scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
      }}
    >
      {children}
    </motion.div>
  );
};

export default InteractiveCard;

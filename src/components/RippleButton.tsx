import { Button, ButtonProps } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useRef, useCallback } from 'react';

interface RippleEffect {
  key: number;
  x: number;
  y: number;
  size: number;
}

interface RippleButtonProps extends ButtonProps {
  rippleColor?: string;
  rippleDuration?: number;
  children: React.ReactNode;
}

const RippleButton: React.FC<RippleButtonProps> = ({
  rippleColor = 'rgba(255, 255, 255, 0.6)',
  rippleDuration = 600,
  onClick,
  children,
  sx,
  ...props
}) => {
  const [ripples, setRipples] = useState<RippleEffect[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const nextKey = useRef(0);

  const createRipple = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;

      const newRipple: RippleEffect = {
        key: nextKey.current,
        x,
        y,
        size,
      };
      nextKey.current += 1;

      setRipples(prev => [...prev, newRipple]);

      // Remove ripple after animation completes
      setTimeout(() => {
        setRipples(prev => prev.filter(ripple => ripple.key !== newRipple.key));
      }, rippleDuration);
    },
    [rippleDuration]
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      createRipple(event);
      if (onClick) {
        onClick(event);
      }
    },
    [onClick, createRipple]
  );

  return (
    <Button
      ref={buttonRef}
      onClick={handleClick}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        ...sx,
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.key}
            initial={{
              scale: 0,
              opacity: 1,
            }}
            animate={{
              scale: 4,
              opacity: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: rippleDuration / 1000,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
              borderRadius: '50%',
              backgroundColor: rippleColor,
              pointerEvents: 'none',
              transformOrigin: 'center',
            }}
          />
        ))}
      </AnimatePresence>
    </Button>
  );
};

export default RippleButton;

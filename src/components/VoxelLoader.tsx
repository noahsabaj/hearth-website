import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useMemo } from 'react';

import { loadingConfig } from '../config/loadingConfig';
import { COLORS, TYPOGRAPHY, LAYOUT, LOADING } from '../constants';

interface VoxelLoaderProps {
  /** Current progress percentage (0-100) */
  progress?: number;
  /** Whether loading is indeterminate */
  indeterminate?: boolean;
  /** Size of the loader */
  size?: 'small' | 'medium' | 'large';
  /** Show percentage text */
  showPercentage?: boolean;
  /** Show loading tips */
  showTips?: boolean;
  /** Custom loading tips */
  tips?: string[];
  /** Tip rotation interval in ms */
  tipInterval?: number;
  /** Custom message */
  message?: string;
}

interface VoxelPosition {
  x: number;
  y: number;
  z: number;
  delay: number;
  color: string;
}

const VoxelLoader: React.FC<VoxelLoaderProps> = ({
  progress = 0,
  indeterminate = true,
  size = 'medium',
  showPercentage = true,
  showTips = true,
  tips = loadingConfig.tips.voxel,
  tipInterval = loadingConfig.timing.tipRotationInterval,
  message,
}) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [visibleVoxels, setVisibleVoxels] = useState<Set<number>>(new Set());

  const voxelSize = LOADING.sizes.voxel[size];
  const { gridSize } = LOADING.voxel;
  const gap = LOADING.voxel.voxelGap;
  const { colors } = LOADING.voxel;

  // Generate voxel positions with build order
  const voxelPositions = useMemo<VoxelPosition[]>(() => {
    const positions: VoxelPosition[] = [];
    const centerOffset = Math.floor(gridSize / 2);

    // Build from center outwards in a spiral pattern
    const buildOrder: [number, number, number][] = [];

    // Start from center and spiral outwards
    for (let layer = 0; layer <= centerOffset; layer++) {
      for (let y = -layer; y <= layer; y++) {
        for (let x = -layer; x <= layer; x++) {
          for (let z = -layer; z <= layer; z++) {
            // Only add voxels on the current layer surface
            if (Math.abs(x) === layer || Math.abs(y) === layer || Math.abs(z) === layer) {
              buildOrder.push([x + centerOffset, y + centerOffset, z + centerOffset]);
            }
          }
        }
      }
    }

    buildOrder.forEach((pos, index) => {
      const [x, y, z] = pos;
      // Assign colors based on position for visual variety
      const colorIndex = (x + y + z) % 3;
      const color =
        colorIndex === 0 ? colors.primary : colorIndex === 1 ? colors.secondary : colors.tertiary;

      positions.push({
        x: (x - centerOffset) * (voxelSize + gap),
        y: (y - centerOffset) * (voxelSize + gap),
        z: (z - centerOffset) * (voxelSize + gap),
        delay: index * LOADING.voxel.buildSpeed,
        color,
      });
    });

    return positions;
  }, [gridSize, voxelSize, gap, colors]);

  // Update visible voxels based on progress
  useEffect(() => {
    if (!indeterminate) {
      const totalVoxels = voxelPositions.length;
      const voxelsToShow = Math.floor((progress / 100) * totalVoxels);
      const newVisible = new Set<number>();
      for (let i = 0; i < voxelsToShow; i++) {
        newVisible.add(i);
      }
      setVisibleVoxels(newVisible);
    } else {
      // For indeterminate, show all voxels with animation
      voxelPositions.forEach((_, index) => {
        setTimeout(() => {
          setVisibleVoxels(prev => new Set([...prev, index]));
        }, voxelPositions[index]?.delay || 0);
      });
    }
  }, [progress, indeterminate, voxelPositions]);

  // Rotate tips
  useEffect(() => {
    if (showTips && tips.length > 1) {
      const interval = setInterval(() => {
        setCurrentTip(prev => (prev + 1) % tips.length);
      }, tipInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [tips, tipInterval, showTips]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        position: 'relative',
      }}
    >
      {/* 3D Voxel Container */}
      <Box
        sx={{
          position: 'relative',
          width: gridSize * (voxelSize + gap),
          height: gridSize * (voxelSize + gap),
          transformStyle: 'preserve-3d',
          perspective: '1000px',
        }}
      >
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateY: 360,
          }}
          transition={{
            duration: LOADING.voxel.rotationSpeed,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {voxelPositions.map((voxel, index) => (
            <AnimatePresence key={index}>
              {(indeterminate || visibleVoxels.has(index)) && (
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0,
                    x: voxel.x,
                    y: voxel.y,
                    z: voxel.z,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{
                    duration: LOADING.voxel.fadeInDuration / 1000,
                    delay: indeterminate ? voxel.delay / 1000 : 0,
                    ease: 'backOut',
                  }}
                  style={{
                    position: 'absolute',
                    width: voxelSize,
                    height: voxelSize,
                    left: '50%',
                    top: '50%',
                    marginLeft: -voxelSize / 2,
                    marginTop: -voxelSize / 2,
                    transform: `translate3d(${voxel.x}px, ${voxel.y}px, ${voxel.z}px)`,
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Voxel cube faces */}
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Front face */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: voxel.color,
                        transform: `translateZ(${voxelSize / 2}px)`,
                        boxShadow: `0 0 ${voxelSize}px ${LOADING.voxel.colors.glow}`,
                      }}
                    />
                    {/* Back face */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: voxel.color,
                        transform: `rotateY(180deg) translateZ(${voxelSize / 2}px)`,
                        opacity: 0.8,
                      }}
                    />
                    {/* Top face */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: voxel.color,
                        transform: `rotateX(90deg) translateZ(${voxelSize / 2}px)`,
                        opacity: 0.9,
                      }}
                    />
                    {/* Bottom face */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: voxel.color,
                        transform: `rotateX(-90deg) translateZ(${voxelSize / 2}px)`,
                        opacity: 0.7,
                      }}
                    />
                    {/* Right face */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: voxel.color,
                        transform: `rotateY(90deg) translateZ(${voxelSize / 2}px)`,
                        opacity: 0.85,
                      }}
                    />
                    {/* Left face */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backgroundColor: voxel.color,
                        transform: `rotateY(-90deg) translateZ(${voxelSize / 2}px)`,
                        opacity: 0.85,
                      }}
                    />
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </motion.div>
      </Box>

      {/* Progress percentage */}
      {showPercentage && !indeterminate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Typography
            variant='h6'
            sx={{
              color: COLORS.text.primary,
              fontWeight: TYPOGRAPHY.fontWeight.light,
              fontSize:
                size === 'small'
                  ? TYPOGRAPHY.fontSize.lg
                  : size === 'large'
                  ? TYPOGRAPHY.fontSize['3xl']
                  : TYPOGRAPHY.fontSize['2xl'],
            }}
          >
            {Math.round(progress)}%
          </Typography>
        </motion.div>
      )}

      {/* Custom message */}
      {message && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Typography
            variant='body1'
            sx={{
              color: COLORS.text.secondary,
              textAlign: 'center',
            }}
          >
            {message}
          </Typography>
        </motion.div>
      )}

      {/* Loading tips */}
      {showTips && tips.length > 0 && (
        <Box sx={{ height: 60, position: 'relative', width: '100%', maxWidth: 400 }}>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              style={{ position: 'absolute', width: '100%' }}
            >
              <Box
                sx={{
                  p: 2,
                  backgroundColor: COLORS.utils.shimmer,
                  borderRadius: LAYOUT.borderRadius.md,
                  border: `1px solid ${COLORS.utils.border}`,
                  backdropFilter: LAYOUT.backdropFilter.blur,
                }}
              >
                <Typography
                  variant='caption'
                  sx={{
                    color: COLORS.text.secondary,
                    display: 'block',
                    textAlign: 'center',
                  }}
                >
                  {tips[currentTip]}
                </Typography>
              </Box>
            </motion.div>
          </AnimatePresence>
        </Box>
      )}
    </Box>
  );
};

export default VoxelLoader;

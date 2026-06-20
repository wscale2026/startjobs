import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Box, BoxProps } from '@mui/material';

const MotionBox = motion.create ? motion.create(Box) : (motion as any)(Box);

interface TiltCardProps extends BoxProps {
  children: React.ReactNode;
  tiltReverse?: boolean;
  tiltMaxAngleX?: number;
  tiltMaxAngleY?: number;
  perspective?: number;
  scaleOnHover?: number;
}

export default function TiltCard({
  children,
  tiltReverse = false,
  tiltMaxAngleX = 8,
  tiltMaxAngleY = 8,
  perspective = 1000,
  scaleOnHover = 1.02,
  sx,
  ...rest
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth out the motion values with springs
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  // Map the mouse position to a rotation angle
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], tiltReverse ? [-tiltMaxAngleX, tiltMaxAngleX] : [tiltMaxAngleX, -tiltMaxAngleX]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], tiltReverse ? [tiltMaxAngleY, -tiltMaxAngleY] : [-tiltMaxAngleY, tiltMaxAngleY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <MotionBox
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      animate={{
        scale: isHovered ? scaleOnHover : 1,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      sx={{
        perspective: `${perspective}px`,
        willChange: 'transform',
        height: '100%',
        ...sx,
      }}
      {...(rest as any)}
    >
      <Box sx={{ transform: "translateZ(40px)", height: '100%', width: '100%' }}>
        {children}
      </Box>
    </MotionBox>
  );
}

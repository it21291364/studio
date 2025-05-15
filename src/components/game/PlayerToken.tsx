import type { FC } from 'react';
import { motion } from 'framer-motion'; // For animation
import { User } from 'lucide-react';

interface PlayerTokenProps {
  playerColorClass: string;
  position: { x: number; y: number }; // 0-indexed for grid cells
  size: number; // size of the token, relative to cell size
  playerName: string;
  isCurrentPlayer: boolean;
}

const PlayerToken: FC<PlayerTokenProps> = ({ playerColorClass, position, size, playerName, isCurrentPlayer }) => {
  const offset = Math.random() * 10 - 5; // Small random offset to distinguish tokens on same square

  return (
    <motion.div
      aria-label={`${playerName} token`}
      className={`absolute rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 transition-all duration-700 ease-out`}
      style={{
        width: size,
        height: size,
        left: `calc(${position.x * 100}% + ${offset}px + ${size/4}px)`, // Center token in cell
        top: `calc(${position.y * 100}% + ${offset}px + ${size/4}px)`, // Center token in cell
        zIndex: 20, // Ensure tokens are above cells but below UI elements
      }}
      initial={{ scale: 0.8, opacity: 0.8 }}
      animate={{ 
        scale: isCurrentPlayer ? 1.1 : 1, 
        opacity: 1,
        x: 0, // Framer motion will handle smooth transition based on style change
        y: 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.7 }}
    >
      <div className={`w-full h-full rounded-full ${playerColorClass} flex items-center justify-center`}>
         <User size={size * 0.6} className="text-white/80" />
      </div>
    </motion.div>
  );
};

export default PlayerToken;

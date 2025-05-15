import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // For animation
import { User } from 'lucide-react';

interface PlayerTokenProps {
  playerColorClass: string;
  position: { x: number; y: number }; // 0-indexed for grid cells
  size: number; // size of the token, in pixels
  playerName: string;
  isCurrentPlayer: boolean;
  cellSizePercentage: number; // Width/height of a cell as a percentage of the board (e.g., 10 for 10%)
}

const PlayerToken: FC<PlayerTokenProps> = ({ playerColorClass, position, size, playerName, isCurrentPlayer, cellSizePercentage }) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Generate random offset only on the client-side after hydration
    setOffset(Math.random() * 10 - 5);
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    <motion.div
      aria-label={`${playerName} token`}
      className={`absolute rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 transition-all duration-700 ease-out`}
      style={{
        width: size, // e.g., 24px
        height: size, // e.g., 24px
        left: `calc(${position.x * cellSizePercentage}% + ${offset}px + ${size/4}px)`, // Use cellSizePercentage for correct base positioning
        top: `calc(${position.y * cellSizePercentage}% + ${offset}px + ${size/4}px)`,   // Use cellSizePercentage for correct base positioning
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

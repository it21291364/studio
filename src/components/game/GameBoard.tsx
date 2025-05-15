import type { FC }from 'react';
import { BOARD_SIZE, SNAKES_LADDERS_CONFIG, type SnakeOrLadder } from '@/config/game-config';
import PlayerToken from './PlayerToken';
import type { Player } from '@/app/page'; // Assuming Player type is exported from page.tsx
import { ArrowDownRight, ArrowUpRight, Target } from 'lucide-react';

interface GameBoardProps {
  players: Player[];
  currentPlayerId: string | null;
}

// Helper function to get row and column for a square number
export const getSquareCoordinates = (squareNumber: number): { x: number; y: number } => {
  const zeroBasedSquare = squareNumber - 1;
  let row = Math.floor(zeroBasedSquare / BOARD_SIZE); // 0-indexed from bottom
  let col = zeroBasedSquare % BOARD_SIZE;

  if (row % 2 !== 0) { // Odd rows (0-indexed) go from right to left
    col = BOARD_SIZE - 1 - col;
  }
  // Convert row to be 0-indexed from top for CSS grid display
  const displayRow = BOARD_SIZE - 1 - row;
  return { x: col, y: displayRow }; // x is col, y is displayRow
};

const GameBoard: FC<GameBoardProps> = ({ players, currentPlayerId }) => {
  const cells = [];
  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const squareNumber = i + 1;
    const coords = getSquareCoordinates(squareNumber);
    const actualNumber = (BOARD_SIZE - 1 - coords.y) * BOARD_SIZE + ( (BOARD_SIZE - 1 - coords.y) % 2 === 0 ? coords.x + 1 : BOARD_SIZE - coords.x);
    
    const isEvenRow = Math.floor((actualNumber-1)/BOARD_SIZE) % 2 === 0;
    const isEvenCellOverall = (coords.x + coords.y) % 2 === 0;
    
    const cellBg = isEvenCellOverall ? 'bg-cell-light' : 'bg-cell-dark';

    cells.push(
      <div
        key={`cell-${actualNumber}`}
        className={`aspect-square flex items-center justify-center border border-border/30 ${cellBg} relative shadow-inner`}
        style={{
          gridColumnStart: coords.x + 1,
          gridRowStart: coords.y + 1,
        }}
      >
        <span className="text-xs md:text-sm font-medium text-foreground/70">{actualNumber}</span>
        {SNAKES_LADDERS_CONFIG.map(sl => {
          if (sl.start === actualNumber) {
            return sl.type === 'ladder' ? 
              <ArrowUpRight key={`sl-icon-${sl.start}`} className="absolute text-ladder-color opacity-70 w-1/2 h-1/2" /> : 
              <ArrowDownRight key={`sl-icon-${sl.start}`} className="absolute text-snake-color opacity-70 w-1/2 h-1/2" />;
          }
          if (sl.end === actualNumber && sl.type === 'ladder') {
             return <Target key={`sl-target-${sl.end}`} className="absolute text-ladder-color/50 opacity-50 w-1/3 h-1/3" />;
          }
          if (sl.end === actualNumber && sl.type === 'snake') {
             return <Target key={`sl-target-${sl.end}`} className="absolute text-snake-color/50 opacity-50 w-1/3 h-1/3" />;
          }
          return null;
        })}
      </div>
    );
  }

  const cellSizePercentage = 100 / BOARD_SIZE; // Each cell is 10% of board width/height

  return (
    <div className="relative w-full aspect-square bg-board-background p-2 md:p-4 rounded-lg shadow-xl">
      <div
        className="grid gap-0 overflow-hidden rounded"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
        }}
      >
        {cells}
      </div>
      {/* Snakes and Ladders SVG overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        {SNAKES_LADDERS_CONFIG.map((sl) => {
          const startCoords = getSquareCoordinates(sl.start);
          const endCoords = getSquareCoordinates(sl.end);

          const x1 = (startCoords.x + 0.5) * cellSizePercentage;
          const y1 = (startCoords.y + 0.5) * cellSizePercentage;
          const x2 = (endCoords.x + 0.5) * cellSizePercentage;
          const y2 = (endCoords.y + 0.5) * cellSizePercentage;
          
          const color = sl.type === 'ladder' ? 'hsl(var(--ladder-color))' : 'hsl(var(--snake-color))';
          const strokeWidth = "max(3px, 0.6vmin)"; // Responsive stroke width
          const arrowId = `arrow-${sl.type}-${sl.start}`;

          return (
            <g key={`sl-${sl.start}-${sl.end}`}>
              <defs>
                <marker
                  id={arrowId}
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                  fill={color}
                >
                  <path d="M0,0 L0,6 L6,3 z" />
                </marker>
              </defs>
              <line
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={sl.type === 'ladder' ? "none" : "4 2"}
                opacity="0.6"
                markerEnd={`url(#${arrowId})`}
              />
            </g>
          );
        })}
      </svg>
      {/* Player Tokens */}
      {players.map((player) => {
        const coords = getSquareCoordinates(player.position);
        // Token size relative to cell size, e.g., 60% of cell width
        const tokenSize = `max(1.5rem, ${cellSizePercentage * 0.006 * 100}vmin)`; 
        return (
          <PlayerToken
            key={player.id}
            playerName={player.name}
            playerColorClass={player.id === 'player1' ? 'token-p1' : 'token-p2'}
            position={coords}
            size={parseFloat(tokenSize)} // This needs a fixed number or better calculation
            isCurrentPlayer={player.id === currentPlayerId}
          />
        );
      })}
    </div>
  );
};

export default GameBoard;

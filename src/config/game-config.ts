export const BOARD_SIZE = 10; // 10x10 grid
export const WINNING_POSITION = 100;

export interface SnakeOrLadder {
  start: number;
  end: number;
  type: 'snake' | 'ladder';
}

export const SNAKES_LADDERS_CONFIG: SnakeOrLadder[] = [
  // Ladders
  { start: 4, end: 25, type: 'ladder' },
  { start: 13, end: 46, type: 'ladder' },
  { start: 33, end: 49, type: 'ladder' },
  { start: 42, end: 63, type: 'ladder' },
  { start: 50, end: 69, type: 'ladder' },
  { start: 62, end: 81, type: 'ladder' },
  { start: 74, end: 92, type: 'ladder' },
  
  // Snakes
  { start: 27, end: 5, type: 'snake' },
  { start: 40, end: 3, type: 'snake' },
  { start: 43, end: 18, type: 'snake' },
  { start: 54, end: 31, type: 'snake' },
  { start: 66, end: 45, type: 'snake' },
  { start: 76, end: 58, type: 'snake' },
  { start: 89, end: 53, type: 'snake' },
  { start: 99, end: 41, type: 'snake' },
];

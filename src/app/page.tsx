'use client';

import { useState, useEffect, useCallback } from 'react';
import GameBoard, { getSquareCoordinates } from '@/components/game/GameBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw, Crown, UserCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { BOARD_SIZE, WINNING_POSITION, SNAKES_LADDERS_CONFIG, type SnakeOrLadder } from '@/config/game-config';
import Confetti from 'react-confetti'; // Added for winner celebration
import { motion, AnimatePresence } from 'framer-motion';

export interface Player {
  id: 'player1' | 'player2';
  name: string;
  position: number;
  tokenClass: string;
}

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export default function SnakesAndLaddersPage() {
  const initialPlayersState: Player[] = [
    { id: 'player1', name: 'Player 1', position: 1, tokenClass: 'token-p1' },
    { id: 'player2', name: 'Player 2', position: 1, tokenClass: 'token-p2' },
  ];

  const [players, setPlayers] = useState<Player[]>(initialPlayersState);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [animatedDiceValue, setAnimatedDiceValue] = useState<number>(1);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [gameMessage, setGameMessage] = useState("Player 1's turn. Roll the dice!");
  const [showWinnerDialog, setShowWinnerDialog] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  const { toast } = useToast();

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    if (typeof window !== 'undefined') {
      handleResize(); // Initial size
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const resetGame = useCallback(() => {
    setPlayers(initialPlayersState);
    setCurrentPlayerIndex(0);
    setDiceValue(null);
    setAnimatedDiceValue(1);
    setWinner(null);
    setIsRolling(false);
    setGameMessage("Player 1's turn. Roll the dice!");
    setShowWinnerDialog(false);
  }, [initialPlayersState]);

  const handleRollDice = () => {
    if (isRolling || winner) return;

    setIsRolling(true);
    setDiceValue(null); // Clear previous dice value from display immediately

    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setAnimatedDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 10) { // Animate for ~1 second
        clearInterval(rollInterval);
        const finalDiceValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalDiceValue);
        setAnimatedDiceValue(finalDiceValue);
        movePlayer(finalDiceValue);
      }
    }, 100);
  };

  const movePlayer = (rolledValue: number) => {
    const currentPlayer = players[currentPlayerIndex];
    let newPosition = currentPlayer.position + rolledValue;

    // Player must land exactly on WINNING_POSITION
    if (newPosition > WINNING_POSITION) {
      newPosition = currentPlayer.position; // Stay in place
      toast({ title: "Oops!", description: `Rolled ${rolledValue}. Need ${WINNING_POSITION - currentPlayer.position} to win. Stay put!` });
    } else {
       toast({ title: `${currentPlayer.name} rolled a ${rolledValue}`, description: `Moving from ${currentPlayer.position} to ${newPosition}` });
    }
    
    // Update player position visually first (for animation)
    setPlayers(prevPlayers => prevPlayers.map(p => p.id === currentPlayer.id ? { ...p, position: newPosition } : p));

    // Delay for animation and then check for snakes/ladders
    setTimeout(() => {
      const snakeOrLadder = SNAKES_LADDERS_CONFIG.find(sl => sl.start === newPosition);
      if (snakeOrLadder) {
        newPosition = snakeOrLadder.end;
        const type = snakeOrLadder.type === 'ladder' ? ' climbed a ladder' : ' slid down a snake';
        toast({ title: `Woah! ${currentPlayer.name}${type}!`, description: `Moved to ${newPosition}` });
        // Update player position again for snake/ladder movement
        setPlayers(prevPlayers => prevPlayers.map(p => p.id === currentPlayer.id ? { ...p, position: newPosition } : p));
      }

      // Final position update in state & check for winner
      setTimeout(() => {
        setPlayers(prevPlayers => prevPlayers.map(p => p.id === currentPlayer.id ? { ...p, position: newPosition } : p));

        if (newPosition === WINNING_POSITION) {
          setWinner(currentPlayer);
          setGameMessage(`${currentPlayer.name} wins! Congratulations!`);
          setShowWinnerDialog(true);
          setIsRolling(false);
        } else {
          const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
          setCurrentPlayerIndex(nextPlayerIndex);
          setGameMessage(`${players[nextPlayerIndex].name}'s turn. Roll the dice!`);
          setIsRolling(false);
        }
      }, 700); // Allow time for snake/ladder animation
    }, 700); // Allow time for initial move animation
  };

  const DiceIcon = diceIcons[animatedDiceValue - 1] || Dice1;

  return (
    <>
      {winner && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}
      <Toaster />
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 selection:bg-accent selection:text-accent-foreground">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-blue-500 to-purple-600">
            Snakes &amp; Ladders Duel
          </h1>
          <p className="text-muted-foreground mt-2">A classic game of luck and strategy.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          <div className="lg:col-span-2">
            <GameBoard players={players} currentPlayerId={players[currentPlayerIndex].id} />
          </div>

          <Card className="shadow-xl bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl"><UserCircle /> Game Controls</CardTitle>
              <CardDescription>{gameMessage}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={animatedDiceValue}
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block p-4 bg-accent/10 rounded-lg"
                  >
                    <DiceIcon size={80} className="text-accent" />
                  </motion.div>
                </AnimatePresence>
                {diceValue !== null && (
                  <p className="text-lg font-semibold mt-2">You rolled: {diceValue}</p>
                )}
              </div>

              <Button
                onClick={handleRollDice}
                disabled={isRolling || !!winner}
                className="w-full text-lg py-6"
                size="lg"
              >
                {isRolling ? 'Rolling...' : (winner ? 'Game Over' : `Roll Dice (${players[currentPlayerIndex].name})`)}
              </Button>

              <div className="space-y-2">
                {players.map(player => (
                  <div key={player.id} className={`p-3 rounded-md flex justify-between items-center shadow ${player.id === players[currentPlayerIndex].id && !winner ? 'ring-2 ring-accent' : 'opacity-70'} bg-secondary/30`}>
                    <span className="font-semibold flex items-center">
                      <span className={`w-4 h-4 rounded-full mr-2 ${player.tokenClass}`}></span>
                      {player.name}
                    </span>
                    <span className="font-bold text-primary-foreground/80">Position: {player.position}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={resetGame} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" /> Restart Game
              </Button>
            </CardFooter>
          </Card>
        </div>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Snakes &amp; Ladders Duel. Enjoy the game!</p>
        </footer>
      </div>

      <AlertDialog open={showWinnerDialog} onOpenChange={setShowWinnerDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-2xl"><Crown className="text-yellow-400" /> Game Over!</AlertDialogTitle>
            <AlertDialogDescription>
              {winner ? `${winner.name} has reached square ${WINNING_POSITION} and won the game! Congratulations!` : "The game has ended."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={resetGame}>Play Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

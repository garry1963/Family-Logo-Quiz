import React, { useState, useEffect } from 'react';
import { Users, Play, Plus, Trash2, Trophy, ArrowRight, RotateCcw, CheckCircle2, Sparkles, Clock, Star } from 'lucide-react';
import { LogoRecord, ProfileRecord, CategoryRecord } from '../types';
import { sound } from '../services/soundEffects';
import confetti from 'canvas-confetti';
import { LogoDisplay } from './LogoDisplay';
import { LetterKeyboard } from './LetterKeyboard';

interface FamilyGameNightProps {
  profiles: ProfileRecord[];
  logos: LogoRecord[];
  categories: CategoryRecord[];
  onExit: () => void;
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
}

export const FamilyGameNight: React.FC<FamilyGameNightProps> = ({
  profiles,
  logos,
  categories,
  onExit
}) => {
  // Setup state
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'turn_announcement' | 'finished'>('setup');
  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: profiles[0]?.displayName || 'Player 1', avatar: profiles[0]?.avatar || '👨‍💼', score: 0 },
    { id: 'p2', name: profiles[1]?.displayName || 'Player 2', avatar: profiles[1]?.avatar || '👩‍🦰', score: 0 }
  ]);
  const [roundCount, setRoundCount] = useState<number>(10);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timeLimit, setTimeLimit] = useState<number>(0); // 0 = no timer

  // Active game state
  const [gameLogos, setGameLogos] = useState<LogoRecord[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState<number>(0);
  const [currentInput, setCurrentInput] = useState<string[]>([]);
  const [selectedTileIndices, setSelectedTileIndices] = useState<number[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [isIncorrectShake, setIsIncorrectShake] = useState(false);
  const [isSolvedCurrent, setIsSolvedCurrent] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Add guest player
  const handleAddPlayer = () => {
    if (players.length >= 8) return;
    const avatars = ['👦', '👧', '🦁', '🚀', '🦄', '🎨', '🏎️', '🍕'];
    const newP: Player = {
      id: `player-${Date.now()}`,
      name: `Player ${players.length + 1}`,
      avatar: avatars[players.length % avatars.length],
      score: 0
    };
    setPlayers([...players, newP]);
    sound.playTap();
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 2) return;
    setPlayers(players.filter(p => p.id !== id));
    sound.playDelete();
  };

  // Start game
  const handleStartGame = () => {
    sound.playTap();
    let pool = logos.filter(l => l.active !== false);
    if (selectedCategory !== 'all') {
      pool = pool.filter(l => l.categoryId === selectedCategory);
    }
    // Randomize
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const totalPuzzlesNeeded = roundCount * players.length;
    const selected = shuffled.slice(0, Math.min(totalPuzzlesNeeded, shuffled.length));

    setGameLogos(selected);
    setCurrentRoundIdx(0);
    setCurrentPlayerIdx(0);
    setPlayers(players.map(p => ({ ...p, score: 0 })));
    setGameState('turn_announcement');
  };

  // Setup current turn
  const activeLogo = gameLogos[currentRoundIdx] || logos[0];
  const currentPlayer = players[currentPlayerIdx] || players[0];

  useEffect(() => {
    if (gameState === 'playing') {
      setIsSolvedCurrent(false);
      setRevealedIndices([]);
      setSelectedTileIndices([]);
      const primaryAns = activeLogo.acceptedAnswers[0].toUpperCase();
      const slots = primaryAns.split('').map(c => (/[^A-Z0-9]/.test(c) ? c : ''));
      setCurrentInput(slots);

      if (timeLimit > 0) {
        setSecondsRemaining(timeLimit);
      }
    }
  }, [gameState, currentRoundIdx, currentPlayerIdx, activeLogo]);

  // Turn timer
  useEffect(() => {
    if (gameState !== 'playing' || timeLimit === 0 || isSolvedCurrent) return;
    if (secondsRemaining <= 0) {
      // Time up
      sound.playIncorrect();
      handleNextTurn(false);
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState, secondsRemaining, timeLimit, isSolvedCurrent]);

  const handleLetterTap = (letter: string, tileIndex: number) => {
    if (isSolvedCurrent) return;
    const primaryAns = activeLogo.acceptedAnswers[0].toUpperCase();
    const nextSlot = currentInput.findIndex((c, i) => !c && !/[^A-Z0-9]/.test(primaryAns[i]));
    if (nextSlot !== -1) {
      const updated = [...currentInput];
      updated[nextSlot] = letter;
      setCurrentInput(updated);
      setSelectedTileIndices([...selectedTileIndices, tileIndex]);

      const isComplete = updated.every((c, i) => c !== '' || /[^A-Z0-9]/.test(primaryAns[i]));
      if (isComplete) {
        const cleanEntered = updated.join('').replace(/[^A-Z0-9]/g, '').toUpperCase();
        const isMatch = activeLogo.acceptedAnswers.some(ans => 
          ans.replace(/[^A-Z0-9]/g, '').toUpperCase() === cleanEntered
        );
        if (isMatch) {
          sound.playCorrect();
          setIsSolvedCurrent(true);
          // Award 100 points
          const updatedPlayers = [...players];
          updatedPlayers[currentPlayerIdx].score += 100;
          setPlayers(updatedPlayers);
        } else {
          sound.playIncorrect();
          setIsIncorrectShake(true);
          setTimeout(() => setIsIncorrectShake(false), 500);
        }
      }
    }
  };

  const handleBackspace = () => {
    if (isSolvedCurrent) return;
    const primaryAns = activeLogo.acceptedAnswers[0].toUpperCase();
    for (let i = currentInput.length - 1; i >= 0; i--) {
      if (currentInput[i] && !/[^A-Z0-9]/.test(primaryAns[i])) {
        const updated = [...currentInput];
        updated[i] = '';
        setCurrentInput(updated);
        const tiles = [...selectedTileIndices];
        tiles.pop();
        setSelectedTileIndices(tiles);
        break;
      }
    }
  };

  const handleClear = () => {
    if (isSolvedCurrent) return;
    const primaryAns = activeLogo.acceptedAnswers[0].toUpperCase();
    setCurrentInput(primaryAns.split('').map(c => (/[^A-Z0-9]/.test(c) ? c : '')));
    setSelectedTileIndices([]);
  };

  const handleNextTurn = (wasCorrect: boolean) => {
    sound.playTap();
    const nextRound = currentRoundIdx + 1;
    const nextPlayer = (currentPlayerIdx + 1) % players.length;

    if (nextRound >= gameLogos.length || nextRound >= roundCount * players.length) {
      setGameState('finished');
      try {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
      } catch {}
      sound.playFanfare();
    } else {
      setCurrentRoundIdx(nextRound);
      setCurrentPlayerIdx(nextPlayer);
      setGameState('turn_announcement');
    }
  };

  return (
    <div id="family-game-night-container" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto select-none">
      {/* 1. SETUP STATE */}
      {gameState === 'setup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2.5">
                <Users className="w-8 h-8 text-amber-400" />
                Family Game Night
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Pass-the-tablet local multiplayer party for 2 to 8 players!
              </p>
            </div>
            <button
              onClick={onExit}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
            >
              Exit to Menu
            </button>
          </div>

          {/* Player Roster */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
                Players Roster ({players.length} / 8)
              </label>
              {players.length < 8 && (
                <button
                  onClick={handleAddPlayer}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 text-blue-300 hover:bg-blue-600/40 text-xs font-bold border border-blue-500/30"
                >
                  <Plus className="w-4 h-4" /> Add Player
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-800/80 border border-slate-700 rounded-2xl">
                  <span className="text-2xl p-1 bg-slate-700 rounded-xl">{p.avatar}</span>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => {
                      const updated = [...players];
                      updated[idx].name = e.target.value;
                      setPlayers(updated);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm font-bold focus:outline-none focus:border-blue-500"
                  />
                  {players.length > 2 && (
                    <button
                      onClick={() => handleRemovePlayer(p.id)}
                      className="p-2 text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Game Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Rounds Per Player
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoundCount(r)}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      roundCount === r
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {r} Turns
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none"
              >
                <option value="all">All Mixed Brands</option>
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.iconEmoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Turn Timer
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 30, 45].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeLimit(t)}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      timeLimit === t
                        ? 'bg-blue-600 text-white border-blue-400 font-extrabold'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {t === 0 ? 'No Timer' : `${t}s`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Launch Button */}
          <button
            onClick={handleStartGame}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/20 transition-all active:scale-98 min-h-[54px]"
          >
            START GAME NIGHT 🚀
          </button>
        </div>
      )}

      {/* 2. TURN ANNOUNCEMENT INTERSTITIAL */}
      {gameState === 'turn_announcement' && (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-6 animate-pop">
          <div className="text-6xl sm:text-7xl p-4 bg-slate-800 rounded-3xl inline-block border-2 border-slate-700 shadow-xl">
            {currentPlayer.avatar}
          </div>

          <div>
            <div className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1">
              Pass Tablet To
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
              {currentPlayer.name}'s Turn!
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Question {currentRoundIdx + 1} of {gameLogos.length} · Current Score: {currentPlayer.score} pts
            </p>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              setGameState('playing');
            }}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95"
          >
            I'M READY! START PUZZLE
          </button>
        </div>
      )}

      {/* 3. ACTIVE PLAYING PUZZLE */}
      {gameState === 'playing' && (
        <div className="space-y-4">
          {/* Top Bar for Game Night */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{currentPlayer.avatar}</span>
              <div>
                <span className="text-sm font-black text-white">{currentPlayer.name}</span>
                <span className="text-xs text-amber-400 font-bold ml-2">Score: {currentPlayer.score}</span>
              </div>
            </div>

            {timeLimit > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-mono font-black text-sm ${
                secondsRemaining <= 10 ? 'bg-red-500/20 text-red-400 border border-red-500 animate-pulse' : 'bg-slate-800 text-white'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{secondsRemaining}s</span>
              </div>
            )}

            <span className="text-xs text-slate-400 font-bold">
              Round {currentRoundIdx + 1} / {gameLogos.length}
            </span>
          </div>

          {/* Puzzle board */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 flex items-center justify-center">
              <LogoDisplay
                logo={activeLogo}
                gameMode="classic"
                isSolved={isSolvedCurrent}
                isFavourite={false}
                onToggleFavourite={() => {}}
              />
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <LetterKeyboard
                acceptedAnswers={activeLogo.acceptedAnswers}
                currentInput={currentInput}
                onLetterTap={handleLetterTap}
                onBackspace={handleBackspace}
                onClear={handleClear}
                revealedIndices={revealedIndices}
                removedTileIndices={[]}
                selectedTileIndices={selectedTileIndices}
                isIncorrectShake={isIncorrectShake}
                isSolved={isSolvedCurrent}
              />

              {isSolvedCurrent && (
                <button
                  onClick={() => handleNextTurn(true)}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 animate-pop"
                >
                  <span>Correct! Pass to Next Player (+100 pts)</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. FINISHED PODIUM */}
      {gameState === 'finished' && (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-amber-400 font-black text-sm uppercase tracking-widest">
            <Trophy className="w-6 h-6" /> Game Night Complete!
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
            Final Scores & Winner!
          </h2>

          <div className="space-y-3 max-w-md mx-auto">
            {[...players].sort((a, b) => b.score - a.score).map((p, rank) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-4 rounded-2xl border ${
                  rank === 0
                    ? 'bg-amber-950/40 border-amber-400 text-amber-300 shadow-lg'
                    : 'bg-slate-800/80 border-slate-700 text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-lg w-6">#{rank + 1}</span>
                  <span className="text-3xl">{p.avatar}</span>
                  <span className="font-bold text-base">{p.name}</span>
                </div>
                <span className="font-display font-black text-xl text-amber-400">
                  {p.score} pts
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setGameState('setup')}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              Play Again
            </button>
            <button
              onClick={onExit}
              className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold"
            >
              Exit to Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

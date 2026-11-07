import React, { useState, useEffect, useCallback } from 'react';
import { DinoRunnerCanvas, GameMode } from './components/DinoRunnerCanvas';
import { CheckpointModal } from './components/CheckpointModal';
import { BossBattlePanel } from './components/BossBattlePanel';
import { CHECKPOINTS } from './data/teamupData';
import { soundEngine } from './audio/soundEngine';

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>('START_SCREEN');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState<number>(0);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<number[]>([]);

  // HUD Metrics
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(1250);
  const [lives, setLives] = useState<number>(5);

  // Audio & Accessibility Controls
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [bgmEnabled, setBgmEnabled] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.55);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  // Boss Battle State
  const [bossHp, setBossHp] = useState<number>(100);
  const [bossEffect, setBossEffect] = useState<'none' | 'player_attack' | 'boss_attack'>('none');
  const [finalQuizScore, setFinalQuizScore] = useState<number>(0);
  const [answersHistory, setAnswersHistory] = useState<
    { qIdx: number; chosen: number; correct: boolean }[]
  >([]);

  // Sync High Score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  // Start Welcome Menu Music when on START_SCREEN
  useEffect(() => {
    if (gameMode === 'START_SCREEN') {
      soundEngine.startBGM('welcome');
    }
  }, [gameMode]);

  // Keyboard shortcut 'P' or 'Escape' to Pause / Resume while RUNNING
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'KeyP' || e.code === 'Escape') && gameMode === 'RUNNING') {
        e.preventDefault();
        setIsPaused((prev) => {
          const next = !prev;
          soundEngine.playPauseToggle(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode]);

  // Start Game Handler
  const handleStartGame = useCallback(() => {
    soundEngine.initOnUserGesture();
    soundEngine.setMuted(soundMuted);
    soundEngine.setBgmEnabled(bgmEnabled);
    soundEngine.setVolume(volume);
    soundEngine.playClick();
    soundEngine.startBGM('runner', true);

    setIsPaused(false);
    setScore(0);
    setLives(5);
    setCurrentCheckpointIndex(0);
    setCompletedCheckpoints([]);
    setBossHp(100);
    setGameMode('RUNNING');
  }, [soundMuted, bgmEnabled, volume]);

  // Exit to Main Menu Handler
  const handleExitToMenu = useCallback(() => {
    soundEngine.playClick();
    setIsPaused(false);
    soundEngine.startBGM('welcome', true);
    setGameMode('START_SCREEN');
  }, []);

  // Pause / Resume Handler
  const handleTogglePause = useCallback(() => {
    if (gameMode !== 'RUNNING') return;
    setIsPaused((prev) => {
      const next = !prev;
      soundEngine.playPauseToggle(next);
      return next;
    });
  }, [gameMode]);

  // Triggered when the Dinosaur jumps over the active cactus and lands
  const handleCheckpointTriggered = useCallback((cpIdx: number) => {
    setIsPaused(false);
    setCompletedCheckpoints((prev) => (prev.includes(cpIdx) ? prev : [...prev, cpIdx]));
    setGameMode('CHECKPOINT_MODAL');
  }, []);

  // Next / Continue Running inside CheckpointModal
  // NOTE: Does NOT restart 'runner' BGM so music continues seamlessly between cacti!
  const handleNextCheckpoint = useCallback(() => {
    const nextIdx = currentCheckpointIndex + 1;
    if (nextIdx < CHECKPOINTS.length) {
      setCurrentCheckpointIndex(nextIdx);
      setIsPaused(false);
      soundEngine.startBGM('runner', false); // false = keep playing seamlessly without resetting!
      setGameMode('RUNNING');
    } else {
      // All 12 educational checkpoints completed! Enter Final Boss Challenge
      soundEngine.playBossEntry();
      soundEngine.startBGM('boss', true);
      setBossHp(100);
      setLives(5);
      setGameMode('BOSS_QUIZ');
    }
  }, [currentCheckpointIndex]);

  // Select specific checkpoint inside modal or pause menu
  const handleSelectCheckpoint = useCallback((idx: number) => {
    setIsPaused(false);
    setCurrentCheckpointIndex(idx);
    setCompletedCheckpoints((prev) => (prev.includes(idx) ? prev : [...prev, idx]));
    setGameMode('CHECKPOINT_MODAL');
  }, []);

  // Score increment from running/jumping
  const handleScoreIncrement = useCallback((delta: number) => {
    setScore((prev) => prev + delta);
  }, []);

  // Sound toggles
  const toggleSoundMute = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    soundEngine.setMuted(next);
  };

  const toggleBgm = () => {
    const next = !bgmEnabled;
    setBgmEnabled(next);
    soundEngine.setBgmEnabled(next);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundEngine.setVolume(val);
  };

  // Boss Battle Handlers
  const handleCorrectQuizAnswer = () => {
    setBossHp((hp) => Math.max(0, hp - 10));
    setScore((s) => s + 100);
    setBossEffect('player_attack');
    setTimeout(() => setBossEffect('none'), 550);
  };

  const handleWrongQuizAnswer = () => {
    setLives((l) => Math.max(0, l - 1));
    setBossEffect('boss_attack');
    setTimeout(() => setBossEffect('none'), 550);
  };

  const handleQuizComplete = (
    quizScore: number,
    log: { qIdx: number; chosen: number; correct: boolean }[]
  ) => {
    setFinalQuizScore(quizScore);
    setAnswersHistory(log);
    if (quizScore >= 70) {
      soundEngine.playVictory();
      setGameMode('VICTORY');
    } else {
      soundEngine.playGameOver();
      setGameMode('GAME_OVER');
    }
  };

  const handleRetryQuiz = () => {
    soundEngine.playBossEntry();
    soundEngine.startBGM('boss', true);
    setBossHp(100);
    setLives(5);
    setGameMode('BOSS_QUIZ');
  };

  const formatScore = (val: number) => String(Math.floor(val)).padStart(5, '0');
  const activeCheckpoint = CHECKPOINTS[currentCheckpointIndex] || CHECKPOINTS[0];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#f7f7f7] text-[#202124] flex flex-col select-none">
      {/* Classic Game HUD Header */}
      <header className="z-20 bg-[#f7f7f7] border-b-2 border-[#535353] px-4 md:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand & Current Level Indicator */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleExitToMenu}
            className="font-pixel text-xs md:text-sm text-[#202124] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            title="Return to Main Menu"
          >
            TEAMUP · BACKEND RUNNER
          </button>

          <div className="hidden lg:flex items-center gap-2 text-xs font-code text-[#535353]">
            <span>·</span>
            <span className="font-bold text-[#202124]">
              LEVEL: {Math.min(currentCheckpointIndex + 1, CHECKPOINTS.length)}/{CHECKPOINTS.length} ({activeCheckpoint.code})
            </span>
            <span>·</span>
            <span>
              CHECKPOINTS: {completedCheckpoints.length}/{CHECKPOINTS.length}
            </span>
            <span>·</span>
            <span className="text-[#202124] font-bold">
              LIVES: {'♥'.repeat(Math.max(0, lives))}
              {'♡'.repeat(Math.max(0, 5 - lives))}
            </span>
          </div>
        </div>

        {/* Center/Right: Pause Button, Audio Controls & Classic HI Score Readout */}
        <div className="flex items-center gap-2.5 md:gap-3.5 flex-wrap">
          {gameMode === 'RUNNING' && (
            <>
              <button
                onClick={handleTogglePause}
                className={`px-3.5 py-1.5 border-2 border-[#202124] font-pixel text-[10px] whitespace-nowrap cursor-pointer ${
                  isPaused
                    ? 'bg-[#202124] text-[#f7f7f7]'
                    : 'bg-white text-[#202124] hover:bg-[#ebebeb]'
                }`}
                title="Open Pause Menu (Shortcut: P or ESC)"
              >
                {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  handleCheckpointTriggered(currentCheckpointIndex);
                }}
                className="retro-btn-secondary px-2.5 py-1 font-code text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                Open {activeCheckpoint.code} Panel
              </button>
            </>
          )}

          {/* Sound On/Off */}
          <button
            onClick={toggleSoundMute}
            className="px-2.5 py-1 border-2 border-[#202124] bg-white font-code text-xs font-bold whitespace-nowrap cursor-pointer"
            title="Toggle Sound Effects & Audio"
          >
            SFX: {soundMuted ? 'OFF' : 'ON'}
          </button>

          {/* BGM Toggle */}
          <button
            onClick={toggleBgm}
            className="px-2.5 py-1 border-2 border-[#202124] bg-white font-code text-xs font-bold whitespace-nowrap hidden sm:inline-block cursor-pointer"
            title="Toggle 8-Bit Background Music"
          >
            BGM: {bgmEnabled && !soundMuted ? 'ON' : 'OFF'}
          </button>

          {/* Volume Slider */}
          <label className="hidden xl:flex items-center gap-1.5 font-code text-xs text-[#535353]">
            <span>VOL</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 accent-[#202124] cursor-pointer"
            />
          </label>

          {/* Reduced Motion Toggle */}
          <button
            onClick={() => setReducedMotion((r) => !r)}
            className="px-2.5 py-1 border-2 border-[#535353] bg-white font-code text-xs hidden md:inline-block whitespace-nowrap cursor-pointer"
            title="Toggle Reduced Motion"
          >
            MOTION: {reducedMotion ? 'REDUCED' : 'FULL'}
          </button>

          {/* Classic Chrome Dino HI Score Readout */}
          <div className="font-pixel text-xs md:text-sm text-[#535353] tracking-wider whitespace-nowrap tabular-nums">
            HI {formatScore(highScore)}{' '}
            <span className="text-[#202124]">{formatScore(score)}</span>
          </div>
        </div>
      </header>

      {/* Checkpoint Progress Bar Strip */}
      <div className="z-20 bg-[#ebebeb] border-b border-[#535353] px-4 md:px-6 py-1.5 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {CHECKPOINTS.map((cp, idx) => {
            const isDone = completedCheckpoints.includes(idx);
            const isCurrent = idx === currentCheckpointIndex && gameMode !== 'START_SCREEN';
            return (
              <button
                key={cp.id}
                onClick={() => {
                  soundEngine.initOnUserGesture();
                  soundEngine.playClick();
                  handleSelectCheckpoint(idx);
                }}
                className={`px-2 py-0.5 font-code text-[11px] border transition-colors whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-[#202124] text-[#f7f7f7] border-[#202124] font-bold'
                    : isDone
                    ? 'bg-white text-[#202124] border-[#202124] font-bold'
                    : 'bg-[#f7f7f7] text-[#757575] border-[#cfcfcf] hover:border-[#535353]'
                }`}
                title={`${cp.levelLabel}: ${cp.title}`}
              >
                {isDone ? '✓ ' : ''}
                {cp.code}
              </button>
            );
          })}
        </div>

        {/* Final Boss Status Indicator */}
        <button
          disabled={completedCheckpoints.length < CHECKPOINTS.length}
          onClick={() => {
            if (completedCheckpoints.length >= CHECKPOINTS.length) {
              soundEngine.playBossEntry();
              soundEngine.startBGM('boss', true);
              setGameMode('BOSS_QUIZ');
            }
          }}
          className={`px-2.5 py-0.5 font-pixel text-[10px] border whitespace-nowrap ${
            completedCheckpoints.length >= CHECKPOINTS.length
              ? 'bg-[#202124] text-[#f7f7f7] border-[#202124] cursor-pointer'
              : 'bg-[#e0e0e0] text-[#757575] border-[#cfcfcf] cursor-not-allowed'
          }`}
          title={
            completedCheckpoints.length >= CHECKPOINTS.length
              ? 'Enter Final Boss Quiz'
              : 'Complete all 12 checkpoints to unlock the Final Boss!'
          }
        >
          {completedCheckpoints.length >= CHECKPOINTS.length
            ? '⚔ FINAL BOSS UNLOCKED'
            : `🔒 BOSS (${completedCheckpoints.length}/12)`}
        </button>
      </div>

      {/* Main 2D Game Stage */}
      <main className="relative flex-1 w-full overflow-hidden">
        <DinoRunnerCanvas
          gameMode={gameMode}
          isPaused={isPaused}
          currentCheckpointIndex={currentCheckpointIndex}
          reducedMotion={reducedMotion}
          bossHp={bossHp}
          playerLives={lives}
          bossEffect={bossEffect}
          onCheckpointTriggered={handleCheckpointTriggered}
          onScoreIncrement={handleScoreIncrement}
          onTogglePause={handleTogglePause}
        />

        {/* STARTING / WELCOME MENU SCREEN OVERLAY */}
        {gameMode === 'START_SCREEN' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto retro-box max-w-2xl w-full p-5 md:p-7 bg-white/95 text-[#202124] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#202124] pb-2.5">
                <span className="font-code text-xs font-bold text-[#535353]">
                  UNIVERSITY PROJECT DEFENSE · INTERACTIVE EDITION
                </span>
                <button
                  onClick={() => {
                    soundEngine.initOnUserGesture();
                    soundEngine.playGreeting();
                    soundEngine.startBGM('welcome', true);
                  }}
                  className="bg-[#202124] text-[#f7f7f7] font-pixel text-[10px] px-2.5 py-1 cursor-pointer hover:bg-[#3a3b40]"
                  title="Click to play or restart the 8-bit Welcome Menu Music"
                >
                  ♪ WELCOME MUSIC: {bgmEnabled && !soundMuted ? 'ON (PLAY)' : 'MUTED'}
                </button>
              </div>

              {/* Smiling Pixel Dinosaur English Greeting Banner */}
              <div
                onClick={() => {
                  soundEngine.initOnUserGesture();
                  soundEngine.playGreeting();
                  soundEngine.startBGM('welcome', false);
                }}
                className="p-3.5 bg-[#f7f7f7] border-2 border-[#202124] flex items-center gap-4 cursor-pointer hover:bg-[#efefef] transition-colors"
                title="Click Rex to hear a friendly 8-bit greeting!"
              >
                {/* Inline Pixel-Art Smiling Dino SVG Portrait */}
                <div className="w-16 h-16 bg-white border-2 border-[#202124] flex items-center justify-center shrink-0 p-1">
                  <svg
                    viewBox="0 0 20 20"
                    className="w-full h-full pixelated"
                    shapeRendering="crispEdges"
                  >
                    <path
                      fill="#202124"
                      d="M9 1h9v1H9zM8 2h11v2H8zM8 4h2v1H8zm3 0h8v1h-8zM8 5h11v2H8zM8 7h6v1H8zm8 0h2v1h-2zM8 8h9v1H8zM7 9h6v1H7zM1 10h1v1H1zm6 0h7v1H7zm9 0h2v1h-2zM1 11h2v1H1zm5 0h11v1H6zM1 12h3v1H1zm4 0h9v1H5zM1 13h13v2H1zM2 15h11v1H2zM3 16h9v1H3zM4 17h3v2H4zm4 0h3v2H8z"
                    />
                  </svg>
                </div>

                <div className="space-y-1">
                  <div className="font-pixel text-xs text-[#202124] flex items-center gap-2">
                    <span>👋 HELLO! I&apos;M REX — YOUR TEAMUP BACKEND GUIDE! ^_^</span>
                  </div>
                  <p className="font-code text-xs text-[#535353] leading-snug">
                    &ldquo;Welcome to TeamUp! Click Start Game to run through the desert, jump over cacti, dodge flying birds, and discover how our C# .NET 10 APIs, 13-Entity Chen ERD, Concurrency Engine, and Gamification system work!&rdquo;
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <h1 className="font-pixel text-2xl md:text-3xl text-[#202124] tracking-tight leading-snug">
                  TEAMUP
                  <span className="block text-base md:text-lg text-[#535353] mt-1">
                    THE BACKEND RUNNER
                  </span>
                </h1>
                <p className="font-pixel text-xs text-[#202124] pt-0.5">
                  &ldquo;Discover the Engine Behind TeamUp&rdquo;
                </p>
                <p className="text-sm text-[#535353] leading-relaxed">
                  Run through the TeamUp Backend world, overcome obstacles, and discover how the system works.
                </p>
              </div>

              {/* Instructions Expandable Box */}
              {showInstructions && (
                <div className="p-3.5 bg-[#f7f7f7] border-2 border-[#202124] font-code text-xs space-y-1.5">
                  <div className="font-pixel text-[11px] text-[#202124]">
                    HOW TO PLAY &amp; PRESENT:
                  </div>
                  <div>
                    1. Click <strong>Start Game</strong>: Rex runs across the desert while Pterodactyl birds fly overhead.
                  </div>
                  <div>
                    2. Press <strong>SPACE</strong> or <strong>UP ARROW</strong> to jump, and click <strong>⏸ PAUSE MENU</strong> (or press <strong>P</strong> / <strong>ESC</strong>) anytime to check your current level, resume, or exit.
                  </div>
                  <div>
                    3. Every cactus triggers one of the <strong>12 Educational Checkpoints</strong> while the background music continues seamlessly.
                  </div>
                  <div>
                    4. Defeat the <strong>Final Boss</strong> in the 10-question quiz to trigger the <strong>Victory Anthem &amp; Black-and-White Pixel Fireworks</strong>!
                  </div>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={handleStartGame}
                  className="retro-btn px-6 py-3 font-pixel text-xs md:text-sm cursor-pointer"
                >
                  ▶ START GAME
                </button>

                <button
                  onClick={() => {
                    soundEngine.initOnUserGesture();
                    soundEngine.playClick();
                    setShowInstructions((v) => !v);
                  }}
                  className="retro-btn-secondary px-4 py-3 font-pixel text-xs cursor-pointer"
                >
                  {showInstructions ? 'HIDE INSTRUCTIONS' : '? INSTRUCTIONS'}
                </button>

                <button
                  onClick={() => {
                    soundEngine.initOnUserGesture();
                    toggleSoundMute();
                  }}
                  className="retro-btn-secondary px-4 py-3 font-pixel text-xs cursor-pointer"
                >
                  SOUND: {soundMuted ? 'OFF' : 'ON'}
                </button>
              </div>

              <div className="pt-2 border-t border-[#cfcfcf] flex flex-wrap items-center justify-between gap-2 text-xs font-code text-[#535353]">
                <span>SPACE / UP Jump · [P / ESC] Pause Menu · Continuous 8-Bit Soundtrack</span>
                <span>12 Checkpoints + Final Boss Quiz</span>
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE PAUSE MENU MODAL (RESUME, CURRENT LEVEL INFO, JUMP LEVEL, OR EXIT TO MENU) */}
        {gameMode === 'RUNNING' && isPaused && (
          <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#202124]/65">
            <div
              className="retro-box max-w-xl w-full bg-white text-[#202124] overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Game Paused Menu"
            >
              {/* Pause Modal Header */}
              <div className="bg-[#202124] text-[#f7f7f7] px-5 py-3.5 flex items-center justify-between">
                <span className="font-pixel text-xs md:text-sm">⏸ GAME PAUSED</span>
                <span className="bg-[#f7f7f7] text-[#202124] font-pixel text-[10px] px-2.5 py-1">
                  {activeCheckpoint.code} ({currentCheckpointIndex + 1}/{CHECKPOINTS.length})
                </span>
              </div>

              {/* Current Level & Player Status Section */}
              <div className="p-5 md:p-6 space-y-5 bg-[#ffffff]">
                <div className="retro-box-sm p-4 bg-[#f7f7f7] space-y-2">
                  <div className="text-[11px] font-code font-bold text-[#535353]">
                    YOUR CURRENT LEVEL &amp; PROGRESS:
                  </div>
                  <div className="font-pixel text-xs md:text-sm text-[#202124]">
                    {activeCheckpoint.levelLabel}
                  </div>
                  <div className="font-code text-xs font-bold text-[#202124]">
                    Topic: {activeCheckpoint.title} — {activeCheckpoint.subtitle}
                  </div>
                  <div className="pt-2 border-t border-[#cfcfcf] grid grid-cols-3 gap-2 font-code text-xs">
                    <div>
                      <span className="text-[#535353] block text-[10px]">COMPLETED</span>
                      <strong>
                        {completedCheckpoints.length} / {CHECKPOINTS.length} Levels
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#535353] block text-[10px]">CURRENT SCORE</span>
                      <strong>{formatScore(score)} PTS</strong>
                    </div>
                    <div>
                      <span className="text-[#535353] block text-[10px]">LIVES LEFT</span>
                      <strong>{'♥'.repeat(Math.max(0, lives))}</strong>
                    </div>
                  </div>
                </div>

                {/* Quick Level Switcher inside Pause Menu */}
                <div className="space-y-1.5">
                  <div className="font-code text-xs font-bold text-[#535353]">
                    JUMP TO ANY LEVEL CHECKPOINT (1–12):
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {CHECKPOINTS.map((cp, idx) => {
                      const isCurrent = idx === currentCheckpointIndex;
                      const isDone = completedCheckpoints.includes(idx);
                      return (
                        <button
                          key={cp.id}
                          onClick={() => {
                            soundEngine.playClick();
                            handleSelectCheckpoint(idx);
                          }}
                          className={`p-1.5 font-code text-xs border-2 cursor-pointer transition-colors ${
                            isCurrent
                              ? 'bg-[#202124] text-[#f7f7f7] border-[#202124] font-bold'
                              : isDone
                              ? 'bg-[#f7f7f7] text-[#202124] border-[#202124] font-bold'
                              : 'bg-white text-[#535353] border-[#cfcfcf] hover:border-[#202124]'
                          }`}
                          title={`${cp.levelLabel}: ${cp.title}`}
                        >
                          {isDone ? '✓' : ''}
                          {cp.code}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Pause Menu Action Buttons: Continue, Open Current Level Slide, Restart, or Exit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={handleTogglePause}
                    className="retro-btn px-4 py-3 font-pixel text-xs cursor-pointer text-center"
                  >
                    ▶ CONTINUE GAME
                  </button>

                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      handleCheckpointTriggered(currentCheckpointIndex);
                    }}
                    className="retro-btn-secondary px-4 py-3 font-pixel text-xs cursor-pointer text-center"
                  >
                    📖 OPEN {activeCheckpoint.code} SLIDE
                  </button>

                  <button
                    onClick={handleStartGame}
                    className="retro-btn-secondary px-4 py-3 font-pixel text-xs cursor-pointer text-center"
                  >
                    ↺ RESTART FROM LVL 1
                  </button>

                  <button
                    onClick={handleExitToMenu}
                    className="retro-btn-secondary px-4 py-3 font-pixel text-xs cursor-pointer text-center"
                  >
                    ✕ EXIT TO MAIN MENU
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EDUCATIONAL CHECKPOINT MODAL */}
        {gameMode === 'CHECKPOINT_MODAL' && (
          <CheckpointModal
            checkpointIndex={currentCheckpointIndex}
            onNextAndResume={handleNextCheckpoint}
            onSelectCheckpoint={handleSelectCheckpoint}
          />
        )}

        {/* FINAL BOSS QUIZ & END STATES */}
        {(gameMode === 'BOSS_QUIZ' || gameMode === 'VICTORY' || gameMode === 'GAME_OVER') && (
          <BossBattlePanel
            bossHp={bossHp}
            playerLives={lives}
            onCorrectAnswer={handleCorrectQuizAnswer}
            onWrongAnswer={handleWrongQuizAnswer}
            onQuizComplete={handleQuizComplete}
            onRetryQuiz={handleRetryQuiz}
            onRestartFullPresentation={handleStartGame}
            quizResultMode={
              gameMode === 'VICTORY'
                ? 'VICTORY'
                : gameMode === 'GAME_OVER'
                ? 'GAME_OVER'
                : 'QUIZ_ACTIVE'
            }
            finalQuizScore={finalQuizScore}
            answersHistory={answersHistory}
          />
        )}
      </main>
    </div>
  );
}

import React, { useEffect, useRef } from 'react';
import { CHECKPOINTS } from '../data/teamupData';
import { soundEngine } from '../audio/soundEngine';

export type GameMode =
  | 'START_SCREEN'
  | 'RUNNING'
  | 'CHECKPOINT_MODAL'
  | 'BOSS_INTRO'
  | 'BOSS_QUIZ'
  | 'VICTORY'
  | 'GAME_OVER';

interface DinoRunnerCanvasProps {
  gameMode: GameMode;
  isPaused: boolean;
  currentCheckpointIndex: number; // 0 to 11
  reducedMotion: boolean;
  bossHp: number; // 0 to 100
  playerLives: number; // 0 to 5
  bossEffect: 'none' | 'player_attack' | 'boss_attack';
  onCheckpointTriggered: (checkpointIndex: number) => void;
  onScoreIncrement: (delta: number) => void;
  onManualJump?: () => void;
  onTogglePause?: () => void;
}

interface Cloud {
  x: number;
  y: number;
  speed: number;
  scale: number;
}

interface FlyingBird {
  x: number;
  y: number;
  speed: number;
  wingFrame: number;
  wingTimer: number;
}

interface GroundPebble {
  x: number;
  yOffset: number;
  width: number;
  height: number;
  isBump?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  hasOutline?: boolean;
}

interface FireworkRocket {
  x: number;
  y: number;
  targetY: number;
  vy: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
}

// Standard Running T-Rex Sprite Matrix
const DINO_SPRITE_BASE: string[] = [
  '..........XXXXXXXXX.',
  '.........XXXXXXXXXXX',
  '.........XX.XXXXXXXX',
  '.........XXXXXXXXXXX',
  '.........XXXXXX.....',
  '.........XXXXXXXXX..',
  '........XXXXXX......',
  'X......XXXXXXX......',
  'XX....XXXXXXXXXX....',
  'XXX..XXXXXXXXX.X....',
  'XXXXXXXXXXXXXX......',
  'XXXXXXXXXXXXXX......',
  '.XXXXXXXXXXXX.......',
  '..XXXXXXXXXX........',
  '...XXXXXXXX.........',
  '....XXXXXX..........',
];

// Happy Smiling & Waving T-Rex Sprite Matrix for Welcome & Victory!
const DINO_SPRITE_SMILING: string[] = [
  '..........XXXXXXXXX.',
  '.........XXXXXXXXXXX',
  '.........XX.XXXXXXXX',
  '.........XXXXXXXXXXX',
  '.........XXXXXX...X.',
  '.........XXXXXXXXXX.',
  '........XXXXXX......',
  'X......XXXXXXX...XX.',
  'XX....XXXXXXXXXXXX..',
  'XXX..XXXXXXXXX......',
  'XXXXXXXXXXXXXX......',
  'XXXXXXXXXXXXXX......',
  '.XXXXXXXXXXXX.......',
  '..XXXXXXXXXX........',
  '...XXXXXXXX.........',
  '....XXXXXX..........',
];

const DINO_LEGS_IDLE: string[] = [
  '....XX..XX..........',
  '....XX..XX..........',
  '....XX..XX..........',
  '....XXX.XXX.........',
];

const DINO_LEGS_RUN_1: string[] = [
  '....XX..XX..........',
  '....XX...XX.........',
  '....XX..............',
  '....XXX.............',
];

const DINO_LEGS_RUN_2: string[] = [
  '....XX..XX..........',
  '.....XX.XX..........',
  '........XX..........',
  '........XXX.........',
];

// Iconic Chrome Dino Flying Pterodactyl Bird (Matching uploaded reference image!)
// Frame 1: Wing Up
const BIRD_WING_UP: string[] = [
  '......XX.............',
  '......XXX............',
  '.....XXXXX...........',
  '...XXX.XXXXX.........',
  '..XXXX.XXXXXX........',
  '.XXXXXXXXXXXXX.......',
  'XXXXXXXXXXXXXXX......',
  '......XXXXXXXXXXXXXXX',
  '.......XXXXXXXXXXXX..',
  '........XXXXXXXXXXXX.',
  '.........XXXXXXXX....',
];

// Frame 2: Wing Down
const BIRD_WING_DOWN: string[] = [
  '.....................',
  '.....................',
  '...XXX...............',
  '..XXXX...............',
  '.XXXXXXXXXXXX........',
  'XXXXXXXXXXXXXXX......',
  '......XXXXXXXXXXXXXXX',
  '.......XXXXXXXXXXXX..',
  '.......XXXXXXXXXXXXXX',
  '.......XXXXXX........',
  '........XXXX.........',
  '........XXX..........',
  '.........X...........',
];

// Boss Dino Matrix (Facing Left)
const BOSS_SPRITE: string[] = [
  '.XXXXXXXXXXX..........',
  'XXXXXXXXXXXXX.........',
  'XXXXXXXX..XXX.........',
  'XXXXXXXXXXXXX.........',
  '....XXXXXXXXX.........',
  '..XXXXXXXXXXX.........',
  '......XXXXXXXX........',
  '......XXXXXXXXX......X',
  '....XXXXXXXXXXXX....XX',
  '....X.XXXXXXXXXXX..XXX',
  '......XXXXXXXXXXXXXXXX',
  '......XXXXXXXXXXXXXXXX',
  '.......XXXXXXXXXXXXXX.',
  '........XXXXXXXXXXXX..',
  '.........XXXXXXXXXX...',
  '..........XXXXXXXX....',
  '..........XX....XX....',
  '..........XX....XX....',
  '.........XXX...XXX....',
];

export const DinoRunnerCanvas: React.FC<DinoRunnerCanvasProps> = ({
  gameMode,
  isPaused,
  currentCheckpointIndex,
  reducedMotion,
  bossHp,
  playerLives,
  bossEffect,
  onCheckpointTriggered,
  onScoreIncrement,
  onManualJump,
  onTogglePause,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable simulation state kept in ref for 60fps performance
  const simRef = useRef({
    dinoX: 110,
    dinoY: 0,
    dinoVy: 0,
    isJumping: false,
    legFrame: 0,
    legTimer: 0,
    waveTimer: 0,
    groundScroll: 0,
    distanceRun: 0,
    scoreTimer: 0,
    // Active checkpoint cactus state
    cactusX: 780,
    cactusPassed: false,
    postJumpTimer: 0,
    checkpointIndexSpawned: -1,
    // Environment
    clouds: [
      { x: 220, y: 68, speed: 28, scale: 1 },
      { x: 540, y: 48, speed: 22, scale: 1.15 },
      { x: 890, y: 82, speed: 32, scale: 0.9 },
      { x: 1180, y: 58, speed: 25, scale: 1.05 },
    ] as Cloud[],
    birds: [
      { x: 640, y: 120, speed: 190, wingFrame: 0, wingTimer: 0 },
      { x: 1080, y: 85, speed: 225, wingFrame: 1, wingTimer: 0.08 },
      { x: 1490, y: 145, speed: 205, wingFrame: 0, wingTimer: 0.04 },
    ] as FlyingBird[],
    pebbles: [] as GroundPebble[],
    particles: [] as Particle[],
    fireworkRockets: [] as FireworkRocket[],
    fireworkSpawnTimer: 0,
    floatingTexts: [] as FloatingText[],
    // Boss animation state
    bossBobTimer: 0,
    laserProgress: 0,
    shockwaveProgress: 0,
    shakeTimer: 0,
    playerHitFlash: 0,
    bossHitFlash: 0,
  });

  // Sync props into ref
  const propsRef = useRef({
    gameMode,
    isPaused,
    currentCheckpointIndex,
    reducedMotion,
    bossHp,
    playerLives,
    bossEffect,
    onCheckpointTriggered,
    onScoreIncrement,
    onManualJump,
  });

  useEffect(() => {
    propsRef.current = {
      gameMode,
      isPaused,
      currentCheckpointIndex,
      reducedMotion,
      bossHp,
      playerLives,
      bossEffect,
      onCheckpointTriggered,
      onScoreIncrement,
      onManualJump,
    };
  }, [
    gameMode,
    isPaused,
    currentCheckpointIndex,
    reducedMotion,
    bossHp,
    playerLives,
    bossEffect,
    onCheckpointTriggered,
    onScoreIncrement,
    onManualJump,
  ]);

  // Spawn or reset cactus when entering RUNNING for a checkpoint
  useEffect(() => {
    const sim = simRef.current;
    if (gameMode === 'RUNNING') {
      if (sim.checkpointIndexSpawned !== currentCheckpointIndex) {
        const canvasWidth = canvasRef.current?.width || 1100;
        sim.cactusX = Math.max(680, Math.min(canvasWidth * 0.72, 920));
        sim.cactusPassed = false;
        sim.postJumpTimer = 0;
        sim.checkpointIndexSpawned = currentCheckpointIndex;
      }
    } else if (gameMode === 'START_SCREEN') {
      sim.dinoY = 0;
      sim.dinoVy = 0;
      sim.isJumping = false;
      sim.checkpointIndexSpawned = -1;
      sim.cactusX = 760;
      sim.cactusPassed = false;
      sim.postJumpTimer = 0;
      sim.fireworkRockets = [];
    }
  }, [gameMode, currentCheckpointIndex]);

  // Trigger Boss visual effects & floating damage numbers when bossEffect changes
  useEffect(() => {
    const sim = simRef.current;
    const canvasWidth = canvasRef.current?.width || 1100;
    const canvasHeight = canvasRef.current?.height || 650;
    const groundY = Math.floor(canvasHeight * 0.85);
    const bossX = Math.max(canvasWidth - 290, sim.dinoX + 340);

    if (bossEffect === 'player_attack') {
      sim.laserProgress = 0.01;
      sim.shakeTimer = 0.38;
      sim.bossHitFlash = 0.55;
      sim.dinoVy = 420;
      sim.isJumping = true;
      sim.floatingTexts.push({
        x: bossX - 20,
        y: groundY - 140,
        text: '💥 -10 HP DIRECT HIT!',
        life: 0,
        maxLife: 1.35,
      });
      // Burst impact sparks on the Boss
      for (let i = 0; i < 18; i++) {
        const angle = (Math.PI * 2 * i) / 18;
        const speed = 70 + Math.random() * 110;
        sim.particles.push({
          x: bossX + 35,
          y: 75,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 5,
          life: 0,
          maxLife: 0.55,
          color: i % 2 === 0 ? '#202124' : '#ffffff',
          hasOutline: true,
        });
      }
    } else if (bossEffect === 'boss_attack') {
      sim.shockwaveProgress = 0.01;
      sim.shakeTimer = 0.48;
      sim.playerHitFlash = 0.6;
      sim.floatingTexts.push({
        x: sim.dinoX - 10,
        y: groundY - 115,
        text: '⚡ -1 LIFE! BOSS STOMP!',
        life: 0,
        maxLife: 1.35,
      });
      // Burst impact sparks on the Player Dino
      for (let i = 0; i < 14; i++) {
        const angle = (Math.PI * 2 * i) / 14;
        const speed = 60 + Math.random() * 90;
        sim.particles.push({
          x: sim.dinoX + 25,
          y: 45,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 4,
          life: 0,
          maxLife: 0.5,
          color: '#202124',
        });
      }
    }
  }, [bossEffect]);

  // Initialize ground pebbles once
  useEffect(() => {
    const pebbles: GroundPebble[] = [];
    for (let i = 0; i < 45; i++) {
      pebbles.push({
        x: i * 42 + Math.random() * 25,
        yOffset: 6 + Math.floor(Math.random() * 14),
        width: Math.random() > 0.35 ? 4 : 8,
        height: 2,
        isBump: i % 9 === 0,
      });
    }
    simRef.current.pebbles = pebbles;
  }, []);

  // Trigger jump helper
  const triggerJump = () => {
    const sim = simRef.current;
    const { gameMode: mode, isPaused: paused, onManualJump: manualCb } = propsRef.current;
    if (paused) return;

    if (mode === 'START_SCREEN') {
      // Friendly greeting hop on the welcome screen!
      if (!sim.isJumping && sim.dinoY <= 1) {
        sim.isJumping = true;
        sim.dinoVy = 460;
        soundEngine.initOnUserGesture();
        soundEngine.playGreeting();
      }
      return;
    }

    if (mode !== 'RUNNING' && mode !== 'BOSS_INTRO') return;
    if (!sim.isJumping && sim.dinoY <= 1) {
      sim.isJumping = true;
      sim.dinoVy = 610;
      soundEngine.playJump();
      if (manualCb) manualCb();

      // Spawn jump dust pixels
      for (let i = 0; i < 6; i++) {
        sim.particles.push({
          x: sim.dinoX + 18 + (Math.random() - 0.5) * 16,
          y: 0,
          vx: -80 - Math.random() * 60,
          vy: 20 + Math.random() * 50,
          size: 4,
          life: 0,
          maxLife: 0.35,
          color: '#535353',
        });
      }
    }
  };

  // Keyboard listener for Space / Up Arrow jump
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (propsRef.current.gameMode === 'RUNNING' && !propsRef.current.isPaused) {
          e.preventDefault();
          triggerJump();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main 60fps Canvas Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const drawPixelSprite = (
      ctx: CanvasRenderingContext2D,
      matrix: string[],
      x: number,
      y: number,
      pixelSize: number,
      color: string
    ) => {
      ctx.fillStyle = color;
      for (let row = 0; row < matrix.length; row++) {
        const line = matrix[row];
        for (let col = 0; col < line.length; col++) {
          if (line[col] === 'X') {
            ctx.fillRect(
              Math.floor(x + col * pixelSize),
              Math.floor(y + row * pixelSize),
              pixelSize,
              pixelSize
            );
          }
        }
      }
    };

    const drawPixelCloud = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      scale: number
    ) => {
      const p = Math.max(2, Math.round(3 * scale));
      ctx.fillStyle = '#e4e4e4';
      ctx.fillRect(Math.floor(x + 4 * p), Math.floor(y), 10 * p, 4 * p);
      ctx.fillRect(Math.floor(x + 2 * p), Math.floor(y + 2 * p), 16 * p, 4 * p);
      ctx.fillRect(Math.floor(x), Math.floor(y + 4 * p), 20 * p, 3 * p);
      ctx.fillStyle = '#cfcfcf';
      ctx.fillRect(Math.floor(x), Math.floor(y + 7 * p), 20 * p, p);
      ctx.fillRect(Math.floor(x + 4 * p), Math.floor(y - p), 10 * p, p);
    };

    const drawSingleCactus = (
      ctx: CanvasRenderingContext2D,
      x: number,
      groundY: number,
      heightPx: number,
      color: string
    ) => {
      const p = 3;
      const trunkW = 3 * p;
      const trunkX = Math.floor(x + 4 * p);
      const topY = Math.floor(groundY - heightPx);

      ctx.fillStyle = color;
      ctx.fillRect(trunkX, topY + p, trunkW, heightPx - p);
      ctx.fillRect(trunkX + p, topY, trunkW - 2 * p, p);

      const leftArmY = topY + Math.floor(heightPx * 0.28);
      ctx.fillRect(Math.floor(x), leftArmY, 2 * p, 5 * p);
      ctx.fillRect(Math.floor(x + p), leftArmY - p, p, p);
      ctx.fillRect(Math.floor(x), leftArmY + 5 * p, 4 * p, 2 * p);

      const rightArmY = topY + Math.floor(heightPx * 0.22);
      ctx.fillRect(trunkX + trunkW + 2 * p, rightArmY, 2 * p, 6 * p);
      ctx.fillRect(trunkX + trunkW + 2 * p, rightArmY - p, p, p);
      ctx.fillRect(trunkX + trunkW, rightArmY + 5 * p, 4 * p, 2 * p);
    };

    const drawCactusCluster = (
      ctx: CanvasRenderingContext2D,
      x: number,
      groundY: number,
      variant: 'single' | 'double' | 'triple' | 'gate',
      checkpointCode: string,
      checkpointTitle: string
    ) => {
      const color = '#535353';
      if (variant === 'single') {
        drawSingleCactus(ctx, x, groundY, 54, color);
      } else if (variant === 'double') {
        drawSingleCactus(ctx, x, groundY, 52, color);
        drawSingleCactus(ctx, x + 36, groundY, 62, color);
      } else if (variant === 'triple') {
        drawSingleCactus(ctx, x, groundY, 50, color);
        drawSingleCactus(ctx, x + 34, groundY, 62, color);
        drawSingleCactus(ctx, x + 68, groundY, 54, color);
      } else {
        drawSingleCactus(ctx, x, groundY, 60, color);
        drawSingleCactus(ctx, x + 40, groundY, 64, color);
      }

      const flagX = Math.floor(x - 10);
      const flagY = Math.floor(groundY - 96);
      ctx.fillStyle = '#202124';
      ctx.fillRect(flagX, flagY, 92, 22);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(flagX + 2, flagY + 2, 88, 18);
      ctx.fillStyle = '#202124';
      ctx.font = 'bold 9px "Press Start 2P", monospace';
      ctx.fillText(checkpointCode, flagX + 10, flagY + 15);

      ctx.fillStyle = '#535353';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillText(checkpointTitle.toUpperCase(), flagX, flagY - 6);
    };

    const spawnBlackAndWhiteFirework = (
      sim: typeof simRef.current,
      x: number,
      groundY: number,
      burstY: number
    ) => {
      // Convert y from canvas top into offset above groundY for particle system
      const offsetAboveGround = groundY - burstY;
      const ringCount = 28;
      const palette = ['#202124', '#ffffff', '#535353', '#9e9e9e'];
      soundEngine.playFireworkBurst();

      for (let i = 0; i < ringCount; i++) {
        const angle = (Math.PI * 2 * i) / ringCount;
        const speed = (i % 2 === 0 ? 130 : 75) + Math.random() * 35;
        sim.particles.push({
          x,
          y: offsetAboveGround,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: i % 3 === 0 ? 6 : 4,
          life: 0,
          maxLife: 0.95 + Math.random() * 0.35,
          color: palette[i % palette.length],
          hasOutline: true,
        });
      }
    };

    const render = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const parent = canvas.parentElement;
      if (parent) {
        const targetW = parent.clientWidth;
        const targetH = parent.clientHeight;
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const sim = simRef.current;
      const {
        gameMode: mode,
        isPaused: paused,
        currentCheckpointIndex: cpIdx,
        reducedMotion: reduced,
        bossHp: currentBossHp,
        playerLives: currentLives,
        onCheckpointTriggered: triggerCheckpointCb,
        onScoreIncrement: scoreCb,
      } = propsRef.current;

      const width = canvas.width;
      const height = canvas.height;

      // In Boss Quiz / Victory / Game Over modes, place ground lower so top quiz panel never covers the fight!
      const isBossScene =
        mode === 'BOSS_INTRO' ||
        mode === 'BOSS_QUIZ' ||
        mode === 'VICTORY' ||
        mode === 'GAME_OVER';
      const groundY = Math.floor(height * (isBossScene ? 0.86 : 0.76));
      const runSpeed = reduced ? 240 : 340;

      sim.waveTimer += dt * 5;

      // Update simulation when RUNNING and NOT paused
      if (mode === 'RUNNING' && !paused) {
        sim.groundScroll = (sim.groundScroll + runSpeed * dt) % width;
        sim.distanceRun += runSpeed * dt;

        sim.scoreTimer += dt;
        if (sim.scoreTimer >= 0.12) {
          sim.scoreTimer = 0;
          scoreCb(1);
        }

        sim.legTimer += dt;
        if (sim.legTimer >= 0.085) {
          sim.legTimer = 0;
          sim.legFrame = (sim.legFrame + 1) % 2;
        }

        // Update flying Pterodactyl birds
        sim.birds.forEach((b) => {
          b.x -= (reduced ? b.speed * 0.7 : b.speed) * dt;
          b.wingTimer += dt;
          if (b.wingTimer >= 0.16) {
            b.wingTimer = 0;
            b.wingFrame = (b.wingFrame + 1) % 2;
          }
          if (b.x < -90) {
            b.x = width + 180 + Math.random() * 320;
            b.y = Math.max(55, groundY - 135 - Math.floor(Math.random() * 95));
          }
        });

        // Move active checkpoint cactus left toward the dinosaur
        if (cpIdx < CHECKPOINTS.length) {
          sim.cactusX -= runSpeed * dt;

          const distanceToCactus = sim.cactusX - (sim.dinoX + 44);
          if (
            distanceToCactus <= 95 &&
            distanceToCactus > 10 &&
            !sim.isJumping &&
            !sim.cactusPassed
          ) {
            triggerJump();
          }

          const cactusWidth =
            CHECKPOINTS[cpIdx].cactusVariant === 'triple'
              ? 96
              : CHECKPOINTS[cpIdx].cactusVariant === 'double'
              ? 68
              : 38;

          if (!sim.cactusPassed && sim.dinoX > sim.cactusX + cactusWidth * 0.55) {
            sim.cactusPassed = true;
            soundEngine.playCheckpoint();
            scoreCb(50);
            const cp = CHECKPOINTS[cpIdx];
            sim.floatingTexts.push({
              x: sim.dinoX,
              y: groundY - 110,
              text: `${cp.code} UNLOCKED! +50`,
              life: 0,
              maxLife: 1.0,
            });
          }

          if (sim.cactusPassed && !sim.isJumping && sim.dinoY <= 1) {
            sim.postJumpTimer += dt;
            if (sim.postJumpTimer >= 0.16) {
              sim.postJumpTimer = 0;
              triggerCheckpointCb(cpIdx);
            }
          }
        }
      }

      // Physics for dinosaur jump (paused freezes mid-air if paused during RUNNING)
      if (!paused && (sim.isJumping || sim.dinoY > 0)) {
        sim.dinoY += sim.dinoVy * dt;
        sim.dinoVy -= 1550 * dt;
        if (sim.dinoY <= 0) {
          sim.dinoY = 0;
          sim.dinoVy = 0;
          sim.isJumping = false;
        }
      }

      // Joyful auto-hops & Black-and-White Fireworks during VICTORY
      if (mode === 'VICTORY') {
        if (!sim.isJumping && sim.dinoY <= 1 && Math.random() < 0.05) {
          sim.isJumping = true;
          sim.dinoVy = 380;
        }
        sim.fireworkSpawnTimer += dt;
        if (sim.fireworkSpawnTimer >= 0.55) {
          sim.fireworkSpawnTimer = 0;
          const rx = 140 + Math.random() * (width - 280);
          const targetY = 75 + Math.random() * Math.max(90, groundY * 0.42);
          sim.fireworkRockets.push({
            x: rx,
            y: groundY - 10,
            targetY,
            vy: 460 + Math.random() * 140,
          });
        }
      }

      // Update Firework Rockets
      for (let i = sim.fireworkRockets.length - 1; i >= 0; i--) {
        const rk = sim.fireworkRockets[i];
        rk.y -= rk.vy * dt;
        if (rk.y <= rk.targetY) {
          spawnBlackAndWhiteFirework(sim, rk.x, groundY, rk.targetY);
          sim.fireworkRockets.splice(i, 1);
        }
      }

      // Clouds drift slowly
      if (
        !reduced &&
        !paused &&
        (mode === 'RUNNING' || mode === 'START_SCREEN' || mode === 'BOSS_QUIZ' || mode === 'VICTORY')
      ) {
        sim.clouds.forEach((c) => {
          c.x -= (mode === 'RUNNING' ? c.speed : c.speed * 0.35) * dt;
          if (c.x < -120) {
            c.x = width + 60;
          }
        });
      }

      // Ground pebbles scroll
      if (mode === 'RUNNING' && !paused && !reduced) {
        sim.pebbles.forEach((p) => {
          p.x -= runSpeed * dt;
          if (p.x < -20) {
            p.x = width + Math.random() * 60;
          }
        });
      }

      // Boss mode timers
      sim.bossBobTimer += dt * 3;
      if (sim.laserProgress > 0) {
        sim.laserProgress += dt * 2.5;
        if (sim.laserProgress >= 1) sim.laserProgress = 0;
      }
      if (sim.shockwaveProgress > 0) {
        sim.shockwaveProgress += dt * 2.2;
        if (sim.shockwaveProgress >= 1) sim.shockwaveProgress = 0;
      }
      if (sim.shakeTimer > 0) {
        sim.shakeTimer = Math.max(0, sim.shakeTimer - dt);
      }
      if (sim.playerHitFlash > 0) {
        sim.playerHitFlash = Math.max(0, sim.playerHitFlash - dt);
      }
      if (sim.bossHitFlash > 0) {
        sim.bossHitFlash = Math.max(0, sim.bossHitFlash - dt);
      }

      // Clear canvas with classic Chrome Dino light gray `#f7f7f7`
      ctx.save();
      if (sim.shakeTimer > 0 && !reduced) {
        const mag = sim.shakeTimer * 12;
        ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
      }

      ctx.fillStyle = '#f7f7f7';
      ctx.fillRect(0, 0, width, height);

      // Draw pixel clouds
      sim.clouds.forEach((c) => {
        drawPixelCloud(ctx, c.x, c.y, c.scale);
      });

      // Draw Flying Pterodactyl Birds in RUNNING and CHECKPOINT_MODAL
      if (mode === 'RUNNING' || mode === 'CHECKPOINT_MODAL') {
        sim.birds.forEach((b) => {
          const birdMatrix = b.wingFrame === 0 ? BIRD_WING_UP : BIRD_WING_DOWN;
          drawPixelSprite(ctx, birdMatrix, b.x, b.y, 3, '#535353');
        });
      }

      // Draw Firework Rockets rising in VICTORY mode
      sim.fireworkRockets.forEach((rk) => {
        ctx.fillStyle = '#202124';
        ctx.fillRect(Math.floor(rk.x - 2), Math.floor(rk.y), 4, 10);
        ctx.fillStyle = '#757575';
        ctx.fillRect(Math.floor(rk.x - 1), Math.floor(rk.y + 10), 2, 8);
      });

      // Draw desert ground horizon line with Chrome Dino style terrain bumps
      ctx.fillStyle = '#535353';
      ctx.fillRect(0, groundY, width, 2);

      // Draw scrolling ground pebbles and horizon bumps
      sim.pebbles.forEach((p) => {
        if (p.isBump) {
          ctx.fillStyle = '#f7f7f7';
          ctx.fillRect(Math.floor(p.x), groundY, 18, 2);
          ctx.fillStyle = '#535353';
          ctx.fillRect(Math.floor(p.x + 2), groundY - 2, 14, 2);
          ctx.fillRect(Math.floor(p.x + 5), groundY - 4, 8, 2);
        }
        ctx.fillStyle = '#757575';
        ctx.fillRect(Math.floor(p.x), groundY + p.yOffset, p.width, p.height);
      });

      // Draw active Checkpoint Cactus if in RUNNING or CHECKPOINT_MODAL
      if (
        (mode === 'RUNNING' || mode === 'CHECKPOINT_MODAL') &&
        cpIdx < CHECKPOINTS.length
      ) {
        const cp = CHECKPOINTS[cpIdx];
        drawCactusCluster(
          ctx,
          sim.cactusX,
          groundY,
          cp.cactusVariant,
          cp.code,
          cp.title
        );
      }

      // Draw Player Pixel Dinosaur
      const dinoPixelSize = 3;
      const dinoDrawX = sim.dinoX;
      const dinoDrawY = groundY - 20 * dinoPixelSize - sim.dinoY;

      const isSmilingDino = mode === 'START_SCREEN' || mode === 'VICTORY';
      const baseMatrix = isSmilingDino ? DINO_SPRITE_SMILING : DINO_SPRITE_BASE;

      const legsMatrix =
        mode === 'RUNNING' && !sim.isJumping && !paused
          ? sim.legFrame === 0
            ? DINO_LEGS_RUN_1
            : DINO_LEGS_RUN_2
          : DINO_LEGS_IDLE;

      const fullDinoMatrix = [...baseMatrix, ...legsMatrix];
      const dinoColor =
        sim.playerHitFlash > 0 && Math.floor(sim.playerHitFlash * 20) % 2 === 0
          ? '#9e9e9e'
          : '#202124';

      drawPixelSprite(ctx, fullDinoMatrix, dinoDrawX, dinoDrawY, dinoPixelSize, dinoColor);

      // Draw Smiling Face Eye & Waving Speech Greeting on START_SCREEN
      if (mode === 'START_SCREEN') {
        const bubbleX = dinoDrawX - 10;
        const bubbleY = dinoDrawY - 54;
        ctx.fillStyle = '#202124';
        ctx.fillRect(bubbleX, bubbleY, 275, 36);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bubbleX + 2, bubbleY + 2, 271, 32);
        // Speech pointer triangle
        ctx.fillStyle = '#202124';
        ctx.fillRect(dinoDrawX + 26, bubbleY + 36, 8, 6);

        ctx.fillStyle = '#202124';
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.fillText('HI! I AM REX ^_^', bubbleX + 10, bubbleY + 15);
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillText('Welcome to TeamUp Backend! (Click me)', bubbleX + 10, bubbleY + 29);
      } else if (mode === 'RUNNING') {
        ctx.fillStyle = '#535353';
        ctx.font = 'bold 9px "Press Start 2P", monospace';
        ctx.fillText(
          paused ? 'PAUSED' : sim.isJumping ? 'JUMP!' : 'TEAMUP.EXE',
          dinoDrawX - 4,
          dinoDrawY - 10
        );
      }

      // Draw Player Overhead Health Bar during Boss Battle so player sees damage clearly!
      if (isBossScene) {
        const pBarW = 110;
        const pBarX = dinoDrawX - 10;
        const pBarY = dinoDrawY - 34;
        ctx.fillStyle = '#202124';
        ctx.fillRect(pBarX, pBarY, pBarW, 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pBarX + 2, pBarY + 2, pBarW - 4, 10);
        ctx.fillStyle = '#202124';
        const pFillW = Math.max(0, Math.floor(((pBarW - 4) * currentLives) / 5));
        ctx.fillRect(pBarX + 2, pBarY + 2, pFillW, 10);

        ctx.fillStyle = '#202124';
        ctx.font = 'bold 8px "Press Start 2P", monospace';
        ctx.fillText(`YOU ♥x${currentLives}`, pBarX + 2, pBarY - 5);
      }

      // Draw Final Boss Dinosaur when in Boss Modes
      if (isBossScene) {
        const bossPixelSize = 6;
        const bossBob =
          reduced || mode === 'VICTORY' ? 0 : Math.sin(sim.bossBobTimer) * 5;
        const bossX = Math.max(width - 280, sim.dinoX + 360);
        const bossY =
          mode === 'VICTORY'
            ? groundY - 14 * bossPixelSize // Boss sinks/collapses in defeat on Victory!
            : groundY - 19 * bossPixelSize + bossBob;

        const bossColor =
          sim.bossHitFlash > 0 && Math.floor(sim.bossHitFlash * 20) % 2 === 0
            ? '#9e9e9e'
            : currentBossHp <= 0 || mode === 'VICTORY'
            ? '#a8a8a8'
            : '#202124';

        drawPixelSprite(ctx, BOSS_SPRITE, bossX, bossY, bossPixelSize, bossColor);

        // Boss overhead HP Bar on Canvas
        const barW = 148;
        const barX = bossX - 6;
        const barY = bossY - 36;
        ctx.fillStyle = '#202124';
        ctx.fillRect(barX, barY, barW, 14);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(barX + 2, barY + 2, barW - 4, 10);
        ctx.fillStyle = '#535353';
        const fillW = Math.max(0, Math.floor(((barW - 4) * currentBossHp) / 100));
        ctx.fillRect(barX + 2, barY + 2, fillW, 10);

        ctx.fillStyle = '#202124';
        ctx.font = 'bold 8px "Press Start 2P", monospace';
        ctx.fillText(
          mode === 'VICTORY' ? 'BOSS DEFEATED!' : `BOSS HP ${currentBossHp}%`,
          barX + 4,
          barY - 5
        );

        // Laser beam animation when player answers correctly
        if (sim.laserProgress > 0) {
          const startX = dinoDrawX + 55;
          const startY = dinoDrawY + 20;
          const endX = startX + (bossX - startX) * Math.min(1, sim.laserProgress * 1.4);
          ctx.fillStyle = '#202124';
          ctx.fillRect(startX, startY, endX - startX, 8);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(startX, startY + 2, endX - startX, 4);
          ctx.fillStyle = '#202124';
          ctx.fillRect(endX - 14, startY - 6, 20, 20);
        }

        // Boss shockwave animation when player answers incorrectly
        if (sim.shockwaveProgress > 0) {
          const waveX = bossX - (bossX - dinoDrawX) * sim.shockwaveProgress;
          ctx.fillStyle = '#202124';
          for (let i = 0; i < 5; i++) {
            const h = 18 + i * 9;
            ctx.fillRect(waveX + i * 11, groundY - h, 7, h);
          }
        }
      }

      // Update & draw particles (including Black-and-White Firework bursts)
      for (let i = sim.particles.length - 1; i >= 0; i--) {
        const pt = sim.particles[i];
        pt.life += dt;
        if (pt.life >= pt.maxLife) {
          sim.particles.splice(i, 1);
          continue;
        }
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.vy -= 90 * dt; // subtle gravity on firework sparks
        const px = Math.floor(pt.x);
        const py = Math.floor(groundY - pt.y);
        if (pt.hasOutline) {
          ctx.fillStyle = '#202124';
          ctx.fillRect(px - 1, py - 1, pt.size + 2, pt.size + 2);
        }
        ctx.fillStyle = pt.color;
        ctx.fillRect(px, py, pt.size, pt.size);
      }

      // Update & draw floating score/checkpoint/damage texts
      for (let i = sim.floatingTexts.length - 1; i >= 0; i--) {
        const ft = sim.floatingTexts[i];
        ft.life += dt;
        if (ft.life >= ft.maxLife) {
          sim.floatingTexts.splice(i, 1);
          continue;
        }
        ft.y -= 32 * dt;
        const tx = Math.floor(ft.x);
        const ty = Math.floor(ft.y);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(tx - 4, ty - 14, ft.text.length * 9 + 8, 20);
        ctx.strokeStyle = '#202124';
        ctx.lineWidth = 2;
        ctx.strokeRect(tx - 4, ty - 14, ft.text.length * 9 + 8, 20);
        ctx.fillStyle = '#202124';
        ctx.font = 'bold 10px "Press Start 2P", monospace';
        ctx.fillText(ft.text, tx, ty);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden cursor-pointer select-none"
      onClick={() => {
        triggerJump();
      }}
      title={
        gameMode === 'RUNNING'
          ? 'Click or press SPACE / UP ARROW to jump'
          : gameMode === 'START_SCREEN'
          ? 'Click Rex to hear a friendly greeting!'
          : undefined
      }
    >
      <canvas ref={canvasRef} className="block w-full h-full pixelated" />

      {/* Prominent Floating On-Canvas Pause Button during RUNNING mode */}
      {gameMode === 'RUNNING' && onTogglePause && (
        <div
          className="absolute top-4 left-6 z-20"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <button
            onClick={onTogglePause}
            className="retro-btn px-4 py-2 font-pixel text-xs flex items-center gap-2 cursor-pointer"
          >
            <span>{isPaused ? '▶ RESUME GAME' : '⏸ PAUSE MENU'}</span>
          </button>
        </div>
      )}

      {/* Subtle bottom-left live control hint during RUNNING mode */}
      {gameMode === 'RUNNING' && (
        <div className="pointer-events-none absolute bottom-4 left-6 right-6 flex flex-wrap items-center justify-between gap-4 text-xs font-code text-[#535353]">
          <div className="bg-[#f7f7f7]/90 border-2 border-[#535353] px-3 py-1.5 flex items-center gap-3">
            <span className="font-pixel text-[10px] text-[#202124]">CONTROLS:</span>
            <span>[SPACE / UP ARROW / CLICK] Jump</span>
            <span>·</span>
            <span>[P] Pause / Resume</span>
          </div>
          {currentCheckpointIndex < CHECKPOINTS.length && (
            <div className="bg-[#202124] text-[#f7f7f7] px-3 py-1.5 font-pixel text-[10px]">
              NEXT OBSTACLE: {CHECKPOINTS[currentCheckpointIndex].code} — {CHECKPOINTS[currentCheckpointIndex].title}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

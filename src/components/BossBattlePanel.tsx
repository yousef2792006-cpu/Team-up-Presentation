import React, { useState } from 'react';
import { BOSS_QUIZ_QUESTIONS } from '../data/teamupData';
import { soundEngine } from '../audio/soundEngine';

interface BossBattlePanelProps {
  bossHp: number;
  playerLives: number;
  onCorrectAnswer: () => void;
  onWrongAnswer: () => void;
  onQuizComplete: (
    finalQuizScore: number,
    answersLog: { qIdx: number; chosen: number; correct: boolean }[]
  ) => void;
  onRetryQuiz: () => void;
  onRestartFullPresentation: () => void;
  quizResultMode: 'QUIZ_ACTIVE' | 'VICTORY' | 'GAME_OVER';
  finalQuizScore: number;
  answersHistory: { qIdx: number; chosen: number; correct: boolean }[];
}

export const BossBattlePanel: React.FC<BossBattlePanelProps> = ({
  bossHp,
  playerLives,
  onCorrectAnswer,
  onWrongAnswer,
  onQuizComplete,
  onRetryQuiz,
  onRestartFullPresentation,
  quizResultMode,
  finalQuizScore,
  answersHistory,
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [localScore, setLocalScore] = useState<number>(0);
  const [localLog, setLocalLog] = useState<{ qIdx: number; chosen: number; correct: boolean }[]>(
    []
  );
  const [showFullBreakdown, setShowFullBreakdown] = useState<boolean>(false);

  const question = BOSS_QUIZ_QUESTIONS[currentQuestionIdx];

  const handleSelectOption = (optIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optIndex);

    const isCorrect = optIndex === question.correctIndex;
    const updatedLog = [
      ...localLog,
      { qIdx: currentQuestionIdx, chosen: optIndex, correct: isCorrect },
    ];
    setLocalLog(updatedLog);

    if (isCorrect) {
      setLocalScore((s) => s + 10);
      soundEngine.playPlayerAttack();
      onCorrectAnswer();
    } else {
      soundEngine.playBossAttack();
      onWrongAnswer();
    }
  };

  const handleNextQuestion = () => {
    soundEngine.playClick();
    if (currentQuestionIdx + 1 < BOSS_QUIZ_QUESTIONS.length) {
      setCurrentQuestionIdx((idx) => idx + 1);
      setSelectedOption(null);
    } else {
      onQuizComplete(localScore, localLog);
    }
  };

  const handleResetQuizInternal = () => {
    soundEngine.playClick();
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setLocalScore(0);
    setLocalLog([]);
    setShowFullBreakdown(false);
    onRetryQuiz();
  };

  if (quizResultMode === 'VICTORY' || quizResultMode === 'GAME_OVER') {
    const isVictory = quizResultMode === 'VICTORY';
    return (
      <div className="fixed inset-x-0 top-22 z-30 p-3 md:px-6 pointer-events-none flex justify-center">
        <div className="pointer-events-auto retro-box w-full max-w-4xl max-h-[54vh] flex flex-col bg-white/95 text-[#202124] overflow-hidden">
          <div className="bg-[#202124] text-[#f7f7f7] px-5 py-3 flex flex-wrap items-center justify-between gap-2">
            <span className="font-pixel text-xs md:text-sm">
              {isVictory
                ? '★ VICTORY! YOU DEFEATED THE BACKEND BOSS! ★'
                : '× GAME OVER – TRAIN YOUR BACKEND KNOWLEDGE! ×'}
            </span>
            <span className="bg-[#f7f7f7] text-[#202124] font-pixel text-xs px-3 py-1">
              FINAL SCORE: {finalQuizScore} / 100
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4">
            {/* Achievement / Status Banner */}
            <div className="retro-box-sm p-4 bg-[#f7f7f7] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="font-pixel text-xs md:text-sm text-[#202124]">
                  {isVictory
                    ? 'ACHIEVEMENT UNLOCKED: TEAMUP BACKEND ARCHITECT (WATCH THE FIREWORKS BELOW!)'
                    : 'SCORE BELOW 70/100 THRESHOLD – THE BOSS SURVIVED!'}
                </div>
                <p className="font-code text-xs text-[#535353]">
                  {isVictory
                    ? 'Victory anthem & Black-and-White pixel fireworks are active! You mastered TeamUp’s .NET 10 Architecture, 13-Entity Chen ERD, Concurrency Locks, and Score Ledger.'
                    : 'Defeat music is playing. You need at least 70/100 to defeat the Backend Boss. Review your answers and retry the battle!'}
                </p>
              </div>
              <div className="p-3 bg-[#202124] text-[#f7f7f7] font-pixel text-center shrink-0 border-2 border-[#535353]">
                <div className="text-[9px] text-[#cfcfcf]">QUIZ SCORE</div>
                <div className="text-base mt-1">{finalQuizScore}/100</div>
              </div>
            </div>

            {/* Toggleable 10-Question Breakdown so Fireworks & Dino Arena remain visible */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-pixel text-xs text-[#202124]">
                  BATTLE SUMMARY ({answersHistory.filter((a) => a.correct).length}/10 CORRECT)
                </span>
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setShowFullBreakdown((v) => !v);
                  }}
                  className="retro-btn-secondary px-3 py-1 font-code text-xs font-bold"
                >
                  {showFullBreakdown ? '▲ Hide Question Details' : '▼ Show All 10 Questions Breakdown'}
                </button>
              </div>

              {showFullBreakdown && (
                <div className="space-y-2 pt-1">
                  {BOSS_QUIZ_QUESTIONS.map((q, idx) => {
                    const entry = answersHistory.find((a) => a.qIdx === idx);
                    const wasCorrect = entry?.correct ?? false;
                    return (
                      <div
                        key={q.id}
                        className="p-2.5 bg-[#f7f7f7] border-2 border-[#202124] font-code text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold">
                            Q{idx + 1}: {q.question}
                          </span>
                          <span
                            className={`px-2 py-0.5 font-bold shrink-0 ${
                              wasCorrect
                                ? 'bg-[#202124] text-[#f7f7f7]'
                                : 'bg-white text-[#202124] border border-[#202124]'
                            }`}
                          >
                            {wasCorrect ? '+10 PTS' : '0 PTS'}
                          </span>
                        </div>
                        <div className="text-[#535353]">
                          <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#f7f7f7] px-5 py-3 border-t-2 border-[#202124] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onRestartFullPresentation}
              className="retro-btn-secondary px-4 py-2 font-pixel text-xs"
            >
              ↺ RESTART FULL RUNNER
            </button>
            <button
              onClick={handleResetQuizInternal}
              className="retro-btn px-5 py-2 font-pixel text-xs"
            >
              ⚔ RETRY BOSS CHALLENGE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Positioned at the TOP (`top-22`) so the Player Dino & Boss Fight below are 100% visible!
  return (
    <div className="fixed inset-x-0 top-22 z-30 p-2 md:px-6 pointer-events-none flex justify-center">
      <div className="pointer-events-auto retro-box w-full max-w-5xl max-h-[50vh] overflow-y-auto bg-white/95 text-[#202124]">
        {/* Boss Battle Top Bar */}
        <div className="bg-[#202124] text-[#f7f7f7] px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="bg-[#f7f7f7] text-[#202124] font-pixel text-[10px] px-2 py-0.5">
              FINAL BOSS – BACKEND CHALLENGE
            </span>
            <span className="font-code text-xs text-[#cfcfcf] hidden md:inline">
              Watch Rex &amp; the Boss battle live below as you answer!
            </span>
          </div>

          <div className="flex items-center gap-3 font-pixel text-[10px]">
            <span>
              Q {currentQuestionIdx + 1}/{BOSS_QUIZ_QUESTIONS.length}
            </span>
            <span>·</span>
            <span>SCORE: {localScore}/100</span>
            <span>·</span>
            <span>BOSS HP: {bossHp}%</span>
            <span>·</span>
            <span>LIVES: {'♥'.repeat(Math.max(0, playerLives))}</span>
          </div>
        </div>

        {/* Question & Options Deck */}
        <div className="p-3.5 md:p-4 space-y-2.5 bg-[#f7f7f7]">
          <div className="flex items-center justify-between text-xs font-code text-[#535353]">
            <span>TOPIC: {question.topic}</span>
            <span>+10 PTS DIRECT HIT · 70/100 TO WIN</span>
          </div>

          <h3 className="font-pixel text-xs md:text-sm text-[#202124] leading-relaxed">
            {question.question}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {question.options.map((opt, idx) => {
              const isChosen = selectedOption === idx;
              const isCorrectOption = idx === question.correctIndex;
              let btnStyle = 'bg-white text-[#202124] border-[#202124] hover:bg-[#ebebeb]';

              if (selectedOption !== null) {
                if (isCorrectOption) {
                  btnStyle = 'bg-[#202124] text-[#f7f7f7] border-[#202124]';
                } else if (isChosen && !isCorrectOption) {
                  btnStyle = 'bg-[#e0e0e0] text-[#535353] border-[#535353] line-through';
                } else {
                  btnStyle = 'bg-white text-[#757575] border-[#cfcfcf]';
                }
              }

              return (
                <button
                  key={idx}
                  disabled={selectedOption !== null}
                  onClick={() => handleSelectOption(idx)}
                  className={`p-2.5 text-left font-code text-xs border-2 transition-all flex items-start gap-2 ${btnStyle}`}
                >
                  <span className="font-pixel text-[10px] shrink-0 mt-0.5">
                    [{String.fromCharCode(65 + idx)}]
                  </span>
                  <span className="leading-snug">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Immediate Feedback & Next Button */}
          {selectedOption !== null && (
            <div className="p-2.5 bg-white border-2 border-[#202124] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="font-code text-xs space-y-0.5">
                <div className="font-bold text-[#202124]">
                  {selectedOption === question.correctIndex
                    ? '★ DIRECT HIT! REX FIRED A LASER BEAM (-10 BOSS HP)!'
                    : '× BOSS STOMP ATTACK! YOU LOST 1 HEART — BACKEND RULE:'}
                </div>
                <p className="text-[#535353] text-[11px]">{question.explanation}</p>
              </div>
              <button
                onClick={handleNextQuestion}
                className="retro-btn px-4 py-2 font-pixel text-xs shrink-0"
              >
                {currentQuestionIdx + 1 < BOSS_QUIZ_QUESTIONS.length
                  ? 'NEXT QUESTION →'
                  : 'FINISH BATTLE →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

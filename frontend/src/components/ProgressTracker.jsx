import React, { useMemo } from 'react';

const PHASES = ['UPLOADING', 'TRANSCRIBING', 'SYNTHESIZING', 'READY'];

export default function ProgressTracker({ 
  currentPhase = 'UPLOADING', 
  logs = [], 
  elapsed = 0, 
  progressValue = 0,
  onAbort
}) {
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const phaseIndex = PHASES.indexOf(currentPhase);

  return (
    <>
      {/* Status Prompt */}
      <div className="font-status-code text-status-code flex items-center gap-unit">
        <span className="text-primary">&gt;</span>
        <span className="text-on-surface uppercase">STATUS: {currentPhase}_PIPELINE_ACTIVE</span>
        <span className="w-2 h-4 bg-secondary inline-block blink-cursor"></span>
      </div>

      {/* Phase Sequence */}
      <div className="border border-outline-variant p-gutter bg-surface-container-lowest flex flex-wrap gap-unit items-center font-label-caps text-label-caps">
        {PHASES.map((phase, idx) => {
          const isPast = idx < phaseIndex;
          const isCurrent = idx === phaseIndex;
          
          let className = 'text-outline';
          if (isCurrent) {
            className = 'text-secondary bg-on-secondary-fixed-variant px-2 py-1 border border-secondary';
          } else if (isPast) {
            className = 'text-on-surface-variant';
          }

          return (
            <React.Fragment key={phase}>
              <span className={className}>
                {isCurrent ? `[${phase}]` : phase}
              </span>
              {idx < PHASES.length - 1 && (
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
                  arrow_right_alt
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress Details */}
      <div className="flex flex-col gap-unit">
        <div className="flex justify-between items-end">
          <div className="font-label-caps text-label-caps text-on-surface-variant">
            {currentPhase === 'UPLOADING' ? `DATA_STREAM: ${progressValue}%` : `PROCESSING_STAGE: ${currentPhase}`}
          </div>
          <div className="font-status-code text-status-code text-primary">
            ELAPSED: {formatTime(elapsed)}
          </div>
        </div>
        {/* Hard-edged Progress Bar */}
        <div className="h-2 w-full border border-outline-variant bg-background flex">
          {currentPhase === 'UPLOADING' ? (
            <div 
              className="bg-secondary h-full border-r border-background transition-all duration-300"
              style={{ width: `${progressValue}%` }}
            ></div>
          ) : (
            <div className="bg-secondary h-full w-[30%] border-r border-background animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Terminal Log (Decorative/Functional) */}
      <div className="border border-outline-variant h-32 overflow-hidden bg-background p-unit font-status-code text-status-code text-[12px] leading-tight flex flex-col justify-end text-on-surface-variant opacity-70 relative">
        <div className="absolute top-0 right-0 p-1 border-b border-l border-outline-variant bg-surface-container z-10">
          <span className="font-label-caps text-label-caps text-[10px]">LOG_OUTPUT</span>
        </div>
        <div className="flex flex-col justify-end min-h-full">
          {logs.map((log, i) => (
            <div key={i} className={i === logs.length - 1 ? 'text-secondary' : ''}>
              {i === logs.length - 1 ? `> ${log}` : log}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      {/* 
        Wait, code.html had this outside of content area? No, it was in a separate div at the bottom of the container. 
        I'll extract it to Layout or handle it here if it's specific to progress.
      */}
      <div className="-mx-margin -mb-margin mt-2 p-gutter border-t border-outline-variant bg-surface flex justify-end gap-unit">
        <button 
          onClick={onAbort}
          disabled={currentPhase === 'READY'}
          className="border border-outline-variant bg-surface-container-lowest text-outline hover:text-on-surface hover:border-on-surface px-4 py-2 font-label-caps text-label-caps disabled:cursor-not-allowed uppercase transition-colors"
        >
          Abort Process
        </button>
      </div>
    </>
  );
}

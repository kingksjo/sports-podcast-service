import React, { useState, useRef, useEffect } from 'react';

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function PodcastPlayer({ audioUrl, metadata, onReset }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateProgress = () => {
        setCurrentTime(audio.currentTime);
        if (audio.duration > 0) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      const handleEnded = () => setIsPlaying(false);
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="-mx-margin -my-margin">
      {/* 
        We use negative margins because App Layout applies p-margin. 
        The design expects the Player Header to touch the edges. 
      */}
      <div className="w-full relative z-10 flex flex-col">
        {/* Player Header */}
        <div className="border-b border-outline-variant p-4 flex justify-between items-center bg-surface-container">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>podcasts</span>
            <h2 className="font-headline-md text-[18px] md:text-headline-md text-primary tracking-tight truncate">
              {metadata?.sport || 'UNKNOWN'} | {metadata?.title || 'GENERATED PODCAST'}
            </h2>
          </div>
          <span className="font-status-code text-[12px] md:text-status-code text-on-surface-variant bg-surface-container-high px-2 py-1 border border-outline-variant whitespace-nowrap">
            STATUS: GENERATED
          </span>
        </div>

        {/* Main Player Area */}
        <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center bg-surface">
          {/* Cover Art / Visualizer */}
          <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 border border-outline-variant bg-surface-container-highest relative overflow-hidden flex items-center justify-center">
            {/* Abstract Waveform/Track visualization */}
            <div className="absolute inset-0 flex items-end justify-center gap-1 p-4 opacity-70">
              <div className={`w-2 bg-secondary h-1/4 ${isPlaying ? 'animate-pulse' : ''}`}></div>
              <div className={`w-2 bg-secondary h-1/2 ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.1s' }}></div>
              <div className={`w-2 bg-secondary h-3/4 ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.2s' }}></div>
              <div className={`w-2 bg-secondary h-full ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.3s' }}></div>
              <div className={`w-2 bg-secondary h-2/3 ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.4s' }}></div>
              <div className={`w-2 bg-secondary h-1/3 ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.5s' }}></div>
              <div className={`w-2 bg-secondary h-1/2 ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDelay: '0.6s' }}></div>
            </div>
            <div className="relative z-10 font-label-caps text-label-caps text-on-surface bg-surface border border-outline-variant px-3 py-1">
              TRACK_01
            </div>
          </div>

          {/* Controls & Scrubber */}
          <div className="flex-1 w-full flex flex-col gap-6">
            {/* Metadata */}
            <div className="flex flex-col gap-1">
              <p className="font-status-code text-status-code text-primary uppercase truncate">&gt; SRC_DATA: RAW_AUDIO_UPLOAD</p>
              <p className="font-status-code text-status-code text-on-surface-variant uppercase">&gt; MODEL: ALO_VOICE_V4_ANALYTIC</p>
              <p className="font-status-code text-status-code text-on-surface-variant uppercase">&gt; DURATION: {formatTime(duration)}</p>
            </div>

            {/* Scrubber */}
            <div className="flex flex-col gap-2 w-full mt-4">
              <div 
                className="h-4 border border-outline-variant bg-surface-container-low flex items-stretch cursor-pointer"
                onClick={(e) => {
                  if (audioRef.current && !isNaN(audioRef.current.duration)) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    audioRef.current.currentTime = percentage * audioRef.current.duration;
                  }
                }}
              >
                {/* Progress fill */}
                <div className="bg-secondary relative transition-all duration-75 ease-linear" style={{ width: `${progress}%` }}>
                  {/* Playhead */}
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-on-surface transform translate-x-1/2"></div>
                </div>
              </div>
              <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Transport Controls */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 mt-2">
              <div className="flex gap-2">
                <button 
                  className="w-12 h-12 border border-outline-variant bg-surface hover:border-on-surface flex items-center justify-center text-on-surface transition-colors group"
                  onClick={() => { if(audioRef.current) audioRef.current.currentTime = 0; }}
                >
                  <span className="material-symbols-outlined text-2xl group-hover:text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>skip_previous</span>
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-16 h-12 border border-secondary bg-surface hover:bg-secondary hover:text-on-secondary flex items-center justify-center text-secondary transition-colors group"
                >
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button className="w-12 h-12 border border-outline-variant bg-surface hover:border-on-surface flex items-center justify-center text-on-surface transition-colors group">
                  <span className="material-symbols-outlined text-2xl group-hover:text-secondary" style={{ fontVariationSettings: '"FILL" 1' }}>skip_next</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 w-full xl:w-auto">
                <button 
                  onClick={onReset}
                  className="flex-1 xl:flex-none h-12 px-2 xl:px-6 border border-outline-variant bg-surface hover:border-on-surface flex items-center justify-center gap-2 text-on-surface transition-colors font-label-caps text-[10px] md:text-label-caps"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  NEW
                </button>
                <a 
                  href={audioUrl || '#'}
                  download
                  className="flex-1 xl:flex-none h-12 px-2 xl:px-6 border border-outline-variant bg-surface hover:border-on-surface flex items-center justify-center gap-2 text-primary transition-colors font-label-caps text-[10px] md:text-label-caps whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  DOWNLOAD .WAV
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript / Log Snippet (Footer area of card) */}
        <div className="border-t border-outline-variant p-4 bg-surface-container-lowest max-h-32 overflow-y-auto">
          <p className="font-status-code text-status-code text-on-surface-variant mb-1 uppercase opacity-50">// TRANSCRIPT_LOG</p>
          <p className="font-body-md text-body-md text-on-surface">
            {metadata?.overview || 'Audio podcast successfully generated from the provided commentary.'}
          </p>
        </div>
      </div>
      <audio ref={audioRef} src={audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'} className="hidden" preload="metadata" />
    </div>
  );
}

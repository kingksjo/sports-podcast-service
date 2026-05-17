import React, { useState, useRef, useEffect } from 'react';

const MOCK_PODCASTS = [
  { id: 1, sport: 'PREMIER LEAGUE', title: 'ARSENAL VS LIVERPOOL', overview: 'A dramatic 90th-minute equalizer secures a point for the Gunners in this thrilling Premier League clash.', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', date: '2026-05-16' },
  { id: 2, sport: 'NBA', title: 'LAKERS VS WARRIORS', overview: 'LeBron James drops 40 points as the Lakers edge out the Warriors in double overtime.', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', date: '2026-05-15' },
  { id: 3, sport: 'TENNIS', title: 'WIMBLEDON FINALS', overview: 'An epic 5-set thriller on center court concludes the tournament with a historic victory.', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', date: '2026-05-10' }
];

export default function PodcastFeed() {
  const [playingId, setPlayingId] = useState(null);
  
  return (
    <div className="w-full max-w-3xl mt-12 flex flex-col gap-margin">
      <div className="flex items-center gap-unit border-b border-outline-variant pb-2">
        <span className="material-symbols-outlined text-outline">history</span>
        <h2 className="font-headline-md text-[18px] text-on-surface uppercase">System Logs / Library</h2>
      </div>
      
      <div className="flex flex-col gap-gutter">
        {MOCK_PODCASTS.map(podcast => (
          <FeedCard 
            key={podcast.id} 
            podcast={podcast} 
            isPlaying={playingId === podcast.id}
            onPlayToggle={(playing) => setPlayingId(playing ? podcast.id : null)}
          />
        ))}
      </div>
    </div>
  );
}

function FeedCard({ podcast, isPlaying, onPlayToggle }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    onPlayToggle(!isPlaying);
  };

  return (
    <div className="border border-outline-variant bg-surface-container flex flex-col shadow-lg transition-colors hover:border-outline">
      <div className="border-b border-outline-variant p-unit px-gutter bg-surface-container-high flex justify-between items-center">
        <div className="font-status-code text-status-code text-on-surface uppercase truncate">
          {podcast.sport} <span className="text-outline-variant">|</span> {podcast.title}
        </div>
        <div className="font-label-caps text-label-caps text-on-surface-variant">
          {podcast.date}
        </div>
      </div>
      
      <div className="p-gutter flex items-start gap-gutter">
        <button 
          onClick={togglePlay}
          className={`shrink-0 w-12 h-12 border ${isPlaying ? 'border-primary text-primary' : 'border-outline-variant text-on-surface'} bg-surface-container-lowest hover:text-primary hover:border-primary flex items-center justify-center transition-colors`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <div className="flex-1 flex flex-col gap-2">
          <p className="font-body-md text-[14px] text-on-surface-variant line-clamp-2">
            {podcast.overview}
          </p>
        </div>

        <a 
          href={podcast.audioUrl} 
          download 
          className="shrink-0 border border-outline-variant bg-surface-container hover:border-primary hover:text-primary text-on-surface-variant px-3 py-2 font-label-caps text-label-caps uppercase transition-colors flex items-center justify-center gap-1"
          title="Download .WAV"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
        </a>
      </div>

      <audio ref={audioRef} src={podcast.audioUrl} className="hidden" preload="none" onEnded={() => onPlayToggle(false)} />
    </div>
  );
}

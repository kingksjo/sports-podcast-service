import React, { useState, useEffect, useRef } from 'react';

export default function PodcastFeed() {
  const [playingId, setPlayingId] = useState(null);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const res = await fetch('/api/list');
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to fetch library: ${text}`);
        }
        const data = await res.json();
        setPodcasts(data.podcasts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);
  
  return (
    <div className="w-full max-w-3xl mt-12 flex flex-col gap-margin mb-margin">
      <div className="flex items-center gap-unit border-b border-outline-variant pb-2">
        <span className="material-symbols-outlined text-outline">history</span>
        <h2 className="font-headline-md text-[18px] text-on-surface uppercase">System Logs / Library</h2>
      </div>
      
      {loading ? (
        <div className="font-status-code text-status-code text-on-surface-variant animate-pulse">
          &gt; FETCHING_ARCHIVES...
        </div>
      ) : error ? (
        <div className="font-status-code text-status-code text-error border border-error-container bg-surface-container-highest p-unit flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[16px]">warning</span>
          {error}
        </div>
      ) : podcasts.length === 0 ? (
        <div className="font-status-code text-status-code text-on-surface-variant">
          &gt; NO_ARCHIVES_FOUND
        </div>
      ) : (
        <div className="flex flex-col gap-gutter">
          {podcasts.map((podcast) => (
            <FeedCard 
              key={podcast.blobName} 
              podcast={podcast} 
              isPlaying={playingId === podcast.blobName}
              onPlayToggle={(playing) => setPlayingId(playing ? podcast.blobName : null)}
            />
          ))}
        </div>
      )}
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
          {podcast.sport || 'UNKNOWN'} <span className="text-outline-variant">|</span> {podcast.match_title || podcast.blobName}
        </div>
      </div>
      
      <div className="p-gutter flex flex-col sm:flex-row items-start gap-gutter">
        <button 
          onClick={togglePlay}
          className={`shrink-0 w-12 h-12 border ${isPlaying ? 'border-primary text-primary' : 'border-outline-variant text-on-surface'} bg-surface-container-lowest hover:text-primary hover:border-primary flex items-center justify-center transition-colors`}
        >
          <span className="material-symbols-outlined text-[24px]">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <div className="flex-1 flex flex-col gap-2 w-full">
          <p className="font-body-md text-[14px] text-on-surface-variant line-clamp-2">
            {podcast.overview || 'Audio podcast successfully generated from the provided commentary.'}
          </p>
        </div>

        <a 
          href={podcast.podcastUrl} 
          download 
          className="shrink-0 w-full sm:w-auto border border-outline-variant bg-surface-container hover:border-primary hover:text-primary text-on-surface-variant px-3 py-2 font-label-caps text-label-caps uppercase transition-colors flex items-center justify-center gap-1"
          title="Download .WAV"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
        </a>
      </div>

      <audio ref={audioRef} src={podcast.podcastUrl} className="hidden" preload="none" onEnded={() => onPlayToggle(false)} />
    </div>
  );
}

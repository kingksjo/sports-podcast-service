import React, { useState, useEffect, useRef } from 'react';
import Layout from './components/Layout';
import FileDropzone from './components/FileDropzone';
import ProgressTracker from './components/ProgressTracker';
import PodcastPlayer from './components/PodcastPlayer';
import PodcastFeed from './components/PodcastFeed';

const DISPLAY_PHASES = ['UPLOADING', 'TRANSCRIBING', 'SYNTHESIZING', 'READY'];

function App() {
  const [file, setFile] = useState(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [logs, setLogs] = useState(['[SYS] System initialized and ready.']);
  
  const [blobName, setBlobName] = useState(null);
  const [podcastData, setPodcastData] = useState(null);
  const xhrRef = useRef(null);

  const currentPhase = DISPLAY_PHASES[phaseIndex];

  // Timer logic
  useEffect(() => {
    if (!file || currentPhase === 'READY') return;
    const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [file, currentPhase]);

  // Upload Logic
  useEffect(() => {
    if (!file || phaseIndex !== 0) return;

    let isCancelled = false;

    const uploadFile = async () => {
      try {
        setLogs(l => [...l, `[SYS] Requesting signed URL for ${file.name}...`]);
        const res = await fetch(`/api/upload-url?filename=${encodeURIComponent(file.name)}`);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to get upload URL: ${text}`);
        }
        const data = await res.json();
        
        if (isCancelled) return;

        setBlobName(data.blobName);
        setLogs(l => [...l, `[SYS] Signed URL acquired. Commencing upload to GCS...`]);

        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && !isCancelled) {
            const percentComplete = (event.loaded / event.total) * 100;
            setProgressValue(percentComplete);
          }
        };

        xhr.onload = () => {
          if (isCancelled) return;
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgressValue(100);
            setLogs(l => [...l, '[SYS] Upload complete. Pipeline active.']);
            setPhaseIndex(1); // Move to TRANSCRIBING
          } else {
            setLogs(l => [...l, `[ERR] Upload failed: ${xhr.statusText}`]);
          }
        };

        xhr.onerror = () => {
          if (isCancelled) return;
          setLogs(l => [...l, '[ERR] Upload failed due to network error.']);
        };

        xhr.open('PUT', data.signedUrl, true);
        xhr.setRequestHeader('Content-Type', 'audio/mpeg');
        xhr.send(file);
      } catch (error) {
        if (!isCancelled) {
          setLogs(l => [...l, `[ERR] ${error.message}`]);
        }
      }
    };

    uploadFile();

    return () => {
      isCancelled = true;
      if (xhrRef.current) {
        xhrRef.current.abort();
      }
    };
  }, [file, phaseIndex]);

  // Polling Logic
  useEffect(() => {
    if (!blobName || currentPhase === 'UPLOADING' || currentPhase === 'READY') return;

    // Cycle through TRANSCRIBING / SYNTHESIZING to keep UI dynamic
    const cyclePhase = setTimeout(() => {
      if (currentPhase === 'TRANSCRIBING') {
        setPhaseIndex(2); // SYNTHESIZING
        setLogs(l => [...l, '[SYS] NLP parsing complete. Synthesizing audio...']);
      }
    }, 15000);

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/status?filename=${encodeURIComponent(blobName)}`);
        if (!res.ok) throw new Error('Failed to check status');
        const data = await res.json();

        if (data.status === 'ready') {
          setPodcastData(data);
          setPhaseIndex(3); // READY
          setLogs(l => [...l, '[SYS] Podcast generation successful.']);
        } else {
          // Add occasional log ticks
          if (Math.random() > 0.6) {
            setLogs(l => {
              const newLogs = [...l, `> Polling active... [PID: ${Math.floor(Math.random()*9000)}]`];
              return newLogs.slice(-10); // keep logs manageable
            });
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    const interval = setInterval(pollStatus, 5000); // Poll every 5 seconds

    return () => {
      clearTimeout(cyclePhase);
      clearInterval(interval);
    };
  }, [blobName, currentPhase]);


  const handleFileAccepted = (acceptedFile) => {
    setFile(acceptedFile);
    setPhaseIndex(0);
    setElapsed(0);
    setProgressValue(0);
    setBlobName(null);
    setPodcastData(null);
    setLogs(['[SYS] Allocating memory blocks... OK']);
  }

  const handleAbort = () => {
    if (xhrRef.current) xhrRef.current.abort();
    setFile(null);
    setPhaseIndex(0);
    setBlobName(null);
    setPodcastData(null);
  }

  return (
    <Layout footer={<PodcastFeed />}>
      {!file ? (
        <FileDropzone onFileAccepted={handleFileAccepted} />
      ) : currentPhase !== 'READY' ? (
        <ProgressTracker 
          currentPhase={currentPhase}
          logs={logs}
          elapsed={elapsed}
          progressValue={progressValue}
          onAbort={handleAbort}
        />
      ) : (
        <PodcastPlayer 
          audioUrl={podcastData?.podcastUrl}
          metadata={{
            sport: podcastData?.sport,
            title: podcastData?.match_title,
            overview: podcastData?.overview
          }}
          onReset={handleAbort}
        />
      )}
    </Layout>
  )
}

export default App;

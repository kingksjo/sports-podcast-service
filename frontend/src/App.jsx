import React, { useState, useEffect } from 'react'
import Layout from './components/Layout'
import FileDropzone from './components/FileDropzone'
import ProgressTracker from './components/ProgressTracker'
import PodcastPlayer from './components/PodcastPlayer'
import PodcastFeed from './components/PodcastFeed'

const SIMULATION_PHASES = ['UPLOADING', 'TRANSCRIBING', 'SYNTHESIZING', 'READY'];

function App() {
  const [file, setFile] = useState(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [logs, setLogs] = useState(['[SYS] Allocating memory blocks... OK']);

  const currentPhase = SIMULATION_PHASES[phaseIndex];

  // Simulation logic
  useEffect(() => {
    if (!file || phaseIndex === SIMULATION_PHASES.length - 1) return;

    // Timer
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [file, phaseIndex]);

  useEffect(() => {
    if (!file) return;

    if (currentPhase === 'UPLOADING') {
      const uploader = setInterval(() => {
        setProgressValue(prev => {
          if (prev >= 100) {
            clearInterval(uploader);
            setPhaseIndex(1);
            setLogs(l => [...l, '[SYS] Upload complete. Commencing transcription.']);
            return 100;
          }
          return prev + 10;
        });
      }, 300);
      return () => clearInterval(uploader);
    } 
    
    if (currentPhase === 'TRANSCRIBING') {
      const transcriber = setTimeout(() => {
        setPhaseIndex(2);
        setLogs(l => [...l, '[SYS] Parsing audio stream chunks [1..42]', '[WARN] Frame dropout detected - Recovering...', '> Chunk 43 processing...']);
      }, 3000);
      return () => clearTimeout(transcriber);
    }

    if (currentPhase === 'SYNTHESIZING') {
      const synthesizer = setTimeout(() => {
        setPhaseIndex(3); // READY
        setLogs(l => [...l, '[SYS] Audio synthesized successfully.']);
      }, 3000);
      return () => clearTimeout(synthesizer);
    }

  }, [currentPhase, file]);

  const handleFileAccepted = (acceptedFile) => {
    setFile(acceptedFile);
    setPhaseIndex(0);
    setElapsed(0);
    setProgressValue(0);
    setLogs(['[SYS] Allocating memory blocks... OK']);
  }

  const handleAbort = () => {
    setFile(null);
    setPhaseIndex(0);
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
          metadata={{
            sport: 'FORMULA 1',
            title: 'MONZA GRAND PRIX',
            overview: 'The 2026 Italian Grand Prix was a Formula One motor race that took place on 6 September 2026 at the Autodromo Nazionale di Monza in Monza, Italy.'
          }}
          onReset={handleAbort}
        />
      )}
    </Layout>
  )
}

export default App

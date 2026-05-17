import React, { useState, useCallback } from 'react';

export default function FileDropzone({ onFileAccepted }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setError(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('audio/')) {
        onFileAccepted(file);
      } else {
        setError('ERR: INVALID_FORMAT. EXPECTED AUDIO FILE.');
      }
    }
  }, [onFileAccepted]);

  const handleFileInput = useCallback((e) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('audio/')) {
        onFileAccepted(file);
      } else {
        setError('ERR: INVALID_FORMAT. EXPECTED AUDIO FILE.');
      }
    }
  }, [onFileAccepted]);

  return (
    <div className="flex flex-col gap-unit w-full">
      <div 
        className={`h-[40vh] min-h-[250px] border-2 border-dashed flex flex-col justify-center items-center transition-colors duration-100 cursor-pointer p-gutter ${
          isDragActive 
            ? 'border-primary bg-surface-container-high' 
            : 'border-outline-variant bg-surface-container hover:border-outline hover:bg-surface-container-high'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('audio-upload')?.click()}
      >
        <input 
          id="audio-upload" 
          type="file" 
          accept="audio/*" 
          className="hidden" 
          onChange={handleFileInput} 
        />
        <div className="flex flex-col items-center gap-margin">
          <span className={`material-symbols-outlined text-[48px] ${isDragActive ? 'text-primary' : 'text-outline'}`}>
            audio_file
          </span>
          <div className="font-headline-md text-headline-md text-on-surface text-center uppercase tracking-wider">
            {isDragActive ? '> INITIATE_TRANSFER' : 'DROP COMMENTARY AUDIO HERE'}
          </div>
          <div className="font-status-code text-status-code text-on-surface-variant">
            Or click to browse file system
          </div>
        </div>
      </div>
      {error && (
        <div className="font-status-code text-status-code text-error border border-error-container bg-surface-container-highest p-unit flex items-center gap-2 mt-2">
          <span className="material-symbols-outlined text-error text-[16px]">warning</span>
          {error}
        </div>
      )}
    </div>
  );
}

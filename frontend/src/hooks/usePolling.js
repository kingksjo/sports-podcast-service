import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to poll status of podcast processing
 * Checks every 2 seconds until complete or error
 */
export function usePolling(gcsUri) {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);

  const startPolling = useCallback(async () => {
    if (!gcsUri) return;

    setStatus('processing');
    setError(null);

    const poll = async () => {
      try {
        const response = await fetch(`/api/status?gcsUri=${encodeURIComponent(gcsUri)}`);

        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }

        const data = await response.json();

        if (data.status === 'complete') {
          setResult(data);
          setStatus('success');
          clearInterval(pollingIntervalRef.current);
        } else if (data.status === 'error') {
          setError(data.message || 'Processing failed');
          setStatus('error');
          clearInterval(pollingIntervalRef.current);
        } else {
          setStatus('processing');
        }
      } catch (err) {
        setError(err.message);
        setStatus('error');
        clearInterval(pollingIntervalRef.current);
      }
    };

    // Initial poll
    await poll();

    // Poll every 2 seconds
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(poll, 2000);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [gcsUri]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  }, []);

  useEffect(() => {
    return stopPolling;
  }, [stopPolling]);

  return { status, result, error, startPolling, stopPolling };
}

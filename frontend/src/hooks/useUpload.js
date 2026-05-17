import { useState, useCallback } from 'react';

/**
 * Hook to handle file upload:
 * 1. Get signed URL from backend
 * 2. Upload file directly to GCS using PUT
 * 3. Return GCS URI for polling
 */
export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const uploadFile = useCallback(async (file) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // Step 1: Get signed URL
      const getSignedUrlResponse = await fetch(
        `/api/upload-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`
      );

      if (!getSignedUrlResponse.ok) {
        throw new Error('Failed to get signed URL');
      }

      const { signedUrl, gcsUri } = await getSignedUrlResponse.json();

      // Step 2: Upload file to GCS
      const uploadResponse = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      setIsUploading(false);
      return gcsUri;
    } catch (error) {
      const errorMessage = error.message || 'Upload failed';
      setUploadError(errorMessage);
      setIsUploading(false);
      throw error;
    }
  }, []);

  return { uploadFile, isUploading, uploadError };
}

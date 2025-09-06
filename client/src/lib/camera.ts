import { useRef, useState, useCallback } from 'react';

export interface CameraOptions {
  video: {
    width: { ideal: number };
    height: { ideal: number };
    facingMode?: 'user' | 'environment';
  };
}

export const useCameraAccess = () => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const requestCameraAccess = useCallback(async (options: CameraOptions = {
    video: { width: { ideal: 1280 }, height: { ideal: 720 } }
  }) => {
    try {
      setError(null);
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false);
        setError('Camera access is not supported in this browser');
        return null;
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia(options);
      streamRef.current = stream;
      setHasPermission(true);
      
      return stream;
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Camera access denied. Please allow camera permissions.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on this device.');
        } else if (err.name === 'NotReadableError') {
          setError('Camera is already in use by another application.');
        } else {
          setError('Failed to access camera: ' + err.message);
        }
      } else {
        setError('Failed to access camera');
      }
      
      return null;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const captureFrame = useCallback((videoElement: HTMLVideoElement): string | null => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        setError('Failed to create canvas context');
        return null;
      }

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      context.drawImage(videoElement, 0, 0);
      
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (err) {
      console.error('Frame capture error:', err);
      setError('Failed to capture frame');
      return null;
    }
  }, []);

  return {
    isSupported,
    hasPermission,
    error,
    requestCameraAccess,
    stopCamera,
    captureFrame
  };
};

export const convertDataURLToBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

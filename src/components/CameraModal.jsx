import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, RotateCcw, X } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const closeButtonRef = useRef(null);
  const nativeCameraInputRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setReady(false);
  }, []);

  const closeCamera = useCallback(() => {
    stopCamera();
    setError('');
    onClose();
  }, [onClose, stopCamera]);

  useEffect(() => {
    if (!isOpen) return undefined;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeCamera();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCamera]);

  useEffect(() => {
    if (!isOpen) return undefined;
    let active = true;
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Live camera requires HTTPS or an integrated camera. You can still use your device camera below.');
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facingMode } }, audio: false });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // iOS Safari WebKit sometimes requires an explicit play() call on attached streams
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch (cameraError) {
        if (active) setError(cameraError.message || 'Could not open the live camera. Use your device camera or upload a photo below.');
      }
    };

    startCamera();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const handleNativeCameraFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onCapture(reader.result);
        closeCamera();
      }
    };
    reader.readAsDataURL(file);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL('image/jpeg', 0.9));
    closeCamera();
  };

  return (
    <div className="camera-backdrop" onClick={(event) => { if (event.target === event.currentTarget) closeCamera(); }}>
      <section className="camera-dialog" role="dialog" aria-modal="true" aria-labelledby="camera-title">
        <header className="camera-dialog-header">
          <div><h2 id="camera-title">Take a photo</h2><p>Your browser will ask for camera access.</p></div>
          <button ref={closeButtonRef} className="icon-button" type="button" aria-label="Close camera" onClick={closeCamera}><X size={19} /></button>
        </header>
        <div className="camera-viewport">
          {error ? (
            <div className="camera-error" role="alert">
              <p style={{ margin: 0 }}>{error}</p>
              <button
                type="button"
                className="button button-primary"
                onClick={() => nativeCameraInputRef.current?.click()}
              >
                <Camera size={16} aria-hidden="true" /> Open device camera / gallery
              </button>
            </div>
          ) : (
            <video ref={videoRef} autoPlay playsInline muted aria-label="Camera preview" />
          )}
        </div>
        <footer className="camera-dialog-actions">
          <button className="button button-secondary" type="button" onClick={() => nativeCameraInputRef.current?.click()}>
            Device camera
          </button>
          <button className="button button-secondary" type="button" disabled={!ready} onClick={() => { setReady(false); setError(''); setFacingMode(mode => mode === 'environment' ? 'user' : 'environment'); }}><RotateCcw size={16} aria-hidden="true" /> Switch camera</button>
          <button className="button button-primary" type="button" disabled={!ready} onClick={capture}><Camera size={16} aria-hidden="true" /> Capture</button>
        </footer>
        <input
          ref={nativeCameraInputRef}
          className="visually-hidden"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleNativeCameraFile}
          aria-label="Capture photo with device camera"
        />
      </section>
    </div>
  );
}

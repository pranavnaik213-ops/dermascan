import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, Zap, AlertCircle } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const [_stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' or 'user'
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const streamRef = useRef(null);

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function initCamera() {
      try {
        const constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        };
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (active) {
          streamRef.current = mediaStream;
          setStream(mediaStream);
          setErrorMsg('');
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } else {
          mediaStream.getTracks().forEach(t => t.stop());
        }
      } catch {
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          if (active) {
            streamRef.current = fallback;
            setStream(fallback);
            setErrorMsg('');
            if (videoRef.current) {
              videoRef.current.srcObject = fallback;
            }
          } else {
            fallback.getTracks().forEach(t => t.stop());
          }
        } catch {
          if (active) {
            setErrorMsg("Unable to access hardware camera. Please ensure camera permissions are allowed in your browser settings.");
          }
        }
      }
    }

    initCamera();

    return () => {
      active = false;
      stopTracks();
    };
  }, [facingMode, retryCount, stopTracks]);

  const handleFlipCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopTracks();

    setTimeout(() => {
      setIsCapturing(false);
      onCapture(dataUrl);
      onClose();
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(9, 14, 23, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-card-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Camera size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                Field Lesion Viewfinder
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Center the animal's skin lesion inside the green reticle
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              stopTracks();
              onClose();
            }}
            aria-label="Close Camera"
            className="btn-3d btn-3d-ghost"
            style={{ width: '34px', height: '34px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Viewport Area */}
        <div style={{ position: 'relative', width: '100%', height: '380px', background: '#000000', overflow: 'hidden' }}>
          {errorMsg ? (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              padding: '24px',
              textAlign: 'center',
              color: '#ffffff'
            }}>
              <AlertCircle size={42} color="var(--emergency)" />
              <div style={{ fontSize: '0.95rem', maxWidth: '400px', lineHeight: 1.5 }}>
                {errorMsg}
              </div>
              <button
                onClick={() => setRetryCount(c => c + 1)}
                className="btn-3d btn-3d-primary"
                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
              >
                <RefreshCw size={14} /> Retry Camera Connection
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />

              {/* Medical Diagnostic Reticle Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none'
                }}
              >
                <div
                  style={{
                    width: '240px',
                    height: '240px',
                    border: '2px dashed rgba(16, 185, 129, 0.75)',
                    borderRadius: '16px',
                    position: 'relative',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)'
                  }}
                >
                  {/* Four Corner Target Brackets */}
                  <div style={{ position: 'absolute', top: '-2px', left: '-2px', width: '20px', height: '20px', borderTop: '4px solid #10b981', borderLeft: '4px solid #10b981' }} />
                  <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '20px', height: '20px', borderTop: '4px solid #10b981', borderRight: '4px solid #10b981' }} />
                  <div style={{ position: 'absolute', bottom: '-2px', left: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #10b981', borderLeft: '4px solid #10b981' }} />
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '20px', height: '20px', borderBottom: '4px solid #10b981', borderRight: '4px solid #10b981' }} />

                  <div style={{
                    position: 'absolute',
                    top: '-26px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(16, 185, 129, 0.9)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.04em'
                  }}>
                    LESION TARGET ZONE
                  </div>
                </div>
              </div>

              {/* Shutter Flash Animation */}
              {isCapturing && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: '#ffffff',
                  opacity: 0.85,
                  transition: 'opacity 0.2s ease',
                  zIndex: 10
                }} />
              )}
            </>
          )}
        </div>

        {/* Offscreen Canvas for Frame Capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Controls Footer */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--border-color)'
        }}>
          {/* Flip Camera Button */}
          <button
            onClick={handleFlipCamera}
            disabled={!!errorMsg}
            className="btn-3d btn-3d-secondary"
            style={{
              padding: '8px 14px',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={15} />
            <span>Flip ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
          </button>

          {/* Shutter Button */}
          <button
            onClick={handleTakeSnapshot}
            disabled={!!errorMsg}
            className="btn-3d btn-3d-primary"
            style={{
              padding: '12px 28px',
              fontSize: '0.95rem',
              fontWeight: 800,
              borderRadius: 'var(--radius-full)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 18px var(--primary-glow)'
            }}
          >
            <Zap size={18} />
            <span>Capture Photo</span>
          </button>

          {/* Cancel */}
          <button
            onClick={() => {
              stopTracks();
              onClose();
            }}
            className="btn-3d btn-3d-ghost"
            style={{ padding: '8px 14px', fontSize: '0.8rem' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
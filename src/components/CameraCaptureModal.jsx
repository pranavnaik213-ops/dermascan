import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Check, SwitchCamera, AlertCircle, Image as ImageIcon } from 'lucide-react';

export default function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize Camera stream when modal opens or facingMode changes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setIsLoading(true);
    setErrorMsg('');
    stopCamera();

    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsLoading(false);
    } catch (err) {
      console.error("Camera access error:", err);
      setIsLoading(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMsg('No camera device found on this system.');
      } else {
        setErrorMsg('Unable to access live webcam camera: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  const handleFallbackFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onCapture(event.target.result);
        onClose();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-card, #1e293b)',
        color: 'var(--text-main, #ffffff)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.05rem' }}>
            <Camera size={20} color="var(--primary, #10b981)" />
            <span>Camera Capture</span>
          </div>
          <button
            onClick={() => { stopCamera(); onClose(); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted, #94a3b8)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '340px',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          
          {capturedImage ? (
            /* Captured Snapshot Preview */
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <img
                src={capturedImage}
                alt="Captured animal"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                top: 12,
                left: 12,
                background: 'rgba(16, 185, 129, 0.9)',
                color: '#fff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Check size={14} /> Photo Captured
              </div>
            </div>
          ) : errorMsg ? (
            /* Camera Permission Error State */
            <div style={{ textAlign: 'center', padding: '24px', maxWidth: '400px' }}>
              <AlertCircle size={44} color="#ef4444" style={{ marginBottom: '12px' }} />
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f87171', marginBottom: '8px' }}>
                Camera Access Needed
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.4 }}>
                {errorMsg}
              </p>
              
              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--primary, #10b981)',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}>
                <ImageIcon size={18} />
                Upload Photo from Device
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFallbackFileInput}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          ) : (
            /* Live Stream Video Viewfinder */
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none'
                }}
              />
              
              {/* Target Focus Overlay frame */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '75%',
                height: '75%',
                border: '2px dashed rgba(255, 255, 255, 0.6)',
                borderRadius: '12px',
                pointerEvents: 'none',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.35)'
              }}>
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  width: '100%',
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                }}>
                  Center animal lesion inside frame
                </div>
              </div>

              {/* Camera Switcher Button */}
              <button
                onClick={toggleFacingMode}
                title="Switch Front/Back Camera"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <SwitchCamera size={16} /> Flip
              </button>

              {isLoading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  gap: '8px'
                }}>
                  <RefreshCw className="animate-spin" size={20} /> Starting Camera...
                </div>
              )}
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-main, #0f172a)'
        }}>
          {capturedImage ? (
            <>
              <button
                onClick={handleRetake}
                className="interactive-card"
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={16} /> Retake
              </button>

              <button
                onClick={handleConfirmPhoto}
                style={{
                  padding: '10px 22px',
                  borderRadius: '10px',
                  background: 'var(--primary, #10b981)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Check size={18} /> Use This Photo
              </button>
            </>
          ) : (
            <>
              <label style={{
                color: 'var(--text-muted, #94a3b8)',
                fontSize: '0.825rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <ImageIcon size={16} /> Gallery Fallback
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFallbackFileInput}
                  style={{ display: 'none' }}
                />
              </label>

              {!errorMsg && (
                <button
                  onClick={handleTakeSnapshot}
                  disabled={isLoading}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '50px',
                    background: 'var(--primary, #10b981)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Camera size={20} /> Snap Photo
                </button>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, ArrowLeftRight, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "DAY 1: ACUTE MANGE",
  afterLabel = "DAY 28: RECOVERED",
  aspectRatio = "16/9"
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleInteractionStart = () => setIsDragging(true);
  const handleInteractionEnd = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleInteractionEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleInteractionEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleInteractionEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleInteractionEnd);
    };
  }, [isDragging, handleMouseMove, handleTouchMove]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
      {/* Slider Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleInteractionStart}
        onTouchStart={handleInteractionStart}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: aspectRatio,
          minHeight: '260px',
          maxHeight: '380px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          userSelect: 'none',
          cursor: 'ew-resize',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card-subtle)'
        }}
      >
        {/* Base Layer: After Image (Full Background) */}
        <img
          src={afterImage}
          alt={afterLabel}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            pointerEvents: 'none'
          }}
        />

        {/* After Badge (Top Right) */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'rgba(5, 150, 105, 0.92)',
          color: '#ffffff',
          fontSize: '0.72rem',
          fontWeight: 800,
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          letterSpacing: '0.04em',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          zIndex: 3
        }}>
          <CheckCircle2 size={13} />
          <span>{afterLabel}</span>
        </div>

        {/* Clipped Top Layer: Before Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
            pointerEvents: 'none'
          }}
        >
          <img
            src={beforeImage}
            alt={beforeLabel}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />

          {/* Before Badge (Top Left) */}
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: 'rgba(239, 68, 68, 0.92)',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            letterSpacing: '0.04em',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
          }}>
            <AlertTriangle size={13} />
            <span>{beforeLabel}</span>
          </div>
        </div>

        {/* Interactive Vertical Divider Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sliderPosition}%`,
            width: '2px',
            background: '#ffffff',
            boxShadow: '0 0 12px rgba(0, 0, 0, 0.6)',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 4
          }}
        >
          {/* Glowing Draggable Center Pill */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, #047857 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.5), 0 0 0 3px #ffffff',
              transition: isDragging ? 'none' : 'transform 0.15s ease',
              scale: isDragging ? '1.1' : '1'
            }}
          >
            <ArrowLeftRight size={16} strokeWidth={2.4} />
          </div>
        </div>
      </div>

      {/* Caption & Interaction Cue */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.76rem',
        color: 'var(--text-muted)',
        padding: '0 4px'
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={12} color="var(--primary)" />
          Drag or swipe slider horizontally to compare tissue healing
        </span>
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
          {Math.round(sliderPosition)}% View
        </span>
      </div>
    </div>
  );
}

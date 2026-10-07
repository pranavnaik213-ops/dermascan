import React, { useState } from 'react';

export default function ImageSlider({ beforeImage, afterImage, beforeLabel = "Original Photo", afterLabel = "Grad-CAM Heatmap" }) {
  const [sliderPos, setSliderPos] = useState(50);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.min(Math.max((x / width) * 100, 0), 100);
    setSliderPos(percentage);
  };

  const handleTouchMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const width = rect.width;
    const percentage = Math.min(Math.max((x / width) * 100, 0), 100);
    setSliderPos(percentage);
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      style={{
        position: 'relative',
        width: '100%',
        height: '320px',
        borderRadius: '16px',
        overflow: 'hidden',
        userSelect: 'none',
        cursor: 'ew-resize',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)'
      }}
    >
      {/* Background After Image (Grad-CAM or Day 28) */}
      <img 
        src={afterImage} 
        alt={afterLabel} 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />

      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'var(--primary)',
        color: '#ffffff',
        fontSize: '0.725rem',
        fontWeight: 800,
        padding: '3px 8px',
        borderRadius: '6px',
        zIndex: 5
      }}>
        {afterLabel}
      </div>

      {/* Foreground Before Image (Clipped) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: `${sliderPos}%`,
        height: '100%',
        overflow: 'hidden',
        borderRight: '2px solid #ffffff',
        boxShadow: '2px 0 10px rgba(0,0,0,0.3)',
        zIndex: 2
      }}>
        <img 
          src={beforeImage} 
          alt={beforeLabel} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            maxWidth: 'none'
          }}
        />

        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(15, 23, 42, 0.85)',
          color: '#ffffff',
          fontSize: '0.725rem',
          fontWeight: 800,
          padding: '3px 8px',
          borderRadius: '6px',
          zIndex: 5
        }}>
          {beforeLabel}
        </div>
      </div>

      {/* Slider Control Line & Handle */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: `${sliderPos}%`,
        transform: 'translateX(-50%)',
        height: '100%',
        width: '4px',
        background: '#ffffff',
        boxShadow: '0 0 10px rgba(0,0,0,0.4)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--primary)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.85rem',
          fontWeight: 800,
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          border: '2px solid #ffffff'
        }}>
          ↔
        </div>
      </div>

    </div>
  );
}

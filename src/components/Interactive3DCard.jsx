import React, { useState, useRef } from 'react';

/**
 * Interactive3DCard
 * Provides realistic 3D perspective mouse-tilt physics, specular glass glare,
 * and multi-depth floating layer support.
 */
export default function Interactive3DCard({ 
  children, 
  style = {}, 
  className = '', 
  maxTilt = 12, 
  scale = 1.02,
  glare = true,
  onClick
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-maxTilt to +maxTilt)
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    // Calculate glare position
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTransform({
      rotateX: Number(rotateX.toFixed(2)),
      rotateY: Number(rotateY.toFixed(2)),
      scale: scale,
      glareX: Number(glareX.toFixed(1)),
      glareY: Number(glareY.toFixed(1)),
      glareOpacity: 0.22
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0
    });
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`card-3d-wrapper ${className}`}
      style={{
        position: 'relative',
        perspective: '1200px',
        transformStyle: 'preserve-3d',
        ...style
      }}
    >
      <div
        className="card-3d-inner"
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transform: `perspective(1200px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale3d(${transform.scale}, ${transform.scale}, ${transform.scale})`,
          transition: isHovered 
            ? 'transform 0.08s ease-out, box-shadow 0.2s ease' 
            : 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
          borderRadius: 'inherit'
        }}
      >
        {children}

        {/* Dynamic Specular Glass Glare Overlay */}
        {glare && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              borderRadius: 'inherit',
              background: `radial-gradient(circle at ${transform.glareX}% ${transform.glareY}%, rgba(255, 255, 255, ${transform.glareOpacity}) 0%, transparent 60%)`,
              mixBlendMode: 'overlay',
              transition: isHovered ? 'opacity 0.15s ease' : 'opacity 0.5s ease',
              zIndex: 30
            }}
          />
        )}
      </div>
    </div>
  );
}


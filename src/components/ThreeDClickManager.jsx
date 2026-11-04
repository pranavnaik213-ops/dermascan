import React, { useEffect } from 'react';

/**
 * ThreeDClickManager
 * Injects real-time 3D interactive shockwave rings on click events and creates
 * mechanical tactile feedback for buttons and interactive cards.
 */
export default function ThreeDClickManager() {
  useEffect(() => {
    let audioCtx = null;

    // Optional subtle high-tech tactile click sound (gentle synth click)
    const playHapticClickSound = () => {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtx) audioCtx = new AudioContextClass();
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
      } catch {
        // AudioContext silent fallback if disabled by browser policies
      }
    };

    const handlePointerDown = (e) => {
      const target = e.target;
      const buttonOrCard = target.closest('button, a, .interactive-card, .btn-3d, input[type="button"], input[type="submit"]');

      // Create 3D Shockwave Ring at click location
      const ring = document.createElement('div');
      ring.className = 'shockwave-3d-ring';
      
      const size = 110;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;

      // If clicked on an emergency or danger button, tint ring red
      if (buttonOrCard && (buttonOrCard.classList.contains('btn-3d-danger') || buttonOrCard.classList.contains('btn-danger') || buttonOrCard.innerText?.includes('SOS') || buttonOrCard.innerText?.includes('Emergency'))) {
        ring.style.borderColor = '#ef4444';
        ring.style.boxShadow = '0 0 24px 3px #ef4444, inset 0 0 16px #ef4444';
      }

      document.body.appendChild(ring);

      // Play soft haptic audio feedback
      playHapticClickSound();

      // Remove ring after animation finishes
      setTimeout(() => {
        if (ring.parentNode) {
          ring.parentNode.removeChild(ring);
        }
      }, 550);

      // Add temporary is-clicked class for extra punchy depression if button
      if (buttonOrCard && buttonOrCard.classList) {
        buttonOrCard.classList.add('is-clicked');
        setTimeout(() => {
          buttonOrCard.classList.remove('is-clicked');
        }, 180);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, []);

  return null;
}


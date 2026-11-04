import React, { useEffect, useRef } from 'react';

/**
 * Interactive3DScene
 * Real-time 3D projected mathematical wireframe nodes, ambient floating particles,
 * and mouse-tracking 3D camera parallax for an immersive sci-fi/medical aesthetic.
 */
export default function Interactive3DScene() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 3D Particles
    const particleCount = 70;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 1000 + 100,
        radius: Math.random() * 2.5 + 1.2,
        speedZ: Math.random() * 0.8 + 0.3,
        color: Math.random() > 0.4 ? 'rgba(5, 150, 105, ' : 'rgba(2, 132, 199, '
      });
    }

    // 3D Wireframe Icosahedron / Octahedron Nodes
    const nodes = [
      { x: -width * 0.35, y: -height * 0.2, z: 450, rotX: 0, rotY: 0, rotZ: 0, size: 75, color: '#10b981' },
      { x: width * 0.38, y: -height * 0.1, z: 380, rotX: 0, rotY: 0, rotZ: 0, size: 90, color: '#0284c7' },
      { x: width * 0.3, y: height * 0.35, z: 520, rotX: 0, rotY: 0, rotZ: 0, size: 65, color: '#059669' },
      { x: -width * 0.38, y: height * 0.3, z: 600, rotX: 0, rotY: 0, rotZ: 0, size: 80, color: '#14b8a6' }
    ];

    // Octahedron vertices
    const baseVertices = [
      [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1]
    ];
    const edges = [
      [0, 2], [0, 3], [0, 4], [0, 5],
      [1, 2], [1, 3], [1, 4], [1, 5],
      [2, 4], [4, 3], [3, 5], [5, 2]
    ];

    const rotatePoint = (p, rx, ry, rz) => {
      let [x, y, z] = p;
      // Rot X
      let y1 = y * Math.cos(rx) - z * Math.sin(rx);
      let z1 = y * Math.sin(rx) + z * Math.cos(rx);
      // Rot Y
      let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
      // Rot Z
      let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
      let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
      return [x3, y3, z2];
    };

    const focalLength = 650;

    let time = 0;
    const render = () => {
      time += 0.012;
      // Damped mouse follow
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      const camOffsetX = (mouseX - width / 2) * 0.25;
      const camOffsetY = (mouseY - height / 2) * 0.25;

      ctx.clearRect(0, 0, width, height);

      // Render 3D Background Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.z -= p.speedZ;
        if (p.z <= 10) p.z = 1000;

        const depthScale = focalLength / (focalLength + p.z);
        const screenX = (p.x - camOffsetX) * depthScale + width / 2;
        const screenY = (p.y - camOffsetY) * depthScale + height / 2;

        if (screenX >= 0 && screenX <= width && screenY >= 0 && screenY <= height) {
          const alpha = (1 - p.z / 1000) * 0.55;
          ctx.beginPath();
          ctx.arc(screenX, screenY, p.radius * depthScale, 0, Math.PI * 2);
          ctx.fillStyle = p.color + alpha + ')';
          ctx.fill();
        }
      }

      // Render 3D Floating Wireframe Geometric Polyhedra
      for (let n = 0; n < nodes.length; n++) {
        const node = nodes[n];
        node.rotX += 0.008;
        node.rotY += 0.012;
        node.rotZ += 0.005;

        const effectiveX = node.x - camOffsetX * 0.5 + Math.sin(time + n) * 15;
        const effectiveY = node.y - camOffsetY * 0.5 + Math.cos(time + n) * 15;
        const effectiveZ = node.z;

        const depthScale = focalLength / (focalLength + effectiveZ);
        const originX = effectiveX * depthScale + width / 2;
        const originY = effectiveY * depthScale + height / 2;

        const projectedVertices = baseVertices.map((v) => {
          const rotated = rotatePoint(
            [v[0] * node.size, v[1] * node.size, v[2] * node.size],
            node.rotX,
            node.rotY,
            node.rotZ
          );
          return [
            originX + rotated[0] * depthScale,
            originY + rotated[1] * depthScale
          ];
        });

        // Draw edges
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1.3 * depthScale;
        ctx.globalAlpha = 0.35 * depthScale;

        for (let e = 0; e < edges.length; e++) {
          const [i1, i2] = edges[e];
          ctx.beginPath();
          ctx.moveTo(projectedVertices[i1][0], projectedVertices[i1][1]);
          ctx.lineTo(projectedVertices[i2][0], projectedVertices[i2][1]);
          ctx.stroke();
        }

        // Draw vertices
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.65 * depthScale;
        for (let v = 0; v < projectedVertices.length; v++) {
          ctx.beginPath();
          ctx.arc(projectedVertices[v][0], projectedVertices[v][1], 3 * depthScale, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85
      }}
    />
  );
}


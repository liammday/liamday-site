import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface HeroStat {
  label: string;
  value: string;
  detail: string;
}

interface DefenseHeroProps {
  badge: string;
  profileText: string;
  stats: HeroStat[];
}

const ParticleField = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 1000;
  
  const positions = useMemo(() => {
    const p = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      p[i * 3] = (Math.random() - 0.5) * 15;
      p[i * 3 + 1] = (Math.random() - 0.5) * 15;
      p[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return p;
  }, [particleCount]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
      pointsRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="var(--color-ember-400)" size={0.05} sizeAttenuation={true} depthWrite={false} />
    </Points>
  );
};

const AbstractCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 1]} />
        <meshBasicMaterial wireframe color="var(--color-aluminum-300)" transparent opacity={0.3} />
      </mesh>
      <mesh>
        <icosahedronGeometry args={[1.8, 0]} />
        <meshStandardMaterial color="var(--color-charcoal-900)" roughness={0.1} metalness={0.8} />
      </mesh>
    </Float>
  );
};

export default function DefenseHero({ badge, profileText, stats }: DefenseHeroProps) {
  const [accent, setAccent] = useState('0 240 255');
  
  useEffect(() => {
    // Dynamic color spectrum based on time of day (sun/moon position equivalent)
    const updateSpectrum = () => {
      const now = new Date();
      const hour = now.getHours() + now.getMinutes() / 60; // 0-24
      
      // Calculate a color mapping. We will use a tactical palette:
      // Morning (6-12): Warm gold / orange -> 255 180 0
      // Afternoon (12-18): Deep Ember -> 255 57 20
      // Evening (18-22): Purple/Violet -> 180 0 255
      // Night (22-6): Tactical Cyan -> 0 240 255

      // For smoother transitions, we would normally interpolate RGB, 
      // but for this prototype, we'll shift over a few key tactical colors.
      let r, g, b;
      
      if (hour >= 6 && hour < 12) {
        // Morning to noon (Cyan transitioning to Orange/Gold)
        r = 255; g = 180; b = 0;
      } else if (hour >= 12 && hour < 18) {
        // Afternoon (Orange transitioning to Red/Ember)
        r = 255; g = 57; b = 20;
      } else if (hour >= 18 && hour < 22) {
        // Evening (Red transitioning to Purple)
        r = 180; g = 0; b = 255;
      } else {
        // Night (Cyan)
        r = 0; g = 240; b = 255;
      }

      setAccent(`${r} ${g} ${b}`);
    };

    updateSpectrum();
    const interval = setInterval(updateSpectrum, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="relative w-full min-h-screen overflow-hidden bg-charcoal-900"
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 z-0 opacity-80">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} color={`rgb(${accent})`} />
          <pointLight position={[-10, -10, -5]} intensity={1} color="rgb(var(--color-aluminum-200))" />
          
          <ParticleField />
          <AbstractCore />
        </Canvas>
      </div>

      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
           style={{ 
             backgroundImage: 'linear-gradient(rgb(var(--color-aluminum-500)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-aluminum-500)) 1px, transparent 1px)',
             backgroundSize: '4rem 4rem'
           }}>
      </div>

      {/* Content Container */}
      <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 min-h-screen flex flex-col justify-center pointer-events-none">
        
        {/* Main Badge / Eyebrow */}
        <div className="mb-8 font-mono text-xs uppercase tracking-widest text-ember-400">
          {badge}
        </div>

        {/* Center Content */}
        <div className="max-w-3xl text-left pointer-events-auto">
          <h1 className="type-display text-5xl md:text-7xl font-semibold tracking-tight mb-8 text-aluminum-100 leading-tight">
            Liam Day
          </h1>
          
          {/* Profile Text */}
          <p className="type-heading text-lg md:text-xl text-aluminum-300 font-light mb-12 leading-relaxed">
            {profileText}
          </p>

          <a href="#experience" className="group relative inline-flex items-center justify-center gap-4 border border-ember-400/50 bg-charcoal-900/80 backdrop-blur-md px-8 py-4 text-sm font-mono font-medium text-aluminum-100 uppercase tracking-widest transition-all hover:bg-ember-400 hover:text-charcoal-950 focus:outline-none">
            <span className="absolute left-0 top-0 h-[2px] w-0 bg-ember-400 transition-all duration-300 group-hover:w-full"></span>
            Explore Experience
            <svg className="w-4 h-4 transition-transform group-hover:translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>

        {/* Stats Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pointer-events-auto border-t border-aluminum-500/20 pt-12">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="font-mono text-xs uppercase tracking-widest text-aluminum-400 mb-2">
                {stat.label}
              </div>
              <div className="text-xl font-semibold text-aluminum-100 mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                {stat.value}
              </div>
              <div className="text-sm text-aluminum-300">
                {stat.detail}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

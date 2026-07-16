import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GlobeMap, latLongToVector3 } from './DefenseMap';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface Role {
  title: string;
  company: string;
  location: string;
  period: string;
  lat: number;
  lng: number;
  highlights: string[];
}

const ROLES: Role[] = [
  {
    title: "Technical Product Specialist",
    company: "Outdooractive",
    location: "Immenstadt, Germany",
    period: "Sep 2023 – Present",
    lat: 47.5606,
    lng: 10.2198,
    highlights: [
      "Contributed to product roadmap prioritisation across B2C and B2B.",
      "Reduced feature request support tickets by 59%."
    ]
  },
  {
    title: "Product & Programme Manager",
    company: "British Army — Combat CIS School",
    location: "Bovington, UK",
    period: "Jul 2020 – Sep 2023",
    lat: 50.6974,
    lng: -2.2343,
    highlights: [
      "Delivered end-to-end product lifecycle management for multi-org capability.",
      "Saved 960 instructor hours per year."
    ]
  },
  {
    title: "Regimental Signals Officer",
    company: "British Army — 1st Bn Duke of Lancaster's",
    location: "Chester, UK",
    period: "Jul 2018 – Jul 2020",
    lat: 53.1905,
    lng: -2.8917,
    highlights: [
      "Coordinated secure communications infrastructure across a regiment of 500+.",
      "Translated deeply technical communications planning for commanders."
    ]
  },
  {
    title: "Operations Officer / Team Leader",
    company: "British Army — 1st Bn Duke of Lancaster's",
    location: "Cyprus",
    period: "Jul 2014 – Jul 2018",
    lat: 34.6750,
    lng: 32.8460,
    highlights: [
      "Ensured the training readiness of 130 personnel for international deployments.",
      "Led a 30-person team on operational duties."
    ]
  }
];

const RADIUS = 5;

const RadarPing = ({ position }: { position: THREE.Vector3 }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + (state.clock.elapsedTime % 2) * 2;
      const opacity = Math.max(0, 1 - (state.clock.elapsedTime % 2));
      meshRef.current.scale.set(scale, scale, scale);
      (meshRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <group position={position}>
      {/* Core solid dot */}
      <mesh>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="rgb(var(--accent))" />
      </mesh>
      {/* Expanding ping */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="rgb(var(--accent))" transparent opacity={0.5} wireframe />
      </mesh>
    </group>
  );
};

// Main Scene Component
const Scene = ({ currentTarget }: { currentTarget: { lat: number, lng: number } | null }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (!groupRef.current) return;
    
    // Default Europe Framing
    let targetLat = 48.0;
    let targetLng = 5.0;

    if (currentTarget) {
      targetLat = currentTarget.lat;
      targetLng = currentTarget.lng;
    }

    // Convert target lat/lng to angles to rotate the globe
    // We want the target lat/lng to end up facing the camera (Z axis)
    const targetPhi = (targetLat) * (Math.PI / 180);
    const targetTheta = (-targetLng) * (Math.PI / 180);

    gsap.to(groupRef.current.rotation, {
      x: targetPhi,
      y: targetTheta,
      duration: 1.5,
      ease: "power2.inOut"
    });

  }, [currentTarget]);

  return (
    <group ref={groupRef}>
      <GlobeMap radius={RADIUS} />
      {/* Render pins for all roles */}
      {ROLES.map((role, i) => {
        const pos = latLongToVector3(role.lat, role.lng, RADIUS);
        // Slightly offset the ping so it sits just above the globe surface
        pos.multiplyScalar(1.02);
        return <RadarPing key={i} position={pos} />;
      })}
    </group>
  );
};

export default function DefenseStory({ badge, profileText }: { badge: string, profileText: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [accent, setAccent] = useState('0 240 255');
  const [activeLocation, setActiveLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Dynamic Spectrum
  useEffect(() => {
    const updateSpectrum = () => {
      const now = new Date();
      const hour = now.getHours() + now.getMinutes() / 60;
      let r, g, b;
      if (hour >= 6 && hour < 12) { r = 255; g = 180; b = 0; } 
      else if (hour >= 12 && hour < 18) { r = 255; g = 57; b = 20; } 
      else if (hour >= 18 && hour < 22) { r = 180; g = 0; b = 255; } 
      else { r = 0; g = 240; b = 255; }
      setAccent(`${r} ${g} ${b}`);
    };
    updateSpectrum();
    const interval = setInterval(updateSpectrum, 60000);
    return () => clearInterval(interval);
  }, []);

  // GSAP ScrollTrigger Setup
  useGSAP(() => {
    const sections = gsap.utils.toArray('.role-section') as HTMLElement[];
    
    sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        end: "bottom center",
        onEnter: () => setActiveLocation({ lat: ROLES[index].lat, lng: ROLES[index].lng }),
        onEnterBack: () => setActiveLocation({ lat: ROLES[index].lat, lng: ROLES[index].lng }),
      });
    });

    // Special trigger for the Hero (reset to Europe overview)
    ScrollTrigger.create({
      trigger: ".hero-section",
      start: "top center",
      end: "bottom center",
      onEnter: () => setActiveLocation(null),
      onEnterBack: () => setActiveLocation(null),
    });

  }, { scope: containerRef });

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-charcoal-900 text-aluminum-100"
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* Fixed 3D Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 10], fov: 40 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="white" />
          <Scene currentTarget={activeLocation} />
        </Canvas>
        
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-charcoal-900/90 pointer-events-none"></div>
      </div>

      {/* Scrollable Content Layers */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        
        {/* Intro Hero Section */}
        <section className="hero-section min-h-screen flex flex-col justify-center max-w-2xl py-24">
          <div className="mb-8 font-mono text-xs uppercase tracking-widest text-ember-400">
            {badge}
          </div>
          <h1 className="type-display text-5xl md:text-7xl font-semibold tracking-tight mb-8">
            Liam Day
          </h1>
          <p className="type-heading text-lg md:text-xl text-aluminum-300 font-light mb-12 leading-relaxed">
            {profileText}
          </p>
          <div className="animate-bounce font-mono text-xs uppercase tracking-widest text-aluminum-500 mt-12">
            ↓ Scroll to Deploy
          </div>
        </section>

        {/* Roles mapped in a column (offset to the right) */}
        <div className="pb-32 ml-auto max-w-xl">
          {ROLES.map((role, idx) => (
            <section 
              key={idx} 
              className="role-section min-h-[80vh] flex flex-col justify-center"
            >
              <div className="surface-panel p-8 md:p-10 border-l-2 border-l-ember-400/80">
                <div className="font-mono text-xs uppercase tracking-widest text-ember-400 mb-2">
                  {role.period}
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold mb-1" style={{ fontFamily: 'var(--font-sans)' }}>
                  {role.title}
                </h2>
                <h3 className="text-lg text-aluminum-300 mb-6 font-light">
                  {role.company} <span className="mx-2 text-aluminum-500">|</span> {role.location}
                </h3>
                <ul className="space-y-4 text-sm text-aluminum-300">
                  {role.highlights.map((h, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-ember-400 mt-0.5">▸</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </div>

      </div>
    </div>
  );
}

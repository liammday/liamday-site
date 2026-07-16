import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GlobeMap, latLongToVector3, greatCircleArcPoints, polylineToSegments } from './DefenseMap';
import { useTacticalAccent, accentToCss } from '../lib/useTacticalAccent';
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
    title: 'Technical Product Specialist',
    company: 'Outdooractive',
    location: 'Immenstadt, Germany',
    period: 'Sep 2023 – Present',
    lat: 47.5606,
    lng: 10.2198,
    highlights: [
      'Contributed to product roadmap prioritisation across B2C and B2B.',
      'Reduced feature request support tickets by 59%.',
    ],
  },
  {
    title: 'Product & Programme Manager',
    company: 'British Army — Combat CIS School',
    location: 'Bovington, UK',
    period: 'Jul 2020 – Sep 2023',
    lat: 50.6974,
    lng: -2.2343,
    highlights: [
      'Delivered end-to-end product lifecycle management for multi-org capability.',
      'Saved 960 instructor hours per year.',
    ],
  },
  {
    title: 'Regimental Signals Officer',
    company: "British Army — 1st Bn Duke of Lancaster's",
    location: 'Chester, UK',
    period: 'Jul 2018 – Jul 2020',
    lat: 53.1905,
    lng: -2.8917,
    highlights: [
      'Coordinated secure communications infrastructure across a regiment of 500+.',
      'Translated deeply technical communications planning for commanders.',
    ],
  },
  {
    title: 'Operations Officer / Team Leader',
    company: "British Army — 1st Bn Duke of Lancaster's",
    location: 'Cyprus',
    period: 'Jul 2014 – Jul 2018',
    lat: 34.675,
    lng: 32.846,
    highlights: [
      'Ensured the training readiness of 130 personnel for international deployments.',
      'Led a 30-person team on operational duties.',
    ],
  },
];

const RADIUS = 5;
const DEG = Math.PI / 180;

/** Default framing when no role is active: Europe overview. */
const OVERVIEW = { lat: 46, lng: 8 };

interface RadarPingProps {
  position: THREE.Vector3;
  color: string;
  active: boolean;
  dimmed: boolean;
  pulse: boolean;
}

const RadarPing = ({ position, color, active, dimmed, pulse }: RadarPingProps) => {
  const ringRef = useRef<THREE.Mesh>(null);

  // Orient the ping's plane tangent to the globe (ring normal = surface normal).
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize());
    return q;
  }, [position]);

  useFrame((state) => {
    if (!ringRef.current) return;
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    if (!pulse || !active) {
      mat.opacity = 0;
      return;
    }
    // Radar sweep: a flat ring expanding outward along the surface, fading out.
    const t = (state.clock.elapsedTime % 1.8) / 1.8;
    ringRef.current.scale.setScalar(0.5 + t * 3.5);
    mat.opacity = 0.9 * (1 - t);
  });

  return (
    <group position={position} quaternion={quaternion}>
      {/* Core dot — accent when live, recessive grey when another site is focused */}
      <mesh>
        <sphereGeometry args={[active ? 0.05 : 0.032, 16, 16]} />
        <meshBasicMaterial color={dimmed ? '#6b7078' : color} />
      </mesh>
      {/* Expanding ping ring (active site only) */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.096, 0.104, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

/** Career path — great-circle arcs joining the postings in chronological order. */
const CareerPath = ({ color }: { color: string }) => {
  const geometry = useMemo(() => {
    const positions: number[] = [];
    // ROLES is newest-first; the path travels oldest → newest.
    const chronological = [...ROLES].reverse();
    for (let i = 0; i < chronological.length - 1; i++) {
      polylineToSegments(greatCircleArcPoints(chronological[i], chronological[i + 1], RADIUS), positions);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.35} depthWrite={false} />
    </lineSegments>
  );
};

interface SceneProps {
  activeIndex: number | null;
  accentCss: string;
  reducedMotion: boolean;
}

const Scene = ({ activeIndex, accentCss, reducedMotion }: SceneProps) => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const target = activeIndex === null ? OVERVIEW : ROLES[activeIndex];

    // Rotate the globe so `target` faces the camera (+Z). With Euler order
    // XYZ the Y spin applies to the geometry first, then the X tilt:
    //   y = -(lng + 90°) brings the target meridian to the front,
    //   x = +lat tilts the target latitude up to centre frame.
    gsap.to(groupRef.current.rotation, {
      x: target.lat * DEG,
      y: -(target.lng + 90) * DEG,
      duration: reducedMotion ? 0 : 1.5,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
  }, [activeIndex, reducedMotion]);

  return (
    <group ref={groupRef}>
      <GlobeMap radius={RADIUS} />
      <CareerPath color={accentCss} />
      {ROLES.map((role, i) => {
        // Sit the ping just above the globe surface.
        const pos = latLongToVector3(role.lat, role.lng, RADIUS).multiplyScalar(1.02);
        return (
          <RadarPing
            key={i}
            position={pos}
            color={accentCss}
            active={activeIndex === i}
            // Overview: every station reads live (accent); with a role focused,
            // the rest fall back to recessive grey.
            dimmed={activeIndex !== null && activeIndex !== i}
            pulse={!reducedMotion}
          />
        );
      })}
    </group>
  );
};

export default function DefenseStory({ badge, profileText }: { badge: string; profileText: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const accent = useTacticalAccent();
  const accentCss = accentToCss(accent);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // GSAP ScrollTrigger: each role section drives the globe to its posting.
  useGSAP(
    () => {
      const sections = gsap.utils.toArray('.role-section') as HTMLElement[];

      sections.forEach((section, index) => {
        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActiveIndex(index),
          onEnterBack: () => setActiveIndex(index),
        });
      });

      // The hero resets to the Europe overview.
      ScrollTrigger.create({
        trigger: '.hero-section',
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setActiveIndex(null),
        onEnterBack: () => setActiveIndex(null),
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      data-tactical
      className="relative w-full bg-charcoal-900 text-aluminum-100"
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* Fixed 3D background */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <Canvas camera={{ position: [0, 0, 10], fov: 40 }}>
          <Scene activeIndex={activeIndex} accentCss={accentCss} reducedMotion={reducedMotion} />
        </Canvas>

        {/* Vignette: keep the globe recessive at the edges so copy stays legible */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgb(var(--charcoal-900) / 0.9) 100%)',
          }}
        ></div>
      </div>

      {/* Scrollable content layers */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        {/* Intro hero */}
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
          <div className="motion-safe:animate-bounce font-mono text-xs uppercase tracking-widest text-aluminum-400 mt-12">
            ↓ Scroll to Deploy
          </div>
        </section>

        {/* Roles in a right-offset column so the globe stays visible */}
        <div className="pb-32 ml-auto max-w-xl">
          {ROLES.map((role, idx) => (
            <section key={idx} className="role-section min-h-[80vh] flex flex-col justify-center">
              {/* rounded-none: sharp corners are the tactical-brutalism language */}
              <div className="surface-panel rounded-none p-8 md:p-10 border-l-2 border-l-ember-400/80">
                <div className="font-mono text-xs uppercase tracking-widest text-ember-400 mb-2">
                  {role.period}
                </div>
                <h2
                  className="text-2xl md:text-3xl font-semibold mb-1"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
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

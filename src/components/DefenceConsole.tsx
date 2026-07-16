import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { GlobeMap, latLongToVector3, greatCircleArcPoints, type GlobeMode } from './DefenceGlobe';
import { useTacticalAccent, accentToCss } from '../lib/useTacticalAccent';

gsap.registerPlugin(ScrollTrigger);

/* ──────────────────────────────────────────────────────────────────────────
   DefenceConsole — the /defence exploration as a full-content page.
   One dark instrument: a fixed, scroll-driven wireframe globe carries the
   narrative (hero → per-role fly-tos → dot-matrix abstraction → UK hold →
   ledger → home), annotated by a live mono coordinate readout. Design brief
   distilled from Anduril / Palantir / Helsing / Arondite / Oxford Dynamics
   research: grotesque + mono only, hairline rules, one rationed sky-tone
   accent, no HUD cosplay — every readout reports real state.
   ────────────────────────────────────────────────────────────────────────── */

export interface GeoPoint {
  lat: number;
  lng: number;
  label: string;
}

export interface ConsoleRole {
  title: string;
  company: string;
  location: string;
  period: string;
  highlights?: string[];
  geo: GeoPoint;
}

export interface ConsoleQualification {
  qualification: string;
  institution: string;
  period: string;
  geo?: GeoPoint | null;
}

export interface ConsoleCompetency {
  title: string;
  description: string;
}

export interface ConsoleStat {
  label: string;
  value: string;
  detail: string;
}

export interface ConsoleProject {
  name: string;
  slug?: string;
  summary?: string;
  platform?: string;
  technologies?: string[];
  status?: string;
}

export interface DefenceConsoleProps {
  badge: string;
  profileText: string;
  stats: ConsoleStat[];
  roles: ConsoleRole[];
  competencies: ConsoleCompetency[];
  education: ConsoleQualification[];
  certifications: ConsoleQualification[];
  projects: ConsoleProject[];
  homeGeo: GeoPoint;
  contact: { email: string; linkedin?: string; github?: string };
}

const RADIUS = 5;
const DEG = Math.PI / 180;
/** One easing curve for all UI (Anduril/Palantir convergence). */
const EASE = 'power2.out';

interface GlobeState {
  designation: string;
  geo: GeoPoint | null; // null = hold current orientation
  mode: GlobeMode;
  dim: number; // canvas wrapper opacity
  activeRole: number | null;
}

/* ── 3D scene ────────────────────────────────────────────────────────────── */

const Marker = ({
  position,
  color,
  active,
  dimmed,
  pulse,
}: {
  position: THREE.Vector3;
  color: string;
  active: boolean;
  dimmed: boolean;
  pulse: boolean;
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const clockRef = useRef(0);

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize());
    return q;
  }, [position]);

  useEffect(() => {
    if (!pulse || !active || !ringRef.current) return;
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    const state = { t: 0 };
    const tween = gsap.to(state, {
      t: 1,
      duration: 1.8,
      repeat: -1,
      ease: 'none',
      onUpdate: () => {
        if (!ringRef.current) return;
        ringRef.current.scale.setScalar(0.5 + state.t * 3.5);
        mat.opacity = 0.9 * (1 - state.t);
      },
    });
    return () => {
      tween.kill();
      mat.opacity = 0;
    };
  }, [pulse, active]);

  void clockRef;

  return (
    <group position={position} quaternion={quaternion}>
      <mesh>
        <sphereGeometry args={[active ? 0.05 : 0.032, 16, 16]} />
        <meshBasicMaterial color={dimmed ? '#5a5c66' : color} />
      </mesh>
      <mesh ref={ringRef}>
        <ringGeometry args={[0.096, 0.104, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
};

const CareerPath = ({ color, stations }: { color: string; stations: GeoPoint[] }) => {
  const points = useMemo(() => {
    const segs: [number, number, number][] = [];
    for (let i = 0; i < stations.length - 1; i++) {
      if (
        stations[i].lat === stations[i + 1].lat &&
        stations[i].lng === stations[i + 1].lng
      )
        continue; // consecutive postings at the same site draw no arc
      const arc = greatCircleArcPoints(stations[i], stations[i + 1], RADIUS);
      for (let j = 0; j < arc.length - 1; j++) {
        segs.push([arc[j].x, arc[j].y, arc[j].z], [arc[j + 1].x, arc[j + 1].y, arc[j + 1].z]);
      }
    }
    return segs;
  }, [stations]);

  if (points.length === 0) return null;
  return (
    <Line points={points} segments color={color} lineWidth={1.3} transparent opacity={0.4} depthWrite={false} />
  );
};

const Scene = ({
  state,
  accentCss,
  reducedMotion,
  offsetX,
  roles,
  homeGeo,
  onRotationUpdate,
}: {
  state: GlobeState;
  accentCss: string;
  reducedMotion: boolean;
  offsetX: number;
  roles: ConsoleRole[];
  homeGeo: GeoPoint;
  onRotationUpdate: (lat: number, lng: number) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  // Tracks the orientation we've animated to, so `geo: null` sections hold.
  const currentGeo = useRef<{ lat: number; lng: number }>({ lat: homeGeo.lat, lng: homeGeo.lng });

  useEffect(() => {
    if (!groupRef.current || !state.geo) return;
    const target = state.geo;

    // Rotate the globe so `target` faces the camera (+Z). Euler XYZ: the Y
    // spin applies to the geometry first, then the X tilt —
    //   y = -(lng + 90)° brings the target meridian to the front,
    //   x = +lat° tilts the target latitude up to centre frame.
    const from = { ...currentGeo.current };
    const anim = { t: 0 };
    gsap.to(anim, {
      t: 1,
      duration: reducedMotion ? 0 : 1.6,
      ease: 'power2.inOut',
      overwrite: 'auto',
      onUpdate: () => {
        const lat = from.lat + (target.lat - from.lat) * anim.t;
        const lng = from.lng + (target.lng - from.lng) * anim.t;
        if (groupRef.current) {
          groupRef.current.rotation.x = lat * DEG;
          groupRef.current.rotation.y = -(lng + 90) * DEG;
        }
        currentGeo.current = { lat, lng };
        onRotationUpdate(lat, lng);
      },
    });
  }, [state.geo, reducedMotion, onRotationUpdate]);

  const stations = useMemo(() => {
    // Chronological path: oldest role → newest.
    return [...roles].reverse().map((r) => r.geo);
  }, [roles]);

  // Unique marker sites (Cyprus hosts two roles — one marker).
  const sites = useMemo(() => {
    const seen = new Map<string, { geo: GeoPoint; roleIndices: number[] }>();
    roles.forEach((role, i) => {
      const key = `${role.geo.lat},${role.geo.lng}`;
      if (!seen.has(key)) seen.set(key, { geo: role.geo, roleIndices: [] });
      seen.get(key)!.roleIndices.push(i);
    });
    return [...seen.values()];
  }, [roles]);

  return (
    <group position={[offsetX, 0, 0]}>
      <group ref={groupRef}>
        <GlobeMap radius={RADIUS} mode={state.mode} />
        <CareerPath color={accentCss} stations={stations} />
        {sites.map(({ geo, roleIndices }) => {
          const pos = latLongToVector3(geo.lat, geo.lng, RADIUS).multiplyScalar(1.02);
          const isActive = state.activeRole !== null && roleIndices.includes(state.activeRole);
          return (
            <Marker
              key={geo.label}
              position={pos}
              color={accentCss}
              active={isActive}
              dimmed={state.activeRole !== null && !isActive}
              pulse={!reducedMotion}
            />
          );
        })}
        {/* Home station marker (hero/contact) */}
        <Marker
          position={latLongToVector3(homeGeo.lat, homeGeo.lng, RADIUS).multiplyScalar(1.02)}
          color={accentCss}
          active={state.activeRole === null && state.mode === 'map'}
          dimmed={state.activeRole !== null}
          pulse={!reducedMotion}
        />
      </group>
    </group>
  );
};

/* ── HUD chrome ──────────────────────────────────────────────────────────── */

function formatCoords(lat: number, lng: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${ns} / ${Math.abs(lng).toFixed(4)}° ${ew}`;
}

/** Mono kicker — the single highest-impact motif from the research. */
const Kicker = ({ num, children }: { num?: string; children: React.ReactNode }) => (
  <p className="t-kicker">
    {num && <span className="text-ember-400">/{num}</span>}
    {num && '  '}
    {children}
  </p>
);

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function DefenceConsole(props: DefenceConsoleProps) {
  const { badge, profileText, stats, roles, competencies, education, certifications, projects, homeGeo, contact } =
    props;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const accent = useTacticalAccent();
  const accentCss = accentToCss(accent);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [globeState, setGlobeState] = useState<GlobeState>({
    designation: 'SEC /01 — INDEX',
    geo: homeGeo,
    mode: 'map',
    dim: 1,
    activeRole: null,
  });

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const dk = window.matchMedia('(min-width: 768px)');
    setReducedMotion(rm.matches);
    setIsDesktop(dk.matches);
    const onRm = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    const onDk = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    rm.addEventListener('change', onRm);
    dk.addEventListener('change', onDk);
    return () => {
      rm.removeEventListener('change', onRm);
      dk.removeEventListener('change', onDk);
    };
  }, []);

  // Canvas dim per section.
  useEffect(() => {
    if (!canvasWrapRef.current) return;
    gsap.to(canvasWrapRef.current, { opacity: globeState.dim, duration: 0.6, ease: EASE });
  }, [globeState.dim]);

  // Live coordinate readout — written straight to the DOM (60fps-safe).
  const onRotationUpdate = useMemo(
    () => (lat: number, lng: number) => {
      if (coordsRef.current) coordsRef.current.textContent = formatCoords(lat, lng);
    },
    [],
  );

  // Section triggers.
  useGSAP(
    () => {
      const set = (partial: Partial<GlobeState>) =>
        setGlobeState((s) => ({ ...s, ...partial }));

      const sections: Array<{ sel: string; state: Partial<GlobeState> }> = [
        {
          sel: '[data-sec="hero"]',
          state: { designation: 'SEC /01 — INDEX', geo: homeGeo, mode: 'map', dim: 1, activeRole: null },
        },
        {
          sel: '[data-sec="capabilities"]',
          state: { designation: 'SEC /03 — CAPABILITIES', geo: null, mode: 'matrix', dim: 0.35, activeRole: null },
        },
        {
          sel: '[data-sec="education"]',
          state: {
            designation: 'SEC /04 — EDUCATION',
            geo: { lat: 51.5, lng: -1.2, label: 'UNITED KINGDOM' },
            mode: 'map',
            dim: 0.45,
            activeRole: null,
          },
        },
        {
          sel: '[data-sec="projects"]',
          state: { designation: 'SEC /05 — SHIPPED WORK', geo: null, mode: 'matrix', dim: 0.25, activeRole: null },
        },
        {
          sel: '[data-sec="contact"]',
          state: { designation: 'SEC /06 — CONTACT', geo: homeGeo, mode: 'map', dim: 1, activeRole: null },
        },
      ];

      sections.forEach(({ sel, state }) => {
        ScrollTrigger.create({
          trigger: sel,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => set(state),
          onEnterBack: () => set(state),
        });
      });

      // Per-role triggers inside experience.
      gsap.utils.toArray<HTMLElement>('[data-role-index]').forEach((el) => {
        const i = Number(el.dataset.roleIndex);
        const state: Partial<GlobeState> = {
          designation: `SEC /02 — EXPERIENCE · ${String(i + 1).padStart(2, '0')}/${String(roles.length).padStart(2, '0')}`,
          geo: roles[i].geo,
          mode: 'map',
          dim: 1,
          activeRole: i,
        };
        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => set(state),
          onEnterBack: () => set(state),
        });
      });

      // Mechanical reveals: opacity + 12px rise, one ease, 75ms sibling stagger.
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.25,
              ease: EASE,
              stagger: 0.075,
              scrollTrigger: { trigger: el, start: 'top 88%' },
            },
          );
        });
      }
    },
    { scope: containerRef, dependencies: [roles.length] },
  );

  const designationChip = (p: ConsoleProject): string => {
    if (p.platform?.toLowerCase().includes('ios') || p.platform?.toLowerCase().includes('watch')) return 'IOS';
    const tech = (p.technologies ?? []).join(' ').toLowerCase();
    if (tech.includes('mcp')) return 'MCP';
    if (tech.includes('swift')) return 'IOS';
    if (tech.includes('cli') || tech.includes('python')) return 'CLI';
    return 'WEB';
  };

  return (
    <div
      ref={containerRef}
      data-tactical
      className="relative w-full bg-charcoal-900 text-aluminum-100"
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* ── Fixed globe canvas ── */}
      <div ref={canvasWrapRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <Canvas camera={{ position: [0, 0, 10], fov: 40 }}>
          {/* Globe stays centred: at this zoom it fills the frame, so the
              content column reads against its western hemisphere — offsetting
              the sphere right just points the camera at empty Atlantic. */}
          <Scene
            state={globeState}
            accentCss={accentCss}
            reducedMotion={reducedMotion}
            offsetX={0}
            roles={roles}
            homeGeo={homeGeo}
            onRotationUpdate={onRotationUpdate}
          />
        </Canvas>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 45%, rgb(var(--charcoal-900) / 0.85) 100%)',
          }}
        ></div>
      </div>

      {/* ── Live readout: real coordinates, real section state ── */}
      <div
        className="fixed bottom-6 left-6 z-20 hidden md:block t-readout select-none"
        aria-hidden="true"
      >
        <p className="text-aluminum-400">{globeState.designation}</p>
        <p className="text-aluminum-300">
          <span ref={coordsRef}>{formatCoords(homeGeo.lat, homeGeo.lng)}</span>
        </p>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
        {/* /01 — HERO */}
        <section data-sec="hero" className="flex min-h-screen flex-col justify-center py-24">
          <div className="max-w-2xl">
            <Kicker num="01">INDEX</Kicker>
            <h1 className="t-display mt-6 text-5xl md:text-7xl">Liam Day</h1>
            <p className="t-readout mt-4 text-aluminum-300">[ {badge.toUpperCase()} — {homeGeo.label} ]</p>
            <p className="mt-10 max-w-[48ch] text-lg leading-relaxed text-aluminum-200">{profileText}</p>
          </div>

          {/* Spec row — hero stats as a ruled datasheet */}
          <div className="mt-16 grid max-w-4xl grid-cols-2 gap-px border-t border-aluminum-500 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="pt-4 pr-6">
                <p className="t-kicker">{s.label}</p>
                <p className="mt-2 text-lg font-medium text-aluminum-100">{s.value}</p>
                <p className="mt-1 text-sm text-aluminum-300">{s.detail}</p>
              </div>
            ))}
          </div>

          {/* Provenance stamp — every line true */}
          <div className="mt-16 t-readout text-aluminum-400">
            <p>DESIGNED + BUILT BY LIAM DAY</p>
            <p>EST. 2013 → PRESENT</p>
          </div>

          <p className="t-kicker mt-12 motion-safe:animate-pulse">↓ SCROLL</p>
        </section>

        {/* /02 — EXPERIENCE: the scroll-scrubbed set piece */}
        <section data-sec="experience" className="border-t border-aluminum-500 py-24">
          <Kicker num="02">EXPERIENCE</Kicker>
          <div className="mt-12 max-w-xl space-y-0">
            {roles.map((role, i) => (
              <article
                key={`${role.company}-${role.period}`}
                data-role-index={i}
                className="flex min-h-[70vh] flex-col justify-center border-t border-aluminum-500 py-12 first:border-t-0"
              >
                <div data-reveal>
                  <p className="t-readout text-ember-400">
                    ROLE {String(i + 1).padStart(2, '0')} | {role.period.toUpperCase()}
                  </p>
                  <h3 className="t-heading mt-4 text-2xl md:text-3xl">{role.title}</h3>
                  <p className="mt-2 text-aluminum-300">
                    {role.company}
                    <span className="mx-2 text-aluminum-400">·</span>
                    {role.location}
                  </p>
                  <p className="t-readout mt-3 text-aluminum-400">{role.geo.label}</p>
                  <ul className="mt-6 space-y-3 text-sm leading-relaxed text-aluminum-200">
                    {(role.highlights ?? []).map((h) => (
                      <li key={h.slice(0, 32)} className="flex gap-3">
                        <span className="mt-0.5 shrink-0 text-ember-400">—</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* /03 — CAPABILITIES: the datasheet */}
        <section data-sec="capabilities" className="border-t border-aluminum-500 py-24">
          <Kicker num="03">CAPABILITIES</Kicker>
          <div className="mt-12">
            {competencies.map((c, i) => (
              <div
                key={c.title}
                data-reveal
                className="group grid grid-cols-1 gap-2 border-t border-aluminum-500 py-5 md:grid-cols-[6rem_1fr_1.4fr] md:gap-8"
              >
                <p className="t-readout text-aluminum-400 transition-colors duration-150 group-hover:text-ember-400">
                  /{String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="text-lg font-medium leading-snug text-aluminum-100">{c.title}</h3>
                <p className="text-sm leading-relaxed text-aluminum-300">{c.description}</p>
              </div>
            ))}
            <div className="border-t border-aluminum-500"></div>
          </div>
        </section>

        {/* /04 — EDUCATION + CERTIFICATIONS */}
        <section data-sec="education" className="border-t border-aluminum-500 py-24">
          <Kicker num="04">EDUCATION + CERTIFICATIONS</Kicker>
          <div className="mt-12 grid gap-16 md:grid-cols-2">
            <div>
              {education.map((q) => (
                <div key={q.qualification} data-reveal className="border-t border-aluminum-500 py-5">
                  <p className="t-readout text-aluminum-400">{String(q.period).toUpperCase()}</p>
                  <h3 className="mt-2 text-lg font-medium text-aluminum-100">{q.qualification}</h3>
                  <p className="mt-1 text-sm text-aluminum-300">{q.institution}</p>
                  {q.geo && <p className="t-readout mt-2 text-aluminum-400">{q.geo.label}</p>}
                </div>
              ))}
              <div className="border-t border-aluminum-500"></div>
            </div>
            <div>
              {certifications.map((q) => (
                <div key={q.qualification} data-reveal className="border-t border-aluminum-500 py-5">
                  <p className="t-readout text-aluminum-400">{String(q.period).toUpperCase()}</p>
                  <h3 className="mt-2 text-lg font-medium text-aluminum-100">{q.qualification}</h3>
                  <p className="mt-1 text-sm text-aluminum-300">{q.institution}</p>
                </div>
              ))}
              <div className="border-t border-aluminum-500"></div>
            </div>
          </div>
        </section>

        {/* /05 — PROJECTS: the ops log */}
        <section data-sec="projects" className="border-t border-aluminum-500 py-24">
          <Kicker num="05">SHIPPED WORK</Kicker>
          <div className="mt-12">
            {projects.map((p, i) => {
              const href = p.slug ? `/projects/${p.slug}/` : undefined;
              const inner = (
                <div className="grid grid-cols-1 gap-2 py-5 md:grid-cols-[7rem_5rem_1fr_1.6fr] md:items-baseline md:gap-6">
                  <p className="t-readout text-aluminum-400">
                    /{String(i + 1).padStart(2, '0')} — {String(projects.length).padStart(2, '0')}
                  </p>
                  <p className="t-readout text-ember-400">[{designationChip(p)}]</p>
                  <h3 className="text-lg font-medium text-aluminum-100 transition-colors duration-150 group-hover:text-ember-300">
                    {p.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-aluminum-300">
                    {(p.summary ?? '').split('. ')[0].replace(/\.$/, '')}.
                  </p>
                </div>
              );
              return href ? (
                <a
                  key={p.name}
                  href={href}
                  data-reveal
                  className="group block border-t border-aluminum-500 no-underline hover:border-ember-400/60"
                >
                  {inner}
                </a>
              ) : (
                <div key={p.name} data-reveal className="group border-t border-aluminum-500">
                  {inner}
                </div>
              );
            })}
            <div className="border-t border-aluminum-500"></div>
          </div>
        </section>

        {/* /06 — CONTACT */}
        <section data-sec="contact" className="flex min-h-[80vh] flex-col justify-center border-t border-aluminum-500 py-24">
          <Kicker num="06">CONTACT</Kicker>
          <h2 className="t-display mt-8 max-w-3xl text-4xl md:text-6xl">Available for the hard problems.</h2>
          <div className="mt-12 flex flex-wrap items-center gap-6">
            <a
              href={`mailto:${contact.email}`}
              className="t-readout inline-block border border-aluminum-100 px-8 py-4 text-aluminum-100 no-underline transition-colors duration-150 hover:border-ember-400 hover:text-ember-300"
            >
              GET IN TOUCH »
            </a>
            {contact.linkedin && (
              <a href={contact.linkedin} className="t-readout text-aluminum-300 no-underline hover:text-ember-300">
                LINKEDIN ↗
              </a>
            )}
            {contact.github && (
              <a href={contact.github} className="t-readout text-aluminum-300 no-underline hover:text-ember-300">
                GITHUB ↗
              </a>
            )}
          </div>
          <div className="mt-24 t-readout text-aluminum-400">
            <p>DESIGNED + BUILT BY LIAM DAY — {homeGeo.label}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

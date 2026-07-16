import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import type { Line2 } from 'three-stdlib';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  GlobeMap,
  latLongToVector3,
  greatCircleArcPoints,
  getGlobeGeometry,
  type GlobeMode,
} from './DefenceGlobe';
import { DefenceLedger, slugFromLink, designationChip, type LedgerProject } from './DefenceLedger';
import { useTacticalAccent, accentToCss } from '../lib/useTacticalAccent';

gsap.registerPlugin(ScrollTrigger);

/* ──────────────────────────────────────────────────────────────────────────
   DefenceConsole — the /defence exploration as a full-content page.
   One dark instrument: a fixed, scroll-driven wireframe globe carries the
   narrative (hero → per-role fly-tos at per-role zoom → constellation-lit
   dot matrix → UK hold → graticule + orbital satellites → home), annotated
   by a live mono coordinate readout. Desktop split: content owns the left
   half (column riding the centre line), the focused pin is centred in the
   right half. Design brief distilled from Anduril / Palantir / Helsing /
   Arondite / Oxford Dynamics research — no HUD cosplay; every readout true.
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

export interface DefenceConsoleProps {
  badge: string;
  profileText: string;
  stats: ConsoleStat[];
  roles: ConsoleRole[];
  competencies: ConsoleCompetency[];
  education: ConsoleQualification[];
  certifications: ConsoleQualification[];
  projects: LedgerProject[];
  homeGeo: GeoPoint;
  contact: { email: string; linkedin?: string; github?: string };
}

const RADIUS = 5;
const DEG = Math.PI / 180;
const FOV = 40;
/** One easing curve for all UI (Anduril/Palantir convergence). */
const EASE = 'power2.out';

/** What the instrument is highlighting: the home station, one role (by
    index), the education institutions, or nothing (abstract modes). */
type Focus = 'home' | 'edu' | 'none' | number;

interface GlobeState {
  designation: string;
  geo: { lat: number; lng: number } | null; // null = hold current orientation
  camZ: number; // camera distance = zoom level
  mode: GlobeMode;
  dim: number; // canvas wrapper opacity
  split: boolean; // true = pin centred in the right half (desktop)
  /** Vertical frame offset (world units) — the dossier view drops the globe
      so the ring's near point rides centre-height instead of the top edge. */
  gy?: number;
  /** Mirror the split: centre the focus in the LEFT half (dossier view,
      where the reading panel owns the right half). */
  splitLeft?: boolean;
  focus: Focus;
}

/** Per-role framing: role 0 frames home↔posting together (both in view);
    Mediterranean postings sit wider; UK postings tighter. */
function roleFraming(role: ConsoleRole, index: number, home: GeoPoint) {
  if (index === 0) {
    return {
      lat: (role.geo.lat + home.lat) / 2,
      lng: (role.geo.lng + home.lng) / 2,
      camZ: 7.6,
    };
  }
  return { lat: role.geo.lat, lng: role.geo.lng, camZ: role.geo.lat < 40 ? 8.8 : 7.0 };
}

/* ── 3D scene ────────────────────────────────────────────────────────────── */

const Marker = ({
  position,
  color,
  active,
  dimmed,
  pulse,
  sizeScale,
  muted,
}: {
  position: THREE.Vector3;
  color: string;
  active: boolean;
  dimmed: boolean;
  pulse: boolean;
  sizeScale: number;
  /** Mobile: the globe sits behind full-width text, so accent pins soften
      and pulses stop — the map must read as backdrop, never foreground. */
  muted: boolean;
}) => {
  const contentRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize());
    return q;
  }, [position]);

  // Counter-scale against zoom so markers hold visual size at close range.
  useEffect(() => {
    if (!contentRef.current) return;
    gsap.to(contentRef.current.scale, {
      x: sizeScale,
      y: sizeScale,
      z: sizeScale,
      duration: 1.6,
      ease: 'power2.inOut',
    });
  }, [sizeScale]);

  useEffect(() => {
    if (!pulse || !active || muted || !ringRef.current) return;
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
  }, [pulse, active, muted]);

  return (
    <group position={position} quaternion={quaternion}>
      <group ref={contentRef}>
        <mesh>
          <sphereGeometry args={[active ? 0.05 : 0.032, 16, 16]} />
          <meshBasicMaterial color={dimmed ? '#5a5c66' : color} transparent opacity={muted ? 0.45 : 1} />
        </mesh>
        <mesh ref={ringRef}>
          <ringGeometry args={[0.096, 0.104, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
};

/** Markers sit JUST above the surface (arcs launch from the same altitude so
    their ends meet the marker cores). Kept minimal deliberately: any real
    altitude gives perspective parallax — a raised point projects displaced
    from its ground position by an amount that changes with camera distance
    and frame offset, which read as pins sliding across the map between
    scroll positions. 1.004R clears the outlines (1.0R) and the occluder
    sphere (0.99R) without visible parallax. */
const MARKER_ALTITUDE = 1.004;

const CareerPath = ({
  color,
  stations,
  emphasised,
  muted,
}: {
  color: string;
  stations: GeoPoint[];
  /** Full accent during the experience sequence; recessive grey elsewhere. */
  emphasised: boolean;
  muted: boolean;
}) => {
  const lineRef = useRef<{ material: { opacity: number } }>(null);

  const points = useMemo(() => {
    const segs: [number, number, number][] = [];
    for (let i = 0; i < stations.length - 1; i++) {
      if (stations[i].lat === stations[i + 1].lat && stations[i].lng === stations[i + 1].lng) continue;
      const arc = greatCircleArcPoints(stations[i], stations[i + 1], RADIUS * MARKER_ALTITUDE);
      for (let j = 0; j < arc.length - 1; j++) {
        segs.push([arc[j].x, arc[j].y, arc[j].z], [arc[j + 1].x, arc[j + 1].y, arc[j + 1].z]);
      }
    }
    return segs;
  }, [stations]);

  useEffect(() => {
    const mat = lineRef.current?.material;
    if (mat)
      gsap.to(mat, {
        opacity: emphasised ? (muted ? 0.2 : 0.45) : 0.1,
        duration: 0.6,
        ease: 'power2.inOut',
      });
  }, [emphasised, muted]);

  if (points.length === 0) return null;
  return (
    <Line
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={lineRef as any}
      points={points}
      segments
      color={color}
      lineWidth={1.3}
      transparent
      opacity={0.1}
      depthWrite={false}
    />
  );
};

/** Role-01 remote-work link: an animated dashed arc between the posting and
    home — marching dashes illustrate the recurring movement between the two. */
const RemoteLink = ({
  from,
  to,
  color,
  active,
  reducedMotion,
  muted,
}: {
  from: GeoPoint;
  to: GeoPoint;
  color: string;
  active: boolean;
  reducedMotion: boolean;
  muted: boolean;
}) => {
  const lineRef = useRef<Line2>(null);

  const points = useMemo(
    () =>
      greatCircleArcPoints(from, to, RADIUS * MARKER_ALTITUDE, 0.1).map(
        (p) => [p.x, p.y, p.z] as [number, number, number],
      ),
    [from, to],
  );

  useFrame((_, delta) => {
    const mat = lineRef.current?.material as { dashOffset?: number } | undefined;
    if (active && !reducedMotion && !muted && mat && typeof mat.dashOffset === 'number') {
      mat.dashOffset -= delta * 0.4; // dashes flow from home toward the posting
    }
  });

  useEffect(() => {
    const mat = lineRef.current?.material as { opacity: number } | undefined;
    if (mat)
      gsap.to(mat, { opacity: active ? (muted ? 0.3 : 0.9) : 0, duration: 0.5, ease: 'power2.inOut' });
  }, [active, muted]);

  return (
    <Line
      ref={lineRef}
      points={points}
      color={color}
      lineWidth={1.6}
      dashed
      dashSize={0.12}
      gapSize={0.08}
      transparent
      opacity={0}
      depthWrite={false}
    />
  );
};

/** One capability's constellation: ~6 dot-matrix vertices, index-seeded
    (deterministic — no fake randomness), joined by hairline edges. */
const Constellation = ({
  index,
  active,
  color,
  muted,
}: {
  index: number;
  active: boolean;
  color: string;
  muted: boolean;
}) => {
  const lineRef = useRef<{ material: { opacity: number } }>(null);
  const nodeMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }),
    [color],
  );

  const nodes = useMemo(() => {
    const { dots } = getGlobeGeometry(RADIUS);
    const count = dots.length / 3;
    const picks: THREE.Vector3[] = [];
    for (let k = 0; k < 6; k++) {
      const idx = (index * 937 + k * 4231 + 173) % count;
      picks.push(new THREE.Vector3(dots[idx * 3], dots[idx * 3 + 1], dots[idx * 3 + 2]).multiplyScalar(1.005));
    }
    return picks;
  }, [index]);

  const linePoints = useMemo(() => nodes.map((n) => [n.x, n.y, n.z] as [number, number, number]), [nodes]);

  useEffect(() => {
    const lineMat = lineRef.current?.material;
    if (lineMat) gsap.to(lineMat, { opacity: active ? (muted ? 0.3 : 0.7) : 0, duration: 0.4, ease: EASE });
    gsap.to(nodeMat, { opacity: active ? (muted ? 0.4 : 0.95) : 0, duration: 0.4, ease: EASE });
  }, [active, muted, nodeMat]);

  useEffect(() => () => nodeMat.dispose(), [nodeMat]);

  return (
    <group>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Line ref={lineRef as any} points={linePoints} color={color} lineWidth={1} transparent opacity={0} depthWrite={false} />
      {nodes.map((n, i) => (
        <mesh key={i} position={n} material={nodeMat}>
          <sphereGeometry args={[0.045, 12, 12]} />
        </mesh>
      ))}
    </group>
  );
};

/** Projects mode: tilted dashed orbital ring with one satellite per project.
    Every satellite carries its identity clause (05.n — matching its ledger
    row under any sort/filter); the focused row's satellite lights + names.
    Opening a dossier pauses the idle spin and swings that satellite to the
    ring's near point. */
const OrbitalRing = ({
  visible,
  activeIndex,
  openIndex,
  names,
  color,
  reducedMotion,
  muted,
}: {
  visible: boolean;
  activeIndex: number | null;
  openIndex: number | null;
  names: string[];
  color: string;
  reducedMotion: boolean;
  muted: boolean;
}) => {
  const spinRef = useRef<THREE.Group>(null);
  const ringRef = useRef<{ material: { opacity: number } }>(null);
  const satMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#c8c9d2', transparent: true, opacity: 0, depthWrite: false }),
    [],
  );
  const activeMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }),
    [color],
  );

  const R_ORBIT = 7.3;
  const ringPoints = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push([Math.cos(a) * R_ORBIT, Math.sin(a) * R_ORBIT, 0]);
    }
    return pts;
  }, []);

  const satPositions = useMemo(
    () =>
      names.map((_, i) => {
        const a = (i / names.length) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(a) * R_ORBIT, Math.sin(a) * R_ORBIT, 0);
      }),
    [names],
  );

  // Idle spin — held while a dossier is open so the subject stays on station.
  useFrame((_, delta) => {
    if (!reducedMotion && visible && openIndex === null && spinRef.current) {
      spinRef.current.rotation.z += delta * 0.04;
    }
  });

  // Dossier open: swing the subject satellite to the ring's near point
  // (local +Y after the X-tilt), shortest way round.
  useEffect(() => {
    if (openIndex === null || !spinRef.current) return;
    const theta = (openIndex / names.length) * Math.PI * 2;
    const target = Math.PI / 2 - theta;
    const current = spinRef.current.rotation.z;
    const delta = ((((target - current) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    gsap.to(spinRef.current.rotation, {
      z: current + delta,
      duration: reducedMotion ? 0 : 1.2,
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
  }, [openIndex, names.length, reducedMotion]);

  useEffect(() => {
    const ringMat = ringRef.current?.material;
    if (ringMat)
      gsap.to(ringMat, { opacity: visible ? (muted ? 0.4 : 0.65) : 0, duration: 0.6, ease: 'power2.inOut' });
    gsap.to(satMat, { opacity: visible ? (muted ? 0.5 : 0.95) : 0, duration: 0.6, ease: 'power2.inOut' });
    gsap.to(activeMat, { opacity: visible ? (muted ? 0.55 : 1) : 0, duration: 0.6, ease: 'power2.inOut' });
  }, [visible, muted, satMat, activeMat]);

  useEffect(
    () => () => {
      satMat.dispose();
      activeMat.dispose();
    },
    [satMat, activeMat],
  );

  return (
    <group rotation={[1.15, 0, 0]}>
      <group ref={spinRef}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <Line
          ref={ringRef as any}
          points={ringPoints}
          color="#8b8f9c"
          lineWidth={1.4}
          dashed
          dashSize={0.18}
          gapSize={0.12}
          transparent
          opacity={0}
          depthWrite={false}
        />
        {satPositions.map((pos, i) => {
          const isActive = visible && (activeIndex === i || openIndex === i);
          return (
            <group key={names[i]} position={pos}>
              <mesh material={isActive ? activeMat : satMat} scale={isActive ? 1.9 : 1}>
                <sphereGeometry args={[0.085, 12, 12]} />
              </mesh>
              {/* Clause labels only while the ring is the SECTION's co-star;
                  with a dossier open the ledger sits over the instrument, and
                  labels behind text read as clutter (the panel header and the
                  accent row already name the subject). */}
              {visible && openIndex === null && !muted && (
                <Html center distanceFactor={12} style={{ pointerEvents: 'none' }} zIndexRange={[5, 0]}>
                  <div className="t-readout whitespace-nowrap text-center" style={{ transform: 'translateY(-1.5rem)' }}>
                    <p className={isActive ? 'text-ember-300' : 'text-aluminum-400'}>05.{i + 1}</p>
                    {isActive && <p className="text-aluminum-100">{names[i].toUpperCase()}</p>}
                  </div>
                </Html>
              )}
            </group>
          );
        })}
      </group>
    </group>
  );
};

interface SceneProps {
  state: GlobeState;
  accentCss: string;
  reducedMotion: boolean;
  isDesktop: boolean;
  roles: ConsoleRole[];
  homeGeo: GeoPoint;
  educationSites: GeoPoint[];
  activeCapability: number;
  activeProject: number | null;
  openProject: number | null;
  projectNames: string[];
  onRotationUpdate: (lat: number, lng: number) => void;
}

const Scene = ({
  state,
  accentCss,
  reducedMotion,
  isDesktop,
  roles,
  homeGeo,
  educationSites,
  activeCapability,
  activeProject,
  openProject,
  projectNames,
  onRotationUpdate,
}: SceneProps) => {
  const offsetRef = useRef<THREE.Group>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera, size } = useThree();
  // The orientation/zoom we've animated to, so `geo: null` sections hold.
  const current = useRef({ lat: homeGeo.lat, lng: homeGeo.lng, camZ: 10, gx: 0, gy: 0 });

  useEffect(() => {
    if (!groupRef.current) return;
    const from = { ...current.current };
    const target = {
      lat: state.geo?.lat ?? from.lat,
      lng: state.geo?.lng ?? from.lng,
      camZ: state.camZ,
      // Split sections centre the pin in the right half: the facing point
      // (world x = gx, depth camZ − R from camera) must project to 75% of
      // viewport width → gx = 0.5 · tan(fov/2) · (camZ − R) · aspect.
      gx:
        state.split && isDesktop
          ? (state.splitLeft ? -0.5 : 0.5) *
            Math.tan((FOV / 2) * DEG) *
            (state.camZ - RADIUS) *
            (size.width / size.height)
          : 0,
      gy: state.gy ?? 0,
    };

    const anim = { t: 0 };
    gsap.to(anim, {
      t: 1,
      duration: reducedMotion ? 0 : 1.6,
      ease: 'power2.inOut',
      overwrite: 'auto',
      onUpdate: () => {
        const lerp = (a: number, b: number) => a + (b - a) * anim.t;
        const lat = lerp(from.lat, target.lat);
        const lng = lerp(from.lng, target.lng);
        const camZ = lerp(from.camZ, target.camZ);
        const gx = lerp(from.gx, target.gx);
        const gy = lerp(from.gy, target.gy);
        if (groupRef.current) {
          // Euler XYZ: Y spin first (meridian to front), then X tilt (latitude up).
          groupRef.current.rotation.x = lat * DEG;
          groupRef.current.rotation.y = -(lng + 90) * DEG;
        }
        if (offsetRef.current) {
          offsetRef.current.position.x = gx;
          offsetRef.current.position.y = gy;
        }
        camera.position.z = camZ;
        current.current = { lat, lng, camZ, gx, gy };
        onRotationUpdate(lat, lng);
      },
    });
  }, [state.geo, state.camZ, state.split, state.splitLeft, state.gy, isDesktop, reducedMotion, camera, size.width, size.height, onRotationUpdate]);

  const stations = useMemo(() => [...roles].reverse().map((r) => r.geo), [roles]);

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

  const markerScale = Math.min(1, Math.max(0.3, (state.camZ - RADIUS) / 5));
  const { focus } = state;
  const activeRole = typeof focus === 'number' ? focus : null;
  // Role 0 is the remote posting: its focus lights BOTH ends of the link.
  const homeActive = focus === 'home' || focus === 0;
  // Mobile: content sits over the globe everywhere, so accent elements
  // soften and pulses/labels stop — backdrop, never foreground.
  const muted = !isDesktop;

  return (
    <group ref={offsetRef}>
      <group ref={groupRef}>
        <GlobeMap radius={RADIUS} mode={state.mode} />
        {Array.from({ length: 8 }, (_, i) => (
          <Constellation
            key={i}
            index={i}
            active={state.mode === 'matrix' && activeCapability === i}
            color={accentCss}
            muted={muted}
          />
        ))}
        {/* Geography layer — markers and arcs exist only in map mode */}
        <group visible={state.mode === 'map'}>
          <CareerPath color={accentCss} stations={stations} emphasised={activeRole !== null} muted={muted} />
          <RemoteLink
            from={homeGeo}
            to={roles[0].geo}
            color={accentCss}
            active={focus === 0}
            reducedMotion={reducedMotion}
            muted={muted}
          />
          {sites.map(({ geo, roleIndices }) => {
            const pos = latLongToVector3(geo.lat, geo.lng, RADIUS).multiplyScalar(MARKER_ALTITUDE);
            const isActive = activeRole !== null && roleIndices.includes(activeRole);
            return (
              <Marker
                key={geo.label}
                position={pos}
                color={accentCss}
                active={isActive}
                dimmed={!isActive}
                pulse={!reducedMotion}
                sizeScale={markerScale}
                muted={muted}
              />
            );
          })}
          <Marker
            position={latLongToVector3(homeGeo.lat, homeGeo.lng, RADIUS).multiplyScalar(MARKER_ALTITUDE)}
            color={accentCss}
            active={homeActive}
            dimmed={!homeActive}
            pulse={!reducedMotion}
            sizeScale={markerScale}
            muted={muted}
          />
          {/* Education institutions — lit only during /04 */}
          <group visible={focus === 'edu'}>
            {educationSites.map((geo) => (
              <Marker
                key={geo.label}
                position={latLongToVector3(geo.lat, geo.lng, RADIUS).multiplyScalar(MARKER_ALTITUDE)}
                color={accentCss}
                active={focus === 'edu'}
                dimmed={focus !== 'edu'}
                pulse={false}
                sizeScale={markerScale}
                muted={muted}
              />
            ))}
          </group>
        </group>
      </group>
      <OrbitalRing
        visible={state.mode === 'orbital'}
        activeIndex={openProject ?? activeProject}
        openIndex={openProject}
        names={projectNames}
        color={accentCss}
        reducedMotion={reducedMotion}
        muted={muted}
      />
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

/** Desktop split: content owns the left half as a column riding the centre
    line; the right half belongs to the globe. Mobile: normal full width. */
const Half = ({ children }: { children: React.ReactNode }) => (
  <div className="md:grid md:grid-cols-2">
    <div className="md:flex md:justify-end">
      <div className="w-full px-6 md:max-w-xl md:pr-14">{children}</div>
    </div>
  </div>
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
  const [activeCapability, setActiveCapability] = useState(-1);
  const [activeProject, setActiveProject] = useState<number | null>(null);
  const [openProject, setOpenProject] = useState<number | null>(null);
  // The panel renders from displayProject, which lags openProject just long
  // enough to play the exit slide before unmounting.
  const [displayProject, setDisplayProject] = useState<number | null>(null);
  const [dossiers, setDossiers] = useState<Record<string, string>>({});
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const panelWrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openProject !== null) setDisplayProject(openProject);
  }, [openProject]);

  // Entrance + switch choreography (exit lives in its own effect below).
  const prevDisplayRef = useRef<number | null>(null);
  useEffect(() => {
    const prev = prevDisplayRef.current;
    prevDisplayRef.current = displayProject;
    if (displayProject === null) return;
    panelRef.current?.scrollTo({ top: 0 }); // fresh document, fresh scroll
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (prev === null && panelWrapRef.current) {
      // OPEN: the sheet slides in from the right; the header blocks rise in
      // behind it (the brief's mechanical reveal — 12px, one ease, 75ms steps).
      gsap.fromTo(
        panelWrapRef.current,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.35, ease: EASE, overwrite: 'auto' },
      );
      gsap.fromTo(
        panelWrapRef.current.querySelectorAll('[data-dossier-reveal]'),
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.25, ease: EASE, stagger: 0.075, delay: 0.18, overwrite: 'auto' },
      );
    } else if (prev !== null && prev !== displayProject && panelContentRef.current) {
      // SWITCH: the sheet holds station; the document snaps over (the
      // satellite swing carries the cinematic part of the transition).
      gsap.fromTo(
        panelContentRef.current,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.25, ease: EASE, overwrite: 'auto' },
      );
    }
  }, [displayProject]);

  // CLOSE: slide the sheet out, then unmount it.
  useEffect(() => {
    if (openProject !== null || displayProject === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !panelWrapRef.current) {
      setDisplayProject(null);
      return;
    }
    gsap.to(panelWrapRef.current, {
      xPercent: 100,
      duration: 0.28,
      ease: 'power2.in',
      overwrite: 'auto',
      onComplete: () => setDisplayProject(null),
    });
  }, [openProject, displayProject]);
  const [globeState, setGlobeState] = useState<GlobeState>({
    designation: 'SEC /01 — INDEX',
    geo: homeGeo,
    camZ: 10,
    mode: 'map',
    dim: 1,
    split: true,
    focus: 'home',
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

  // Canvas dim per section (dossier override wins while open).
  const effectiveDim = openProject !== null ? 0.65 : globeState.dim;
  useEffect(() => {
    if (!canvasWrapRef.current) return;
    gsap.to(canvasWrapRef.current, { opacity: effectiveDim, duration: 0.6, ease: EASE });
  }, [effectiveDim]);

  // Content scrim rides the split state: shield the left reading column on
  // map-costar sections; lift entirely for the full-width abstract sections
  // and for dossier mode (instrument owns the left half there).
  const scrimOn = openProject === null && globeState.split;
  useEffect(() => {
    if (!scrimRef.current) return;
    gsap.to(scrimRef.current, { opacity: scrimOn ? 1 : 0, duration: 0.6, ease: EASE });
  }, [scrimOn]);

  // Live coordinate readout — written straight to the DOM (60fps-safe).
  const onRotationUpdate = useMemo(
    () => (lat: number, lng: number) => {
      if (coordsRef.current) coordsRef.current.textContent = formatCoords(lat, lng);
    },
    [],
  );

  const projectNames = useMemo(() => projects.map((p) => p.name), [projects]);
  const educationSites = useMemo(
    () => education.map((q) => q.geo).filter((g): g is GeoPoint => Boolean(g)),
    [education],
  );

  /* ── Dossier viewer (briefing takeover) ──────────────────────────────────
     The location hash is the source of truth: /defence/#peaking opens the
     Peaking dossier, back/forward and shared links all work. Rows set the
     hash; the hashchange listener drives state. */

  const openBySlug = useMemo(
    () => (slug: string) => projects.findIndex((p) => slugFromLink(p.link) === slug),
    [projects],
  );

  useEffect(() => {
    const sync = () => {
      const slug = window.location.hash.replace(/^#/, '');
      if (slug) {
        const idx = openBySlug(slug);
        // A hash that isn't a project slug (e.g. an in-content anchor inside
        // an open dossier) is not a command — leave the viewer state alone.
        if (idx >= 0) setOpenProject(idx);
      } else {
        setOpenProject(null);
      }
    };
    sync(); // deep link on load
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [openBySlug]);

  const openDossier = (index: number) => {
    const slug = slugFromLink(projects[index].link);
    if (slug) window.location.hash = slug; // hashchange drives the state
  };

  const closeDossier = () => {
    // Clear the hash without adding a history entry mid-session; back
    // returns to the dossier (hashchange reopens it).
    history.pushState(null, '', window.location.pathname + window.location.search);
    setOpenProject(null);
  };

  const openSlug = openProject !== null ? slugFromLink(projects[openProject].link) : null;
  const displaySlug = displayProject !== null ? slugFromLink(projects[displayProject].link) : null;

  // Fetch the build-time partial on first open; cache thereafter.
  useEffect(() => {
    if (!openSlug || dossiers[openSlug]) return;
    let cancelled = false;
    fetch(`/defence/dossier/${openSlug}/`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then((html) => {
        if (!cancelled) setDossiers((d) => ({ ...d, [openSlug]: html }));
      })
      .catch(() => {
        // Partial unavailable — fall back to the standalone page.
        if (!cancelled && openProject !== null && projects[openProject].link) {
          window.location.href = projects[openProject].link!;
        }
      });
    return () => {
      cancelled = true;
    };
  }, [openSlug, dossiers, openProject, projects]);

  // While the dossier is open: snap the ledger into view, then keep page
  // scroll LIVE but confined to the projects section — the list scrolls,
  // the rest of the console stays out of reach. Plus ESC + focus.
  useEffect(() => {
    if (openProject === null) return;
    document.querySelector('[data-ledger]')?.scrollIntoView({ block: 'start' });
    closeBtnRef.current?.focus();

    const section = document.querySelector<HTMLElement>('[data-sec="projects"]');
    const clamp = () => {
      if (!section) return;
      const min = section.getBoundingClientRect().top + window.scrollY;
      const max = Math.max(min, min + section.offsetHeight - window.innerHeight);
      const y = window.scrollY;
      if (y < min) window.scrollTo(0, min);
      else if (y > max) window.scrollTo(0, max);
    };
    window.addEventListener('scroll', clamp, { passive: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDossier();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', clamp);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openProject]);

  // While a dossier is open the instrument overrides the scroll-driven state:
  // full strength, pulled back far enough to hold the whole ring, subject
  // satellite on station in the right half.
  const effectiveGlobeState: GlobeState =
    openProject !== null
      ? {
          ...globeState,
          geo: null,
          camZ: 16,
          mode: 'orbital',
          // Recessive while open: the ledger sits over the instrument in the
          // left half, so the ring must read as background, not foreground.
          dim: 0.65,
          split: true,
          splitLeft: true, // reading panel owns the right half — ring rides left
          gy: -2.5,
          focus: 'none',
        }
      : globeState;

  // Section triggers.
  useGSAP(
    () => {
      const set = (partial: Partial<GlobeState>) => setGlobeState((s) => ({ ...s, ...partial }));

      const sections: Array<{ sel: string; state: Partial<GlobeState> }> = [
        {
          sel: '[data-sec="hero"]',
          state: {
            designation: 'SEC /01 — INDEX',
            geo: homeGeo,
            camZ: 10,
            mode: 'map',
            dim: 1,
            split: true,
            focus: 'home',
          },
        },
        {
          sel: '[data-sec="capabilities"]',
          state: {
            designation: 'SEC /03 — CAPABILITIES',
            geo: null,
            camZ: 10,
            mode: 'matrix',
            dim: 0.4,
            split: false,
            focus: 'none',
          },
        },
        {
          sel: '[data-sec="education"]',
          state: {
            designation: 'SEC /04 — EDUCATION',
            geo: { lat: 51.4, lng: -0.9 },
            camZ: 6.6,
            mode: 'map',
            dim: 0.6,
            split: true,
            focus: 'edu',
          },
        },
        {
          sel: '[data-sec="projects"]',
          state: {
            designation: 'SEC /05 — SHIPPED WORK',
            geo: null,
            camZ: 12, // pulled back so more of the orbital ring sits in frame
            mode: 'orbital',
            dim: 0.8, // the ring is this section's co-star — keep it present
            split: false,
            focus: 'none',
          },
        },
        {
          sel: '[data-sec="contact"]',
          state: {
            designation: 'SEC /06 — CONTACT',
            geo: homeGeo,
            camZ: 6.0,
            mode: 'map',
            dim: 1,
            split: true,
            focus: 'home',
          },
        },
      ];

      // Per-role triggers inside experience — each with its own framing + zoom.
      // Created BEFORE the section triggers deliberately: on an instant jump
      // (anchor link / find-in-page) several triggers fire in one batch in
      // creation order, and the section state must win those collisions.
      gsap.utils.toArray<HTMLElement>('[data-role-index]').forEach((el) => {
        const i = Number(el.dataset.roleIndex);
        const framing = roleFraming(roles[i], i, homeGeo);
        const state: Partial<GlobeState> = {
          // Decimalised sub-clause: the roles are clauses 02.1 … 02.5 of /02.
          designation: `SEC /02.${i + 1} — EXPERIENCE`,
          geo: { lat: framing.lat, lng: framing.lng },
          camZ: framing.camZ,
          mode: 'map',
          dim: 1,
          split: true,
          focus: i,
        };
        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => set(state),
          onEnterBack: () => set(state),
        });
      });

      sections.forEach(({ sel, state }) => {
        ScrollTrigger.create({
          trigger: sel,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => set(state),
          onEnterBack: () => set(state),
        });
      });

      // Per-capability triggers: light that row's constellation.
      gsap.utils.toArray<HTMLElement>('[data-cap-index]').forEach((el) => {
        const i = Number(el.dataset.capIndex);
        ScrollTrigger.create({
          trigger: el,
          start: 'top 65%',
          end: 'bottom 35%',
          onEnter: () => setActiveCapability(i),
          onEnterBack: () => setActiveCapability(i),
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

  return (
    <div
      ref={containerRef}
      data-tactical
      className="relative w-full bg-charcoal-900 text-aluminum-100"
      style={{ '--accent': accent } as React.CSSProperties}
    >
      {/* ── Fixed globe canvas ── */}
      <div ref={canvasWrapRef} className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <Canvas camera={{ position: [0, 0, 10], fov: FOV }}>
          <Scene
            state={effectiveGlobeState}
            accentCss={accentCss}
            reducedMotion={reducedMotion}
            isDesktop={isDesktop}
            roles={roles}
            homeGeo={homeGeo}
            educationSites={educationSites}
            activeCapability={activeCapability}
            activeProject={activeProject}
            openProject={openProject}
            projectNames={projectNames}
            onRotationUpdate={onRotationUpdate}
          />
        </Canvas>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 45%, rgb(var(--charcoal-900) / 0.85) 100%)',
          }}
        ></div>
        {/* Content scrim: on split sections the globe's left limb can drift
            under the reading column — this shields the text half, fading to
            nothing by the centre line so the framed side stays crisp. Off in
            dossier mode (the instrument deliberately owns the left there). */}
        <div
          ref={scrimRef}
          className="absolute inset-0 hidden pointer-events-none md:block"
          style={{
            background:
              'linear-gradient(90deg, rgb(var(--charcoal-900) / 0.9) 0%, rgb(var(--charcoal-900) / 0.55) 30%, transparent 52%)',
          }}
        ></div>
      </div>

      {/* ── Live readout: real coordinates, real section state ── */}
      <div className="fixed bottom-6 left-6 z-20 hidden md:block t-readout select-none" aria-hidden="true">
        <p className="text-aluminum-400">
          {/* Dossier and capabilities sub-clauses track the focused item live */}
          {openProject !== null
            ? `SEC /05.${openProject + 1} — DOSSIER · ${projects[openProject].name.toUpperCase()}`
            : globeState.mode === 'matrix' && activeCapability >= 0
              ? `SEC /03.${activeCapability + 1} — CAPABILITIES`
              : globeState.designation}
        </p>
        <p className="text-aluminum-300">
          <span ref={coordsRef}>{formatCoords(homeGeo.lat, homeGeo.lng)}</span>
        </p>
      </div>

      {/* ── Content. While a dossier is open everything fades EXCEPT the
             ledger, which morphs (Flip) into the asset index in the left
             half of the takeover. ── */}
      <div className="relative z-10 w-full">
      <div
        className={`transition-opacity duration-300 ${
          openProject !== null ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        {/* /01 — HERO */}
        <section data-sec="hero">
          <Half>
            <div className="flex min-h-screen flex-col justify-center py-24">
              <Kicker num="01">INDEX</Kicker>
              <h1 className="t-display mt-6 text-5xl md:text-6xl lg:text-7xl">Liam Day</h1>
              <p className="t-readout mt-4 text-aluminum-300">
                [ {badge.toUpperCase()} — {homeGeo.label} ]
              </p>
              <p className="mt-10 max-w-[48ch] text-lg leading-relaxed text-aluminum-200">{profileText}</p>

              {/* Spec rows — hero stats as a ruled datasheet */}
              <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-6 border-t border-aluminum-500 pt-5">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="t-kicker">{s.label}</p>
                    <p className="mt-2 text-lg font-medium text-aluminum-100">{s.value}</p>
                    <p className="mt-1 text-sm text-aluminum-300">{s.detail}</p>
                  </div>
                ))}
              </div>

              <p className="t-kicker mt-14 motion-safe:animate-pulse">↓ SCROLL</p>
            </div>
          </Half>
        </section>

        {/* /02 — EXPERIENCE: the scroll-scrubbed set piece */}
        <section data-sec="experience" className="border-t border-aluminum-500">
          <Half>
            <div className="py-24">
              <Kicker num="02">EXPERIENCE</Kicker>
              <div className="mt-6">
                {roles.map((role, i) => (
                  <article
                    key={`${role.company}-${role.period}`}
                    data-role-index={i}
                    className="flex min-h-[70vh] flex-col justify-center py-12"
                  >
                    <div data-reveal className="border-l-2 border-l-ember-400/70 pl-6">
                      <p className="t-readout text-ember-400">
                        02.{i + 1} | {role.period.toUpperCase()}
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
            </div>
          </Half>
        </section>

        {/* /03 — CAPABILITIES: the datasheet (full width; instrument recessed) */}
        <section data-sec="capabilities" className="border-t border-aluminum-500">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <Kicker num="03">CAPABILITIES</Kicker>
            <div className="mt-12">
              {competencies.map((c, i) => (
                <div
                  key={c.title}
                  data-reveal
                  data-cap-index={i}
                  className="group grid grid-cols-1 gap-2 border-t border-aluminum-500 py-5 md:grid-cols-[6rem_1fr_1.4fr] md:gap-8"
                >
                  <p
                    className={`t-readout transition-colors duration-150 ${
                      activeCapability === i ? 'text-ember-400' : 'text-aluminum-400'
                    }`}
                  >
                    03.{i + 1}
                  </p>
                  <h3 className="text-lg font-medium leading-snug text-aluminum-100">{c.title}</h3>
                  <p className="text-sm leading-relaxed text-aluminum-300">{c.description}</p>
                </div>
              ))}
              <div className="border-t border-aluminum-500"></div>
            </div>
          </div>
        </section>

        {/* /04 — EDUCATION + CERTIFICATIONS (single column in the left half) */}
        <section data-sec="education" className="border-t border-aluminum-500">
          <Half>
            <div className="py-24">
              <Kicker num="04">EDUCATION + CERTIFICATIONS</Kicker>
              <div className="mt-12">
                {education.map((q, i) => (
                  <div key={q.qualification} data-reveal className="border-t border-aluminum-500 py-5">
                    <p className="t-readout text-aluminum-400">
                      <span className="text-ember-400">04.{i + 1}</span> | {String(q.period).toUpperCase()}
                    </p>
                    <h3 className="mt-2 text-lg font-medium text-aluminum-100">{q.qualification}</h3>
                    <p className="mt-1 text-sm text-aluminum-300">{q.institution}</p>
                    {q.geo && <p className="t-readout mt-2 text-aluminum-400">{q.geo.label}</p>}
                  </div>
                ))}
              </div>
              <p className="t-kicker mt-14">CERTIFICATIONS</p>
              <div className="mt-4">
                {certifications.map((q, i) => (
                  <div key={q.qualification} data-reveal className="border-t border-aluminum-500 py-5">
                    <p className="t-readout text-aluminum-400">
                      {/* Clauses continue across the lists: certs pick up after education */}
                      <span className="text-ember-400">04.{education.length + i + 1}</span> |{' '}
                      {String(q.period).toUpperCase()}
                    </p>
                    <h3 className="mt-2 text-lg font-medium text-aluminum-100">{q.qualification}</h3>
                    <p className="mt-1 text-sm text-aluminum-300">{q.institution}</p>
                  </div>
                ))}
                <div className="border-t border-aluminum-500"></div>
              </div>
            </div>
          </Half>
        </section>

      </div>

      {/* /05 — PROJECTS: the ops log (full width; orbital instrument).
          OUTSIDE the fading wrapper: the row grid splits on the viewport
          centre line, so an open dossier panel simply covers the summary
          half — the title column doubles as the asset index, unchanged. */}
      <section data-sec="projects" className="border-t border-aluminum-500">
        <div className="mx-auto w-full max-w-6xl px-6 py-24">
          <Kicker num="05">SHIPPED WORK</Kicker>
          <DefenceLedger
            projects={projects}
            onActiveProject={setActiveProject}
            onOpenProject={openDossier}
            openIndex={openProject}
          />
        </div>
      </section>

      <div
        className={`transition-opacity duration-300 ${
          openProject !== null ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        {/* /06 — CONTACT */}
        <section data-sec="contact" className="border-t border-aluminum-500">
          <Half>
            <div className="flex min-h-[80vh] flex-col justify-center py-24">
              <Kicker num="06">CONTACT</Kicker>
              <h2 className="t-display mt-8 text-4xl md:text-5xl">Available for the hard problems.</h2>
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

              {/* Closing credits — replaces the site footer on this page */}
              <div className="t-readout mt-24 border-t border-aluminum-500 pt-6 text-aluminum-400">
                <p>© {new Date().getFullYear()} LIAM DAY. ALL RIGHTS RESERVED.</p>
                <p className="mt-2">
                  BUILT WITH{' '}
                  <a href="https://astro.build/" className="text-aluminum-300 no-underline hover:text-ember-300">
                    ASTRO
                  </a>
                  {' · '}
                  <a href="https://react.dev/" className="text-aluminum-300 no-underline hover:text-ember-300">
                    REACT
                  </a>
                  {' · '}
                  <a href="https://tailwindcss.com/" className="text-aluminum-300 no-underline hover:text-ember-300">
                    TAILWIND CSS
                  </a>
                  {' · '}
                  <a href="https://gsap.com/" className="text-aluminum-300 no-underline hover:text-ember-300">
                    GSAP
                  </a>
                </p>
                <p className="mt-2">
                  <a href={`mailto:${contact.email}`} className="text-aluminum-300 no-underline hover:text-ember-300">
                    {contact.email.toUpperCase()}
                  </a>
                </p>
              </div>
            </div>
          </Half>
        </section>
      </div>
      </div>

      {/* ── /05.n dossier — briefing takeover. Reading panel owns the RIGHT
             half; the LEFT half keeps the instrument plus the ledger as the
             asset index. Rendered from displayProject so the sheet can play
             its exit slide after openProject clears. ── */}
      {displayProject !== null && (
        <div
          ref={panelWrapRef}
          className="fixed inset-y-0 right-0 z-[15] w-full md:w-1/2"
          role="dialog"
          aria-label={`${projects[displayProject].name} — project dossier`}
        >
          {/* Reading panel — rides the centre split from the right */}
          <div ref={panelRef} className="h-full overflow-y-auto border-l border-aluminum-500 bg-charcoal-900">
            <div ref={panelContentRef} className="w-full max-w-xl px-6 py-20 md:pl-14">
              <p data-dossier-reveal className="t-kicker">
                <span className="text-ember-400">DOSSIER 05.{displayProject + 1}</span>
                {'  —  '}[{designationChip(projects[displayProject])}]
              </p>
              <h2 data-dossier-reveal className="t-display mt-5 text-4xl md:text-5xl">
                {projects[displayProject].name}
              </h2>
              {projects[displayProject].platform && (
                <p data-dossier-reveal className="mt-3 text-aluminum-300">
                  {projects[displayProject].platform}
                </p>
              )}
              {(projects[displayProject].technologies ?? []).length > 0 && (
                <p data-dossier-reveal className="t-readout mt-4 text-aluminum-400">
                  {(projects[displayProject].technologies ?? []).map((t) => `[${t.toUpperCase()}]`).join('  ')}
                </p>
              )}
              <div data-dossier-reveal className="mt-10 border-t border-aluminum-500 pt-10">
                {displaySlug && dossiers[displaySlug] ? (
                  // Build-time partial composed from the same MDX/yml as the
                  // standalone page; all injected content is our own static
                  // build output and contains no scripts.
                  <div dangerouslySetInnerHTML={{ __html: dossiers[displaySlug] }} />
                ) : (
                  <p className="t-readout text-aluminum-400 motion-safe:animate-pulse">RETRIEVING DOSSIER…</p>
                )}
              </div>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={closeDossier}
            className="t-readout fixed right-6 top-6 z-[16] cursor-pointer border border-aluminum-500 bg-charcoal-900/80 px-4 py-2 text-aluminum-300 transition-colors duration-150 hover:border-ember-400 hover:text-ember-300"
          >
            [ESC] CLOSE
          </button>
        </div>
      )}
    </div>
  );
}

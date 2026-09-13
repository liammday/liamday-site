import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Day/night layer for the console globe.
 *
 * The globe already carries an opaque sphere just inside the wireframe, there
 * to write depth so the far hemisphere's lines self-occlude. It is painted
 * flat #101116. This paints the same sphere with the real terminator instead:
 * the lit hemisphere lifts a little, the dark one carries city lights, and the
 * boundary takes a thin band of the page accent. The vector map is untouched
 * and still draws on top — this complements it rather than replacing it.
 *
 * `mix` blends between today's flat sphere (0) and the full day/night (1), so
 * a section transition can bring it up and take it away again. The material
 * stays opaque throughout, which keeps the depth behaviour exactly as it was.
 *
 * City lights are baked from GeoNames cities15000 by scripts/build-night-lights.mjs.
 * Source data: GeoNames (https://www.geonames.org), CC BY 4.0.
 */

const VERT = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uSun;        // subsolar direction, object space, unit length
  uniform vec3 uBase;       // the flat colour this sphere paints today
  uniform vec3 uAccent;     // tactical sky accent
  uniform vec3 uLightCol;   // city-light tint
  uniform sampler2D uLights;
  uniform float uMix;       // 0 = flat sphere, 1 = full day/night
  uniform float uLightGain;
  varying vec3 vPos;

  void main() {
    vec3 n = normalize(vPos);
    float cosZen = dot(n, uSun);

    // The twilight wedge, from civil dusk through to astronomical dark.
    float day = smoothstep(-0.31, 0.05, cosZen);

    // Equirectangular lookup, matching latLongToVector3 in DefenceGlobe so the
    // lights land on the same geography as the country outlines.
    float lat = degrees(asin(clamp(n.y, -1.0, 1.0)));
    float lng = degrees(atan(n.z, -n.x)) - 180.0;
    lng = mod(lng + 180.0, 360.0) - 180.0;
    vec2 uv = vec2((lng + 180.0) / 360.0, (90.0 - lat) / 180.0);

    // Day side lifts just enough to separate from the night without washing
    // out the wireframe that sits on top of it.
    vec3 col = mix(uBase * 0.65, uBase * 2.60, day);

    // Cities only once it is genuinely dark, fading in through dusk.
    float lights = texture2D(uLights, uv).r;
    // Reversed ramp written the legal way round: smoothstep is undefined when
    // edge0 > edge1, and some drivers return nothing at all.
    col += uLightCol * lights * (1.0 - smoothstep(-0.10, 0.16, cosZen)) * uLightGain;

    // The terminator itself: a hairline of accent on the boundary. Kept mean —
    // any wider and it reads as a searchlight rather than a line.
    col += uAccent * exp(-abs(cosZen) * 44.0) * 0.07;

    gl_FragColor = vec4(mix(uBase, col, clamp(uMix, 0.0, 1.0)), 1.0);
    #include <colorspace_fragment>
  }
`;

export interface NightSphereProps {
  radius: number;
  /** Subsolar direction in object space (see lib/solar.ts). */
  sun: [number, number, number];
  /** 0 = today's flat sphere, 1 = full day/night. */
  mix?: number;
  /** THREE-parseable literal — never a CSS var. */
  accent?: string;
  baseColor?: string;
  lightColor?: string;
  lightGain?: number;
  lightsUrl?: string;
}

export function NightSphere({
  radius,
  sun,
  mix = 1,
  accent = '#6096ff',
  baseColor = '#101116',
  lightColor = '#ffd2a1',
  lightGain = 1.5,
  lightsUrl = '/assets/images/globe/night-lights.png',
}: NightSphereProps) {
  const [lights, setLights] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      lightsUrl,
      (tex) => {
      if (cancelled) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      // Wrap in longitude so the antimeridian seam disappears; clamp in
      // latitude so the poles do not sample across.
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.anisotropy = 4;
      setLights(tex);
      },
      undefined,
      () => console.warn(`NightSphere: could not load ${lightsUrl}; staying flat.`),
    );
    return () => {
      cancelled = true;
    };
  }, [lightsUrl]);

  useEffect(() => () => lights?.dispose(), [lights]);

  const uniforms = useMemo(
    () => ({
      uSun: { value: new THREE.Vector3(...sun) },
      uBase: { value: new THREE.Color(baseColor) },
      uAccent: { value: new THREE.Color(accent) },
      uLightCol: { value: new THREE.Color(lightColor) },
      uLights: { value: lights },
      uMix: { value: mix },
      uLightGain: { value: lightGain },
    }),
    // Rebuilt only when the texture arrives: binding a sampler that was null at
    // compile time is unreliable, so the material is created with it in place.
    // Every other field is pushed through the effects below, so nothing is
    // rebuilt mid-transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lights],
  );

  const matRef = useRef<THREE.ShaderMaterial>(null);

  // Push every live value through the material's OWN uniforms object. R3F does
  // not necessarily hold the object passed as a prop by reference, so mutating
  // the memoised one can silently never reach the shader.
  useEffect(() => {
    const u = matRef.current?.uniforms ?? uniforms;
    u.uSun.value.set(sun[0], sun[1], sun[2]).normalize();
    u.uBase.value.set(baseColor);
    u.uAccent.value.set(accent);
    u.uLightCol.value.set(lightColor);
    u.uMix.value = mix;
    u.uLightGain.value = lightGain;
  }, [sun, baseColor, accent, lightColor, mix, lightGain, uniforms]);

  // Until the texture has decoded, paint exactly what the globe paints today.
  if (!lights) {
    return (
      <mesh>
        <sphereGeometry args={[radius * 0.99, 48, 48]} />
        <meshBasicMaterial color={baseColor} />
      </mesh>
    );
  }

  return (
    <mesh>
      <sphereGeometry args={[radius * 0.99, 64, 64]} />
      <shaderMaterial
        key={lights.uuid}
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
      />
    </mesh>
  );
}

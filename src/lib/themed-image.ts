// Resolves a base image plus optional light/dark overrides into a concrete
// pair. Dark theme (site default) prefers the dark override; light theme
// prefers the light override; both fall back to the base, then to each other,
// so a project with no overrides renders exactly as before on both themes.
export interface ThemedSource {
  src: string;
  webp?: string;
}

export interface ThemedPair {
  light: ThemedSource;
  dark: ThemedSource;
}

export function resolveThemedPair(
  base?: string,
  baseWebp?: string,
  light?: string,
  lightWebp?: string,
  dark?: string,
  darkWebp?: string,
): ThemedPair | null {
  const darkSrc = dark ?? base ?? light;
  const lightSrc = light ?? base ?? dark;
  if (!darkSrc || !lightSrc) return null;
  // A webp <source> is only valid if it represents the SAME image as its src,
  // and it always wins over the <img> fallback. So webp must never cross the
  // light/dark boundary: only inherit baseWebp when this side actually resolved
  // to `base`. An override src (e.g. a light SVG with no light webp) emits no
  // <source>, so it can never serve the other theme's raster.
  return {
    dark: { src: darkSrc, webp: dark ? darkWebp : darkSrc === base ? baseWebp : undefined },
    light: { src: lightSrc, webp: light ? lightWebp : lightSrc === base ? baseWebp : undefined },
  };
}

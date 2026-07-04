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
  return {
    dark: { src: darkSrc, webp: darkWebp ?? baseWebp },
    light: { src: lightSrc, webp: lightWebp ?? baseWebp },
  };
}

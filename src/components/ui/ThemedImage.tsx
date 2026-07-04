import type { ThemedSource } from '../../lib/themed-image';

export interface ThemedImageProps {
  light: ThemedSource;
  dark: ThemedSource;
  alt: string;
  width?: number;
  height?: number;
  /** Applied to each <img>. */
  className?: string;
  /** Applied to each <picture> wrapper (sizing/layout). */
  pictureClassName?: string;
  loading?: 'lazy' | 'eager';
}

/**
 * Renders both a dark and a light variant of an image; CSS
 * (.theme-dark-only / .theme-light-only) shows the one matching the active
 * theme. When both variants resolve to the same file the browser dedupes the
 * request, so a variant-less image costs nothing extra.
 */
export function ThemedImage({
  light,
  dark,
  alt,
  width,
  height,
  className,
  pictureClassName,
  loading = 'lazy',
}: ThemedImageProps) {
  const pic = (variant: ThemedSource, themeClass: string) => (
    <picture className={[themeClass, pictureClassName].filter(Boolean).join(' ')}>
      {variant.webp && <source srcSet={variant.webp} type="image/webp" />}
      <img className={className} src={variant.src} alt={alt} loading={loading} width={width} height={height} />
    </picture>
  );
  return (
    <>
      {pic(dark, 'theme-dark-only')}
      {pic(light, 'theme-light-only')}
    </>
  );
}

export default ThemedImage;

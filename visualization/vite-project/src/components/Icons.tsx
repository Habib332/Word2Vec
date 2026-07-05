/**
 * Minimal inline icon set for the Word2Vec Visualizer shell.
 * Kept dependency-free (no icon library) since these are the
 * only glyphs the app needs.
 */

type IconProps = { size?: number; className?: string };

export function LogoMark({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="8" r="3" fill="var(--accent)" />
      <circle cx="20" cy="6" r="2" fill="var(--text-muted)" />
      <circle cx="17" cy="19" r="2.5" fill="var(--accent-2)" />
      <path d="M8.5 9.5L15.5 18" stroke="var(--border-strong)" strokeWidth="1.4" />
      <path d="M8.7 7L18 6.5" stroke="var(--border-strong)" strokeWidth="1.4" />
    </svg>
  );
}

export function ExploreIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4.5" cy="5" r="1.6" fill="currentColor" />
      <circle cx="11.5" cy="4" r="1.2" fill="currentColor" opacity="0.6" />
      <circle cx="12" cy="11" r="1.6" fill="currentColor" />
      <circle cx="5" cy="11.5" r="1.1" fill="currentColor" opacity="0.6" />
      <path d="M5.7 5.9L10.5 10.3" stroke="currentColor" strokeWidth="1.1" opacity="0.5" />
      <path d="M5.6 4.3L10.2 4.4" stroke="currentColor" strokeWidth="1.1" opacity="0.5" />
    </svg>
  );
}

export function InfoIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2" width="11" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 5.5H11M5 8H11M5 10.5H8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function TeamIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="5.5" r="2.1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2.3 13c0-2.2 1.65-3.6 3.7-3.6s3.7 1.4 3.7 3.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="11.3" cy="5.9" r="1.6" stroke="currentColor" strokeWidth="1.1" opacity="0.7" />
      <path d="M10.3 9.9c1.7 0 3.1 1.1 3.3 2.9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function ExportIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 1.8V9.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5 6.6L8 9.8L11 6.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 11.5V12.7C2.5 13.4 3.1 14 3.8 14H12.2C12.9 14 13.5 13.4 13.5 12.7V11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="4.3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.3 10.3L13.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 2.8V13.2M2.8 8H13.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MinusIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.8 8H13.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ResetIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13 8A5 5 0 1 1 11.2 4.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path d="M11 1.8L11.4 4.5L8.7 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GearIcon({ size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="2.1" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M8 2.2v1.4M8 12.4v1.4M13.8 8h-1.4M3.6 8H2.2M11.9 4.1l-1 1M5.1 10.9l-1 1M11.9 11.9l-1-1M5.1 5.1l-1-1"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GithubIcon({ size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0.5C3.86 0.5 0.5 3.86 0.5 8c0 3.31 2.15 6.11 5.13 7.1.37.07.51-.16.51-.36 0-.18-.01-.77-.01-1.4-2.09.38-2.63-.51-2.8-.98-.09-.24-.5-.98-.86-1.18-.29-.16-.71-.54-.01-.55.66-.01 1.13.61 1.29.86.75 1.26 1.96.9 2.44.69.08-.54.3-.9.54-1.11-1.87-.21-3.83-.94-3.83-4.15 0-.92.33-1.67.86-2.26-.09-.21-.37-1.07.08-2.22 0 0 .71-.23 2.32.86a7.9 7.9 0 0 1 4.22 0c1.61-1.09 2.32-.86 2.32-.86.45 1.15.17 2.01.08 2.22.54.59.86 1.33.86 2.26 0 3.22-1.97 3.94-3.84 4.15.3.26.57.77.57 1.56 0 1.13-.01 2.04-.01 2.32 0 .2.14.44.51.36A7.51 7.51 0 0 0 15.5 8c0-4.14-3.36-7.5-7.5-7.5Z" />
    </svg>
  );
}

export function LinkedinIcon({ size = 13 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.6 5.6H1V14.5H3.6V5.6Z" />
      <path d="M2.3 1.2A1.5 1.5 0 1 0 2.3 4.2 1.5 1.5 0 0 0 2.3 1.2Z" />
      <path d="M9.15 5.6H6.65V14.5H9.15V9.85C9.15 8.4 9.75 7.6 10.85 7.6C11.85 7.6 12.35 8.35 12.35 9.85V14.5H14.85V9.35C14.85 6.7 13.4 5.45 11.45 5.45C10 5.45 9.4 6.2 9.15 6.7V5.6Z" />
    </svg>
  );
}
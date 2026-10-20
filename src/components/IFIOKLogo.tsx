export function IFIOKLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="IFIOK logo" role="img">
      <path d="M24 3 41 9v13c0 11-7.4 19.4-17 23C14.4 41.4 7 33 7 22V9l17-6Z" fill="#0A192F" />
      <circle cx="24" cy="23" r="10" fill="none" stroke="#10B981" strokeWidth="2.4" />
      <ellipse cx="24" cy="23" rx="4.5" ry="10" fill="none" stroke="#10B981" strokeWidth="2" />
      <path d="M14 23h20M15.5 18h17M15.5 28h17" stroke="#10B981" strokeWidth="1.6" />
      <path d="M24 3 41 9v13" fill="none" stroke="#F59E0B" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

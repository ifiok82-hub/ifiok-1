export function IFIOKLogo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-label="IFIOK logo" role="img">
      <path d="M3 8h6l4 22h24l4-15H12" fill="none" stroke="#4C1D95" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="26" cy="19" r="10" fill="#F5B301" stroke="#4C1D95" strokeWidth="2" />
      <path d="M21 16h10M23.5 16v8M28.5 16v6.5c0 1 .6 1.5 1.5 1.5" fill="none" stroke="#4C1D95" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="38" r="3.4" fill="#4C1D95" />
      <circle cx="33" cy="38" r="3.4" fill="#4C1D95" />
    </svg>
  );
}

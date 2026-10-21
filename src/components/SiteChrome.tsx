import { Link } from "@tanstack/react-router";
import { IFIOKLogo } from "./IFIOKLogo";

export function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3">
          <Link to="/" className="flex items-center gap-2"><IFIOKLogo className="h-8 w-8" /><span className="font-display text-lg font-bold">IFIOK</span></Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl space-y-5 px-4 py-8 text-sm leading-relaxed [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">Last updated {updated}</p>
        {children}
      </article>
      <Footer />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-navy px-4 py-8 text-center text-xs text-navy-foreground/70">
      <p className="mb-1 font-display text-base font-bold text-navy-foreground">IFIOK — Shop · Pay · Live Better</p>
      <p className="mb-3">Contact: <a href="mailto:support@gasv.store" className="underline">support@gasv.store</a> · <a href="tel:+2348033584736" className="underline">+234 803 358 4736</a></p>
      <p className="mb-2">IFIOK is an independent app built for the Pi ecosystem. Not affiliated with Pi Network or its Core Team.</p>
      <div className="flex justify-center gap-4">
        <Link to="/privacy-policy" className="underline">Privacy Policy</Link>
        <Link to="/terms-of-service" className="underline">Terms of Service</Link>
      </div>
      <p className="mt-3">© 2026 Ifiok Digital Solutions</p>
    </footer>
  );
}

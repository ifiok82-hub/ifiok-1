import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, AlertTriangle, Store, CheckCircle2, Wallet, Globe2, BadgeCheck } from "lucide-react";
import { IFIOKLogo } from "@/components/IFIOKLogo";
import { Footer } from "@/components/SiteChrome";
import { Button } from "@/components/ui/button";
import { CURRENCIES, ESCROW_STAGES, IMAGES, LISTINGS, formatFiat, scanForFraud, type CurrencyCode } from "@/lib/ifiok";
import { getPi, initiateIFIOKEscrowPayment, isPiBrowser, piAuthenticate } from "@/lib/pi";
import { supabase } from "@/integrations/supabase/client";

type Listing = { id: string; title: string; seller: string; badge: string; price: number; img: string; cat: string };

export const Route = createFileRoute("/")({
  loader: async (): Promise<{ listings: Listing[] }> => {
    const { data, error } = await supabase.from("listings").select("id,title,seller_username,badge,category,price_pi,image_url").eq("active", true).order("created_at");
    if (error || !data?.length) return { listings: LISTINGS.map((l) => ({ ...l })) };
    return { listings: data.map((d) => ({ id: d.id, title: d.title, seller: d.seller_username, badge: d.badge, price: Number(d.price_pi), img: d.image_url ?? IMAGES.digital, cat: d.category })) };
  },
  head: () => ({
    meta: [
      { title: "IFIOK — Safe Pi Escrow for Freelancers & Micro-Services" },
      { name: "description", content: "Empowering Global Commerce & Pi Utilities Safely. Hire, sell and trade with smart escrow and anti-scam protection." },
      { property: "og:title", content: "IFIOK — Safe Pi Escrow for Freelancers & Micro-Services" },
      { property: "og:description", content: "Empowering Global Commerce & Pi Utilities Safely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: IMAGES.hero },
      { name: "twitter:image", content: IMAGES.hero },
    ],
  }),
  component: Index,
});

function Index() {
  const { listings } = Route.useLoaderData();
  const [cur, setCur] = useState<CurrencyCode>("USD");
  const [rates, setRates] = useState<Record<string, number>>(Object.fromEntries(CURRENCIES.map((c) => [c.code, c.rate])));
  const [user, setUser] = useState<string | null>(null);
  const [inPi, setInPi] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [stage, setStage] = useState(1);
  const [reportOpen, setReportOpen] = useState(false);
  const [frozen, setFrozen] = useState(false);
  useEffect(() => { setInPi(isPiBrowser() || !!getPi()); }, []);

  const rate = rates[cur] ?? 1;
  const signIn = async () => {
    try { const u = await piAuthenticate(); setUser(u.username); setStatus(`Signed in as @${u.username}`); }
    catch (e) { setStatus((e as Error).message); }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <IFIOKLogo className="h-9 w-9" />
          <div className="mr-auto leading-tight">
            <p className="font-display text-lg font-bold">IFIOK</p>
            <p className="flex items-center gap-1 text-[10px] text-primary"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />Pi Testnet · Mainnet Ready</p>
          </div>
          <select aria-label="Currency" value={cur} onChange={(e) => setCur(e.target.value as CurrencyCode)} className="rounded-md bg-navy-foreground/10 px-2 py-1.5 text-xs">
            {CURRENCIES.map((c) => <option key={c.code} value={c.code} className="text-foreground">{c.flag} {c.code}</option>)}
          </select>
          {user ? (
            <span className="flex items-center gap-1 rounded-md bg-primary/15 px-2 py-1.5 text-xs text-primary"><Wallet className="h-3.5 w-3.5" />@{user}</span>
          ) : (
            <Button size="sm" onClick={signIn}>Sign in</Button>
          )}
        </div>
      </header>

      {!inPi && (
        <div className="bg-gold px-4 py-2 text-center text-xs font-medium text-gold-foreground">Open IFIOK in the Pi Browser to sign in and pay with Pi. You can browse here freely.</div>
      )}
      {status && <div className="bg-accent px-4 py-2 text-center text-xs text-accent-foreground">{status}</div>}

      <section className="relative overflow-hidden text-navy-foreground">
        <img src={IMAGES.hero} alt="Freelancers collaborating around a laptop" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto max-w-5xl px-4 pb-10 pt-28">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-xs text-primary"><ShieldCheck className="h-3.5 w-3.5" />Smart Escrow Protected</span>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl">Empowering Global Commerce &amp; Pi Utilities <span className="text-gold">Safely.</span></h1>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[["12,480", "Escrows completed"], ["99.2%", "Scam-free rate"], ["1,930", "Threats blocked"]].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-navy-foreground/10 p-3 backdrop-blur"><p className="font-display text-xl font-bold">{n}</p><p className="text-[10px] opacity-75">{l}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-bold">Verified Marketplace</h2>
        <p className="mb-5 text-sm text-muted-foreground">Prices in Pi, shown in {cur} at your reference rate.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {listings.map((l) => (
            <article key={l.id} className="overflow-hidden rounded-2xl bg-card shadow-card">
              <img src={l.img} alt={l.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="space-y-1 p-3">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{l.cat}</p>
                <h3 className="text-sm font-semibold">{l.title}</h3>
                <p className="flex items-center gap-1 text-[11px] text-accent-foreground"><BadgeCheck className="h-3 w-3" />@{l.seller} · {l.badge}</p>
                <p className="font-display font-bold">π {l.price} <span className="text-xs font-normal text-muted-foreground">≈ {formatFiat(l.price, rate, cur)}</span></p>
                <Button size="sm" className="w-full" onClick={() => initiateIFIOKEscrowPayment(l.price, l.title, `IF${Date.now()}`, setStatus, l.id)}>Buy with escrow</Button>
              </div>
            </article>
          ))}
        </div>
        <details className="mt-4 rounded-xl border bg-card p-3 text-xs">
          <summary className="cursor-pointer font-medium">Adjust reference rate for {cur}</summary>
          <label className="mt-2 flex items-center gap-2">1 π = <input type="number" step="any" min="0" value={rate} onChange={(e) => setRates({ ...rates, [cur]: Number(e.target.value) || 0 })} className="w-28 rounded-md border bg-background px-2 py-1" /> {cur}</label>
        </details>
      </section>

      <section className="bg-navy py-10 text-navy-foreground">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold"><Lock className="h-5 w-5 text-gold" />Escrow Engine</h2>
          <p className="mb-5 text-sm opacity-75">Order #IF-2041 · Logo design · π 18</p>
          <ol className="space-y-3">
            {ESCROW_STAGES.map((s, i) => {
              const done = i <= stage; const label = frozen && i === stage ? "Disputed — funds frozen" : s;
              return (
                <li key={s} className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${frozen && i === stage ? "bg-destructive text-destructive-foreground" : done ? "bg-primary text-primary-foreground" : "bg-navy-foreground/15"}`}>{done && !(frozen && i === stage) ? <CheckCircle2 className="h-4 w-4" /> : i + 1}</span>
                  <span className={done ? "font-medium" : "opacity-60"}>{label}</span>
                </li>
              );
            })}
          </ol>
          {stage === 3 && !frozen && <p className="mt-4 text-xs text-gold">Auto-release in 7 days unless you confirm or dispute.</p>}
          <div className="mt-5 flex gap-2">
            <Button disabled={frozen || stage >= 4} onClick={() => setStage((s) => s + 1)}>{stage === 3 ? "Confirm & release" : "Advance (demo)"}</Button>
            <Button variant="destructive" disabled={frozen || stage >= 4} onClick={() => setReportOpen(true)}><AlertTriangle className="h-4 w-4" />Report scam</Button>
          </div>
        </div>
      </section>

      <FraudScanner />
      <MerchantPortal />
      <Footer />

      {reportOpen && <ReportModal onClose={() => setReportOpen(false)} onSubmit={() => { setFrozen(true); setReportOpen(false); setStatus("Escrow frozen. Evidence sent to moderation queue."); }} />}
    </div>
  );
}

function FraudScanner() {
  const [msg, setMsg] = useState("");
  const flags = scanForFraud(msg);
  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h2 className="flex items-center gap-2 text-2xl font-bold"><ShieldCheck className="h-5 w-5 text-primary" />Fraud Guard</h2>
      <p className="mb-3 text-sm text-muted-foreground">Every chat message is scanned for phishing links, off-platform payment and passphrase requests. Try it:</p>
      <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder="e.g. Pay me on WhatsApp by bank transfer" className="w-full rounded-xl border bg-card p-3 text-sm" />
      {msg && (flags.length ? (
        <div className="mt-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"><p className="font-semibold">Blocked: message held for review</p><ul className="list-disc pl-5">{flags.map((f) => <li key={f}>{f}</li>)}</ul></div>
      ) : <p className="mt-2 text-sm text-accent-foreground">✓ Looks safe</p>)}
    </section>
  );
}

function ReportModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/70 p-4 md:items-center" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="w-full max-w-md space-y-3 rounded-2xl bg-card p-5">
        <h3 className="text-lg font-bold">Report a scam</h3>
        <p className="text-xs text-muted-foreground">Submitting freezes the escrow immediately. Chat logs are attached automatically.</p>
        <textarea required rows={4} placeholder="What happened?" className="w-full rounded-lg border bg-background p-2 text-sm" />
        <label className="block text-xs">Receipts / screenshots<input type="file" multiple accept="image/*,application/pdf" className="mt-1 block w-full text-xs" /></label>
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" variant="destructive">Freeze & report</Button></div>
      </form>
    </div>
  );
}

function MerchantPortal() {
  const [sent, setSent] = useState(false);
  return (
    <section className="relative overflow-hidden">
      <img src={IMAGES.merchant} alt="Local shop storefront" className="absolute inset-0 h-full w-full object-cover opacity-15" />
      <div className="relative mx-auto max-w-5xl px-4 py-10">
        <h2 className="flex items-center gap-2 text-2xl font-bold"><Store className="h-5 w-5 text-gold" />Become a Merchant</h2>
        <p className="mb-4 text-sm text-muted-foreground">List real products with inventory and local delivery.</p>
        {sent ? <p className="rounded-xl bg-accent p-4 text-sm text-accent-foreground">Application received. A moderator will verify your listing within 48 hours.</p> : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="grid gap-3 rounded-2xl bg-card p-4 shadow-card md:grid-cols-2">
            <input required placeholder="Store name" className="rounded-lg border bg-background p-2 text-sm" />
            <input required placeholder="Product title" className="rounded-lg border bg-background p-2 text-sm" />
            <input required type="number" min="0" step="any" placeholder="Price (π)" className="rounded-lg border bg-background p-2 text-sm" />
            <input required type="number" min="1" placeholder="Stock quantity" className="rounded-lg border bg-background p-2 text-sm" />
            <select className="rounded-lg border bg-background p-2 text-sm"><option>Local pickup</option><option>Same-city delivery</option><option>Nationwide shipping</option><option>Digital delivery</option></select>
            <input required placeholder="City / delivery area" className="rounded-lg border bg-background p-2 text-sm" />
            <Button type="submit" className="md:col-span-2"><Globe2 className="h-4 w-4" />Submit for verification</Button>
          </form>
        )}
        <p className="mt-3 text-xs text-muted-foreground">By listing you agree to our <Link to="/terms-of-service" className="underline">Terms</Link>.</p>
      </div>
    </section>
  );
}

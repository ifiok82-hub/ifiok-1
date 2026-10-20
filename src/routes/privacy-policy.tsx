import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/SiteChrome";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — IFIOK" },
      { name: "description", content: "How IFIOK collects, protects and never sells your data." },
      { property: "og:title", content: "Privacy Policy — IFIOK" },
      { property: "og:description", content: "Data minimization, zero third-party sale, encrypted records." },
    ],
  }),
  component: () => (
    <LegalShell title="Privacy Policy" updated="October 2026">
      <p>IFIOK ("we") operates a utility, freelance escrow and micro-services hub for Pi Pioneers. This policy explains what we collect and why.</p>
      <h2>1. Data Minimization</h2>
      <p>We only collect data necessary for job completion and Pi transaction verification:</p>
      <ul><li>Pi Username (via Pi Authentication)</li><li>Wallet Public Key / payment identifiers</li><li>Order logs, escrow states and dispute evidence you submit</li></ul>
      <p>We never request your passphrase, seed phrase or private keys. Anyone asking for them is a scammer.</p>
      <h2>2. Zero Third-Party Sale</h2>
      <p>Your data is never sold, leased, or transmitted to off-platform marketing entities.</p>
      <h2>3. Data Protection</h2>
      <p>All traffic is encrypted in transit with TLS 1.3. Stored transaction records are encrypted at rest with AES-256. Access is limited to moderation staff handling disputes.</p>
      <h2>4. Retention</h2>
      <p>Order and escrow records are kept as long as needed to resolve disputes and meet legal obligations, then deleted.</p>
      <h2>5. Your Rights</h2>
      <p>You may request access to or deletion of your data by contacting support inside the app.</p>
    </LegalShell>
  ),
});

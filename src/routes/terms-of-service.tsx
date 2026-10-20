import { createFileRoute } from "@tanstack/react-router";
import { LegalShell } from "@/components/SiteChrome";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service — IFIOK" },
      { name: "description", content: "Rules for trading, escrow and disputes on IFIOK." },
      { property: "og:title", content: "Terms of Service — IFIOK" },
      { property: "og:description", content: "Escrow terms, dispute timelines and Pi ecosystem compliance." },
    ],
  }),
  component: () => (
    <LegalShell title="Terms of Service" updated="October 2026">
      <p>By using IFIOK you agree to these terms.</p>
      <h2>1. Pi Ecosystem Compliance</h2>
      <p>Sign-in is by Pi Authentication only and payments run through Pi Payments. All platform utility trades are binding. Off-platform fiat arbitrage or scam operations result in immediate account termination and reporting to Pi ecosystem moderators.</p>
      <h2>2. Escrow Terms</h2>
      <ul>
        <li>Buyers deposit Pi into IFIOK Smart Escrow before work starts.</li>
        <li>Funds are released when the buyer confirms satisfaction, or automatically 7 days after delivery is submitted if no dispute is raised.</li>
        <li>Funds remain locked during active disputes.</li>
        <li>Fraudulent claims by sellers or non-delivery result in a full refund to the buyer.</li>
      </ul>
      <h2>3. Disputes</h2>
      <p>Disputes must be raised before the 7-day timer ends. Moderators review chat logs and uploaded evidence and aim to decide within 5 business days.</p>
      <h2>4. Prohibited Conduct</h2>
      <ul><li>Requesting payment outside IFIOK</li><li>Sharing phishing links or asking for passphrases</li><li>Listing counterfeit, illegal or misrepresented goods</li></ul>
      <h2>5. Liability</h2>
      <p>IFIOK acts as a platform facilitator and automated escrow manager. We are not a party to agreements between buyers and sellers and are not liable for indirect losses.</p>
    </LegalShell>
  ),
});

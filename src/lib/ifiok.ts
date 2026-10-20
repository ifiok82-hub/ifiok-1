// Reference rates: value of 1 Pi in each fiat currency (adjustable in the UI).
export const CURRENCIES = [
  { code: "USD", flag: "🇺🇸", rate: 0.62 },
  { code: "EUR", flag: "🇪🇺", rate: 0.57 },
  { code: "NGN", flag: "🇳🇬", rate: 960 },
  { code: "GBP", flag: "🇬🇧", rate: 0.49 },
  { code: "INR", flag: "🇮🇳", rate: 52 },
  { code: "PHP", flag: "🇵🇭", rate: 35 },
  { code: "BRL", flag: "🇧🇷", rate: 3.4 },
] as const;
export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const IMAGES = {
  hero: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
  digital: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  freelance: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80",
  merchant: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80",
  escrow: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
};

export const LISTINGS = [
  { id: "L1", title: "Web Development", seller: "adaeze_dev", badge: "Top Merchant", price: 45, img: IMAGES.freelance, cat: "Freelance" },
  { id: "L2", title: "Graphics Design", seller: "kofi_studio", badge: "Verified Pioneer", price: 18, img: IMAGES.digital, cat: "Freelance" },
  { id: "L3", title: "AI Prompt Packs", seller: "maria_ai", badge: "Verified Pioneer", price: 6, img: IMAGES.digital, cat: "Digital" },
  { id: "L4", title: "Gift Vouchers", seller: "lagos_mart", badge: "Top Merchant", price: 10, img: IMAGES.merchant, cat: "Goods" },
  { id: "L5", title: "Local Logistics", seller: "swift_uyo", badge: "Verified Pioneer", price: 4, img: IMAGES.merchant, cat: "Services" },
  { id: "L6", title: "Smart Contract Audit", seller: "secure_raj", badge: "Top Merchant", price: 80, img: IMAGES.escrow, cat: "Freelance" },
] as const;

export const ESCROW_STAGES = ["Created", "Deposited", "In Progress", "Work Submitted", "Completed"] as const;

const FRAUD_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /https?:\/\/(?!([a-z0-9-]+\.)?ifiok)/i, reason: "External link detected" },
  { re: /\b(whatsapp|telegram|wa\.me|t\.me|signal)\b/i, reason: "Off-platform contact attempt" },
  { re: /\b(bank transfer|western union|moneygram|send (cash|fiat)|pay outside|paypal|gift ?card code)\b/i, reason: "Payment bypass request" },
  { re: /\b(seed phrase|passphrase|private key|recovery words|12 words|24 words)\b/i, reason: "Wallet phishing attempt" },
  { re: /\b(double your pi|guaranteed profit|investment returns?|airdrop claim)\b/i, reason: "Scam promise" },
];

export function scanForFraud(text: string): string[] {
  return FRAUD_PATTERNS.filter((p) => p.re.test(text)).map((p) => p.reason);
}

export function formatFiat(pi: number, rate: number, code: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency: code, maximumFractionDigits: rate > 10 ? 0 : 2 }).format(pi * rate);
}

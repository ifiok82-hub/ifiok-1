/* Pi Network SDK client helpers. The SDK script is loaded in the root head. */
type PiPaymentCallbacks = {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: unknown) => void;
};
type PiSDK = {
  init: (cfg: { version: string; sandbox?: boolean }) => void;
  authenticate: (scopes: string[], onIncomplete: (p: { identifier: string; transaction?: { txid: string } }) => void) => Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  createPayment: (data: { amount: number; memo: string; metadata: Record<string, unknown> }, cb: PiPaymentCallbacks) => void;
};
declare global { interface Window { Pi?: PiSDK } }

let inited = false;
export function getPi(): PiSDK | null {
  if (typeof window === "undefined" || !window.Pi) return null;
  if (!inited) {
    window.Pi.init({ version: "2.0", sandbox: import.meta.env["VITE_PI_SANDBOX"] === "true" });
    inited = true;
  }
  return window.Pi;
}

export function isPiBrowser() {
  return typeof navigator !== "undefined" && /PiBrowser/i.test(navigator.userAgent);
}

async function post(path: string, body: unknown) {
  const r = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error((await r.text()) || "Server verification failed");
  return r.json();
}

export async function piAuthenticate() {
  const Pi = getPi();
  if (!Pi) throw new Error("Open IFIOK inside the Pi Browser to sign in.");
  const auth = await Pi.authenticate(["username", "payments"], (payment) => {
    if (payment.transaction?.txid) post("/api/public/pi/complete-payment", { paymentId: payment.identifier, txid: payment.transaction.txid }).catch(console.error);
  });
  // Server re-verifies the access token against the Pi Platform API.
  return post("/api/public/pi/verify-user", { accessToken: auth.accessToken }) as Promise<{ uid: string; username: string }>;
}

export function initiateIFIOKEscrowPayment(amount: number, memo: string, orderId: string, onStatus: (s: string) => void, listingId?: string) {
  const Pi = getPi();
  if (!Pi) { onStatus("Please open IFIOK inside the Pi Browser to complete this transaction."); return; }
  Pi.createPayment(
    { amount, memo: `IFIOK Escrow Order #${orderId}: ${memo}`, metadata: { orderId, listingId, type: "ESCROW_DEPOSIT" } },
    {
      onReadyForServerApproval: (paymentId) => { onStatus("Approving on server…"); post("/api/public/pi/approve-payment", { paymentId, orderId }).catch((e) => onStatus(e.message)); },
      onReadyForServerCompletion: (paymentId, txid) => { post("/api/public/pi/complete-payment", { paymentId, txid, orderId }).then(() => onStatus("Deposited — funds locked in escrow.")).catch((e) => onStatus(e.message)); },
      onCancel: () => onStatus("Payment cancelled."),
      onError: (e) => onStatus(`Payment error: ${e.message}`),
    },
  );
}

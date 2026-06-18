const TRACK_ORIGIN = "https://seedlabs.tech";
const IDEA_ID = "8385bc6b-447d-4b0d-b3b7-f01c1f6d3cf1";

function sessionId(): string {
  const k = "sid";
  let v = sessionStorage.getItem(k);
  if (!v) { v = crypto.randomUUID(); sessionStorage.setItem(k, v); }
  return v;
}

function send(type: string, metadata?: Record<string, unknown>) {
  const body = JSON.stringify({ type, ideaId: IDEA_ID, sessionId: sessionId(), metadata });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(TRACK_ORIGIN + "/api/track", new Blob([body], { type: "application/json" }));
  } else {
    void fetch(TRACK_ORIGIN + "/api/track", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
  }
}

export function initTracking() {
  send("pageview");
  document.addEventListener("click", (e) => {
    const el = (e.target as HTMLElement)?.closest("[data-cta]");
    if (el) send("cta", { cta: el.getAttribute("data-cta") });
  });
}

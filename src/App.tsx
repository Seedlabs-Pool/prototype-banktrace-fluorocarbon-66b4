import React, { useState, useMemo } from 'react';

type Bank = {
  id: string;
  region: string;
  substance: string;
  type: string;
  equipment: string;
  gwp: number;
  bankTons: number;
  annualLeak: number;
  recoveryCostUsdPerTonCO2e: number;
  vintage: string;
};

const BANKS: Bank[] = [
  { id: 'b1', region: 'US Gulf Coast', substance: 'HFC-134a', type: 'HFC', equipment: 'Commercial refrigeration', gwp: 1430, bankTons: 4200, annualLeak: 0.12, recoveryCostUsdPerTonCO2e: 7.4, vintage: '2005–2015' },
  { id: 'b2', region: 'US Gulf Coast', substance: 'HCFC-22', type: 'HCFC', equipment: 'Stationary AC', gwp: 1810, bankTons: 3100, annualLeak: 0.08, recoveryCostUsdPerTonCO2e: 5.1, vintage: '1998–2010' },
  { id: 'b3', region: 'EU North', substance: 'HFC-404A', type: 'HFC', equipment: 'Supermarket racks', gwp: 3922, bankTons: 980, annualLeak: 0.18, recoveryCostUsdPerTonCO2e: 9.8, vintage: '2008–2016' },
  { id: 'b4', region: 'EU North', substance: 'CFC-11', type: 'CFC', equipment: 'Insulation foam', gwp: 4750, bankTons: 1450, annualLeak: 0.02, recoveryCostUsdPerTonCO2e: 22.5, vintage: '1985–1994' },
  { id: 'b5', region: 'India', substance: 'HCFC-22', type: 'HCFC', equipment: 'Room AC units', gwp: 1810, bankTons: 6700, annualLeak: 0.15, recoveryCostUsdPerTonCO2e: 4.2, vintage: '2010–2020' },
  { id: 'b6', region: 'India', substance: 'HFC-410A', type: 'HFC', equipment: 'Chillers', gwp: 2088, bankTons: 2200, annualLeak: 0.1, recoveryCostUsdPerTonCO2e: 6.3, vintage: '2014–2022' },
  { id: 'b7', region: 'SE Asia', substance: 'HFC-134a', type: 'HFC', equipment: 'Mobile AC', gwp: 1430, bankTons: 3800, annualLeak: 0.2, recoveryCostUsdPerTonCO2e: 11.2, vintage: '2012–2021' },
  { id: 'b8', region: 'SE Asia', substance: 'HCFC-141b', type: 'HCFC', equipment: 'Spray foam', gwp: 782, bankTons: 1900, annualLeak: 0.03, recoveryCostUsdPerTonCO2e: 18.7, vintage: '2000–2012' },
];

const COLORS = {
  bg: '#f4f7f6',
  ink: '#0d2b27',
  teal: '#0f766e',
  tealDark: '#0a5048',
  accent: '#d97706',
  card: '#ffffff',
  border: '#dce5e2',
  muted: '#3f5b56',
};

const typeColor: Record<string, string> = {
  HFC: '#0f766e',
  HCFC: '#b45309',
  CFC: '#9333ea',
};

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toFixed(0);
}

function Logo() {
  return (
    <svg width="38" height="38" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="42" height="42" rx="11" fill={COLORS.teal} />
      <path d="M14 32c4-2 6-10 10-10s6 8 10 10" stroke="#9ee6dc" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <circle cx="14" cy="32" r="3" fill="#fff" />
      <circle cx="34" cy="32" r="3" fill="#fbbf24" />
      <path d="M24 12v9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="24" cy="22" r="3" fill="#fff" />
    </svg>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: '16px 18px', flex: '1 1 150px', minWidth: 150 }}>
      <div style={{ fontSize: 13, color: COLORS.muted, fontWeight: 600, letterSpacing: 0.2 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.ink, marginTop: 4, lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12.5, color: COLORS.teal, marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  );
}

export default function App() {
  const [region, setRegion] = useState<string>('All regions');
  const [practice, setPractice] = useState<number>(45);
  const [carbonPrice, setCarbonPrice] = useState<number>(18);
  const [selected, setSelected] = useState<string | null>(null);
  const [showScoreInfo, setShowScoreInfo] = useState<boolean>(false);

  const regions = useMemo(() => ['All regions', ...Array.from(new Set(BANKS.map((b) => b.region)))], []);

  const rows = useMemo(() => {
    const filtered = region === 'All regions' ? BANKS : BANKS.filter((b) => b.region === region);
    return filtered
      .map((b) => {
        const lifetimeLeakTons = b.bankTons * Math.min(1, b.annualLeak * 18);
        const co2eGt = (lifetimeLeakTons * b.gwp) / 1_000;
        const avoidableCO2e = co2eGt * (practice / 100);
        const recoveryCost = avoidableCO2e * 1000 * b.recoveryCostUsdPerTonCO2e;
        const creditValue = avoidableCO2e * 1000 * carbonPrice;
        const netMargin = creditValue - recoveryCost;
        const score = Math.max(0, Math.min(100, (netMargin / (avoidableCO2e * 1000 + 1)) * 1.4 + 50));
        return { ...b, avoidableCO2e, recoveryCost, creditValue, netMargin, score };
      })
      .sort((a, b) => b.netMargin - a.netMargin);
  }, [region, practice, carbonPrice]);

  const totals = useMemo(() => {
    const avoidable = rows.reduce((s, r) => s + r.avoidableCO2e, 0);
    const credit = rows.reduce((s, r) => s + r.creditValue, 0);
    const net = rows.reduce((s, r) => s + r.netMargin, 0);
    return { avoidable, credit, net };
  }, [rows]);

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', color: COLORS.ink, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", fontSize: 16 }}>
      <style>{`* { box-sizing: border-box; } button { font-family: inherit; cursor: pointer; } input[type=range]{ accent-color: ${COLORS.teal}; }`}</style>

      <header style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1 }}>BankTrace</div>
            <div style={{ fontSize: 12.5, color: COLORS.muted, marginTop: 2 }}>Fluorocarbon bank intelligence for carbon markets</div>
          </div>
          <a href="#explorer" style={{ marginLeft: 'auto', textDecoration: 'none' }}>
            <button style={{ background: 'transparent', color: COLORS.teal, border: `1.5px solid ${COLORS.teal}`, padding: '9px 16px', borderRadius: 9, fontWeight: 700, fontSize: 14 }}>Open explorer</button>
          </a>
        </div>
      </header>

      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 20px 28px', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center' }}>
        <div style={{ flex: '1 1 420px', minWidth: 280 }}>
          <div style={{ display: 'inline-block', background: '#e1f0ed', color: COLORS.tealDark, fontWeight: 700, fontSize: 13, padding: '6px 12px', borderRadius: 999 }}>21.2 Gt CO₂e banked through 2060 — up to 45% avoidable</div>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', lineHeight: 1.08, margin: '18px 0 14px', fontWeight: 850, letterSpacing: -0.5 }}>
            Find the highest-impact refrigerant stockpiles before they leak.
          </h1>
          <p style={{ fontSize: 18, color: COLORS.muted, margin: '0 0 26px', maxWidth: 560, lineHeight: 1.5 }}>
            BankTrace runs dynamic material-flow analysis on installed equipment and foams to locate, size, and time latent fluorocarbon emissions — then scores the most cost-effective recovery and destruction opportunities for auditable carbon credits.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#explorer" style={{ textDecoration: 'none' }}>
              <button data-cta="open-bank-explorer" style={{ background: COLORS.accent, color: '#fff', border: 'none', padding: '14px 26px', borderRadius: 11, fontWeight: 800, fontSize: 16, boxShadow: '0 6px 18px rgba(217,119,6,0.28)' }}>
                Explore the bank map
              </button>
            </a>
            <a href="#how" style={{ textDecoration: 'none' }}>
              <button style={{ background: '#fff', color: COLORS.ink, border: `1.5px solid ${COLORS.border}`, padding: '14px 22px', borderRadius: 11, fontWeight: 700, fontSize: 16 }}>How it works</button>
            </a>
          </div>
        </div>
        <div style={{ flex: '1 1 300px', minWidth: 260 }}>
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 18, padding: 22, boxShadow: '0 10px 30px rgba(13,43,39,0.07)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.muted, marginBottom: 12 }}>Global avoidable emissions snapshot</div>
            {[
              { l: 'HCFC-22 stationary AC', v: 78 },
              { l: 'HFC supermarket racks', v: 64 },
              { l: 'CFC-11 insulation foam', v: 41 },
              { l: 'HFC mobile AC', v: 57 },
            ].map((d) => (
              <div key={d.l} style={{ marginBottom: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginBottom: 5, fontWeight: 600 }}>
                  <span>{d.l}</span><span style={{ color: COLORS.teal }}>{d.v}</span>
                </div>
                <div style={{ background: '#e8efed', borderRadius: 6, height: 9 }}>
                  <div style={{ width: d.v + '%', height: '100%', background: COLORS.teal, borderRadius: 6 }} />
                </div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>Recovery priority index (GWP-weighted, net-of-cost)</div>
          </div>
        </div>
      </section>

      <section id="explorer" style={{ maxWidth: 1120, margin: '0 auto', padding: '20px 20px 10px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 6px' }}>Bank explorer</h2>
        <p style={{ color: COLORS.muted, margin: '0 0 20px', fontSize: 15.5 }}>Adjust the scenario to rank stockpiles by net carbon-credit margin and avoidable GWP-weighted emissions.</p>

        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 20, marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ flex: '1 1 220px', minWidth: 180 }}>
            <label htmlFor="region" style={{ display: 'block', fontSize: 13.5, fontWeight: 700, marginBottom: 7 }}>Region</label>
            <select id="region" value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: 10, border: `1.5px solid ${COLORS.border}`, fontSize: 15, background: '#fff', color: COLORS.ink }}>
              {regions.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 220px', minWidth: 180 }}>
            <label htmlFor="practice" style={{ display: 'block', fontSize: 13.5, fontWeight: 700, marginBottom: 7 }}>Best-practice recovery rate: <span style={{ color: COLORS.teal }}>{practice}%</span></label>
            <input id="practice" type="range" min={5} max={45} value={practice} onChange={(e) => setPractice(+e.target.value)} style={{ width: '100%' }} />
          </div>
          <div style={{ flex: '1 1 220px', minWidth: 180 }}>
            <label htmlFor="price" style={{ display: 'block', fontSize: 13.5, fontWeight: 700, marginBottom: 7 }}>Carbon price: <span style={{ color: COLORS.teal }}>${carbonPrice}/t CO₂e</span></label>
            <input id="price" type="range" min={4} max={60} value={carbonPrice} onChange={(e) => setCarbonPrice(+e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
          <Stat label="Avoidable emissions" value={fmt(totals.avoidable * 1000) + ' t'} sub={'CO₂e over horizon'} />
          <Stat label="Gross credit value" value={'$' + fmt(totals.credit)} sub="at current price" />
          <Stat label="Net margin after recovery" value={'$' + fmt(totals.net)} sub={totals.net > 0 ? 'profitable portfolio' : 'subsidy needed'} />
          <Stat label="Stockpiles tracked" value={String(rows.length)} sub="matching filter" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setShowScoreInfo((s) => !s)}
            aria-expanded={showScoreInfo}
            aria-controls="score-legend"
            style={{ background: '#e1f0ed', color: COLORS.tealDark, border: 'none', borderRadius: 9, padding: '8px 14px', fontWeight: 700, fontSize: 13.5, display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M12 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="7.5" r="1.2" fill="currentColor" /></svg>
            What does the recovery-priority score mean?
          </button>
          {showScoreInfo && (
            <div id="score-legend" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16, marginTop: 10, fontSize: 14, color: COLORS.muted, lineHeight: 1.55, maxWidth: 640 }}>
              The <strong style={{ color: COLORS.ink }}>recovery-priority score (0–100)</strong> ranks each stockpile by how profitable its abatement is per tonne avoided. It scales the net credit margin (carbon-credit value minus recovery and destruction cost) against the avoidable CO₂e tonnage, then normalises to a 0–100 band. Scores above 60 (teal) indicate stockpiles that pay for their own recovery at the current carbon price; lower scores (amber) need a higher price or subsidy to be viable.
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {rows.map((r, i) => {
            const open = selected === r.id;
            const panelId = 'panel-' + r.id;
            return (
              <div key={r.id} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden' }}>
                <button
                  onClick={() => setSelected(open ? null : r.id)}
                  aria-expanded={open}
                  aria-controls={panelId}
                  style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '16px 18px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: COLORS.tealDark, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: '1 1 160px', minWidth: 140 }}>
                    <div style={{ fontWeight: 800, fontSize: 15.5 }}>{r.substance} <span style={{ fontWeight: 600, color: COLORS.muted }}>· {r.equipment}</span></div>
                    <div style={{ fontSize: 13, color: COLORS.muted, marginTop: 2 }}>{r.region} · vintage {r.vintage}</div>
                  </div>
                  <span style={{ background: typeColor[r.type] + '22', color: typeColor[r.type], fontWeight: 700, fontSize: 12.5, padding: '5px 10px', borderRadius: 999, flexShrink: 0 }}>{r.type}</span>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'right', minWidth: 96 }}>
                      <div style={{ fontSize: 12.5, color: COLORS.muted, fontWeight: 600 }}>Net margin</div>
                      <div style={{ fontWeight: 800, fontSize: 17, color: r.netMargin > 0 ? COLORS.teal : COLORS.accent }}>${fmt(r.netMargin)}</div>
                    </div>
                    <div style={{ width: 64 }}>
                      <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, marginBottom: 4 }}>Score {r.score.toFixed(0)}</div>
                      <div style={{ background: '#e8efed', borderRadius: 5, height: 8 }}>
                        <div style={{ width: r.score + '%', height: '100%', background: r.score > 60 ? COLORS.teal : COLORS.accent, borderRadius: 5 }} />
                      </div>
                    </div>
                  </div>
                </button>
                {open && (
                  <div id={panelId} style={{ borderTop: `1px solid ${COLORS.border}`, padding: '16px 18px', background: '#fafcfb', display: 'flex', flexWrap: 'wrap', gap: 22 }}>
                    {[
                      { l: 'GWP (100-yr)', v: r.gwp.toLocaleString() },
                      { l: 'Banked substance', v: fmt(r.bankTons * 1000) + ' t' },
                      { l: 'Annual leak rate', v: (r.annualLeak * 100).toFixed(0) + '%/yr' },
                      { l: 'Avoidable CO₂e', v: fmt(r.avoidableCO2e * 1000) + ' t' },
                      { l: 'Recovery cost', v: '$' + fmt(r.recoveryCost) },
                      { l: 'Abatement cost', v: '$' + r.recoveryCostUsdPerTonCO2e.toFixed(1) + '/t' },
                    ].map((d) => (
                      <div key={d.l} style={{ minWidth: 110 }}>
                        <div style={{ fontSize: 12.5, color: COLORS.muted, fontWeight: 600 }}>{d.l}</div>
                        <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{d.v}</div>
                      </div>
                    ))}
                    <div style={{ flexBasis: '100%', fontSize: 13.5, color: COLORS.muted, lineHeight: 1.5, marginTop: 4 }}>
                      Baseline generated from MFA stock estimates with leak-rate decay. Eligible for refrigerant-destruction protocols (e.g. ACR / verified destruction) with chain-of-custody documentation.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section id="how" style={{ maxWidth: 1120, margin: '0 auto', padding: '46px 20px 10px' }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 22px' }}>From buried banks to bankable credits</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { t: 'Model the bank', d: 'Dynamic material-flow analysis estimates installed-base stocks of HFCs, HCFCs, CFCs and foams by region, equipment type and vintage.' },
            { t: 'Score the leak', d: 'We project time-lagged, GWP-weighted emissions and rank stockpiles by avoidable tonnes net of recovery and destruction cost.' },
            { t: 'Flag the deal', d: 'Cost-effective recovery targets surface with abatement cost curves and carbon-price sensitivity for project developers.' },
            { t: 'Issue with proof', d: 'Auditable baselines and chain-of-custody outputs feed refrigerant-destruction protocols and Kigali compliance reporting.' },
          ].map((c, i) => (
            <div key={c.t} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 20 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: '#e1f0ed', color: COLORS.tealDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, marginBottom: 12 }}>{i + 1}</div>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>{c.t}</div>
              <div style={{ color: COLORS.muted, fontSize: 14.5, lineHeight: 1.5 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '40px 20px 20px' }}>
        <div style={{ background: COLORS.tealDark, borderRadius: 20, padding: 'clamp(26px, 5vw, 44px)', color: '#eafaf6', display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center' }}>
          <div style={{ flex: '1 1 320px', minWidth: 260 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 10px', color: '#fff' }}>Built for the people closing the gap</h2>
            <p style={{ fontSize: 16, lineHeight: 1.55, margin: 0, color: '#c9ece5' }}>
              Refrigerant reclaimers source the most valuable stockpiles. Carbon project developers build defensible baselines. Regulators track Kigali Amendment phase-down with real stock data.
            </p>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <a href="#explorer" style={{ textDecoration: 'none' }}>
              <button data-cta="hero-secondary-explore" style={{ background: COLORS.accent, color: '#fff', border: 'none', padding: '15px 28px', borderRadius: 11, fontWeight: 800, fontSize: 16 }}>Run a scenario</button>
            </a>
          </div>
        </div>
      </section>

      <footer style={{ maxWidth: 1120, margin: '0 auto', padding: '28px 20px 48px', color: COLORS.muted, fontSize: 13.5, lineHeight: 1.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><Logo /><strong style={{ color: COLORS.ink }}>BankTrace</strong></div>
        Prototype with illustrative MFA estimates. Figures are demonstrative and not certified carbon baselines. Banked HCFC/HFC potential: ~21.2 Gt CO₂e cumulative 2022–2060 under business-as-usual.
      </footer>
    </div>
  );
}

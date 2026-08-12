"use client";

import { useMemo, useState } from "react";
import { InteractiveSLD } from "../src/components/InteractiveSLD";

type ModeKey = "solar" | "outage" | "night" | "generator";
type DetailKey = "pv" | "inverter" | "battery" | "switching" | "loads";


const modes: Record<ModeKey, { label: string; eyebrow: string; title: string; description: string; sources: string[]; path: string }> = {
  solar: {
    label: "Sunny + Grid",
    eyebrow: "Normal daytime operation",
    title: "Solar supplies the factory first",
    description: "PV power passes through both hybrid inverters. It serves critical loads, charges the batteries when spare energy is available, and uses the grid only when needed.",
    sources: ["pv", "grid", "inv", "load", "battery"],
    path: "PV → Inverters → Critical loads + Battery charging",
  },
  outage: {
    label: "Grid Outage",
    eyebrow: "Backup operation",
    title: "Solar and batteries keep critical loads running",
    description: "The inverter disconnects from the failed grid. Critical loads continue from solar and batteries. Heavy non-critical loads should remain off unless the system has enough capacity.",
    sources: ["pv", "battery", "inv", "load"],
    path: "PV + Batteries → Inverters → Critical loads",
  },
  night: {
    label: "Night",
    eyebrow: "No solar generation",
    title: "Grid supplies loads and preserves battery reserve",
    description: "At night the grid normally supplies the loads. The energy-management setting decides whether batteries remain reserved for outages or discharge to reduce grid use.",
    sources: ["grid", "inv", "load"],
    path: "Grid → Inverters → Critical loads",
  },
  generator: {
    label: "Generator",
    eyebrow: "Extended outage operation",
    title: "Generator supports loads and can recharge batteries",
    description: "When the grid is unavailable and battery reserve is low, the generator enters through one approved route. Never connect it through both the ATS and inverter GEN port at the same time.",
    sources: ["gen", "inv", "load", "battery"],
    path: "Generator → Inverters → Critical loads + Battery charging",
  },
};

const details: Record<DetailKey, { number: string; title: string; simple: string; engineering: string; check: string }> = {
  pv: {
    number: "01",
    title: "PV strings",
    simple: "Panels are connected in series to make one string. Fourteen strings share 170 identical panels.",
    engineering: "Per inverter: six 12-panel strings and one 13-panel string. Keep string lengths equal when two strings share one MPPT.",
    check: "Confirm every panel is the same 710 W model before construction.",
  },
  inverter: {
    number: "02",
    title: "Two hybrid inverters",
    simple: "The inverters change solar and battery DC electricity into factory AC electricity.",
    engineering: "Each 50 kW Solis inverter receives 85 panels (60.35 kWp), using seven of its eight PV inputs.",
    check: "Parallel backup outputs require Solis communication and approved commissioning.",
  },
  battery: {
    number: "03",
    title: "Two battery packs",
    simple: "Batteries store spare energy and return it when solar or grid power is unavailable.",
    engineering: "High-voltage lithium battery packs connected to Inverter 1 and Inverter 2. Exact voltage, capacity, and module count to be confirmed.",
    check: "Use an approved high-voltage master BMS, DC protection and communication.",
  },
  switching: {
    number: "04",
    title: "Grid, generator & switching",
    simple: "The switching equipment chooses which external source is allowed to supply the system.",
    engineering: "Use either the inverter GEN-port architecture or an ATS-fed grid port. Add an interlocked maintenance bypass for critical loads.",
    check: "One generator must never be connected through two live routes.",
  },
  loads: {
    number: "05",
    title: "Critical & non-critical loads",
    simple: "Important equipment stays on the inverter backup bus. Heavy or less important equipment stays on the normal bus.",
    engineering: "Separate load schedules prevent the 100 kW inverter system from being overloaded during an outage.",
    check: "List the kW, starting current and priority of every critical load.",
  },
};

const stringPlan = [12, 12, 12, 12, 12, 12, 13];

function Arrow({ active, tone = "solar" }: { active: boolean; tone?: "solar" | "grid" | "battery" | "generator" }) {
  return <span aria-hidden="true" className={`flow-arrow ${active ? `active ${tone}` : ""}`}><i /></span>;
}

function SystemNode({ id, label, sub, active, selected, onClick }: { id: DetailKey; label: string; sub: string; active: boolean; selected: boolean; onClick: () => void }) {
  return (
    <button className={`system-node ${active ? "powered" : ""} ${selected ? "selected" : ""}`} onClick={onClick} aria-pressed={selected}>
      <span className={`node-icon ${id}`} aria-hidden="true" />
      <span><strong>{label}</strong><small>{sub}</small></span>
    </button>
  );
}

export default function Home() {
  const [mode, setMode] = useState<ModeKey>("solar");
  const [detail, setDetail] = useState<DetailKey>("pv");
  const [showMath, setShowMath] = useState(false);
  const active = modes[mode].sources;
  const info = details[detail];
  const totals = useMemo(() => ({ panels: stringPlan.reduce((a, b) => a + b, 0), kwp: (stringPlan.reduce((a, b) => a + b, 0) * 0.71).toFixed(2) }), []);

  return (
    <main>
      <header className="site-header">
        <a href="#top" className="brand" aria-label="Solar Hybrid Explorer home"><span className="brand-mark">S</span><span>Solar Hybrid<br /><b>System Explorer</b></span></a>
        <nav aria-label="Page navigation"><a href="#flow">Power flow</a><a href="#strings">170 panels</a><a href="#interactive-sld">Interactive SLD</a></nav>
        <span className="concept-pill">Learning model</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker"><span /> IIDA factory concept</p>
          <h1>See how your <em>solar hybrid system</em> works.</h1>
          <p className="hero-lede">A simple, interactive explanation of 170 solar panels, two 50 kW inverters, two battery packs, the grid, generator and factory loads.</p>
          <div className="hero-actions"><a className="primary-button" href="#flow">Start with power flow <span>↓</span></a><a className="text-link" href="#strings">See the 14-string plan →</a></div>
        </div>
        <div className="hero-summary" aria-label="System summary">
          <div className="sun-disc"><span>170</span><small>PV panels</small></div>
          <div className="summary-grid"><div><b>120.70</b><span>kWp solar</span></div><div><b>2 × 50</b><span>kW inverter</span></div><div><b>14</b><span>PV strings</span></div><div><b>2</b><span>battery packs</span></div></div>
          <p>Assumption: all 170 panels are identical 710 W modules.</p>
        </div>
      </section>

      <section className="section flow-section" id="flow">
        <div className="section-heading"><div><p className="kicker"><span /> Interactive power flow</p><h2>Choose an operating situation</h2></div><p>The glowing lines show where electricity comes from and where it goes. Click any equipment block for a plain-language explanation.</p></div>
        <div className="mode-tabs" role="tablist" aria-label="Operating situations">{(Object.keys(modes) as ModeKey[]).map((key) => <button role="tab" aria-selected={mode === key} className={mode === key ? "active" : ""} onClick={() => setMode(key)} key={key}>{modes[key].label}</button>)}</div>

        <div className="flow-workspace">
          <div className={`flow-canvas mode-${mode}`}>
            <div className="source-stack">
              <SystemNode id="pv" label="Solar array" sub="14 PV strings" active={active.includes("pv")} selected={detail === "pv"} onClick={() => setDetail("pv")} />
              <SystemNode id="battery" label="Battery packs" sub="Pack 1 + Pack 2" active={active.includes("battery")} selected={detail === "battery"} onClick={() => setDetail("battery")} />
            </div>
            <div className="arrow-stack"><Arrow active={active.includes("pv")} /><Arrow active={active.includes("battery")} tone="battery" /></div>
            <SystemNode id="inverter" label="Hybrid inverters" sub="2 × Solis 50 kW" active={active.includes("inv")} selected={detail === "inverter"} onClick={() => setDetail("inverter")} />
            <Arrow active={active.includes("load")} tone={mode === "generator" ? "generator" : mode === "night" ? "grid" : "solar"} />
            <SystemNode id="loads" label="Critical loads" sub="Backup ACDB" active={active.includes("load")} selected={detail === "loads"} onClick={() => setDetail("loads")} />
            <div className="external-sources">
              <button className={`mini-source ${active.includes("grid") ? "powered grid" : ""}`} onClick={() => setDetail("switching")}><span className="grid-symbol">⌁</span><b>Grid</b></button>
              <Arrow active={active.includes("grid")} tone="grid" />
              <button className={`mini-source ${active.includes("gen") ? "powered generator" : ""}`} onClick={() => setDetail("switching")}><span className="gen-symbol">G</span><b>Generator</b></button>
              <Arrow active={active.includes("gen")} tone="generator" />
              <button className={`switch-node ${detail === "switching" ? "selected" : ""}`} onClick={() => setDetail("switching")}><span>ATS / GEN port</span><small>Approved switching route</small></button>
            </div>
          </div>
          <aside className="mode-explanation"><p className="mode-eyebrow">{modes[mode].eyebrow}</p><h3>{modes[mode].title}</h3><p>{modes[mode].description}</p><div className="route-readout"><span>Active route</span><b>{modes[mode].path}</b></div></aside>
        </div>

        <div className="detail-panel" aria-live="polite"><span className="detail-number">{info.number}</span><div><p className="detail-label">You selected</p><h3>{info.title}</h3></div><div className="detail-copy"><p>{info.simple}</p><small>{info.engineering}</small></div><div className="check-note"><span>✓</span><p><b>Before final drawing</b>{info.check}</p></div></div>
      </section>

      <section className="section strings-section" id="strings">
        <div className="section-heading inverse"><div><p className="kicker"><span /> Your 170-panel plan</p><h2>One balanced half for each inverter</h2></div><p>Each inverter receives 85 panels. That keeps the solar capacity balanced at 60.35 kWp per inverter.</p></div>
        <div className="string-layout">
          {[1, 2].map((inverter) => (
            <article className="inverter-plan" key={inverter}>
              <div className="plan-head"><div><span>INV–0{inverter}</span><h3>Inverter {inverter}</h3></div><strong>{totals.panels}<small>panels</small></strong></div>
              <div className="string-list">{stringPlan.map((panels, index) => <div className={`string-row ${panels === 13 ? "long" : ""}`} key={index}><span>S{inverter}-{String(index + 1).padStart(2, "0")}</span><div className="panel-bar">{Array.from({ length: panels }).map((_, p) => <i key={p} />)}</div><b>{panels}</b></div>)}</div>
              <div className="plan-total"><span>7 strings</span><span>{totals.kwp} kWp</span><span>1 spare input</span></div>
            </article>
          ))}
        </div>
        <div className="mppt-map"><div><p className="detail-label">Same map inside each inverter</p><h3>Four MPPT groups</h3><p>Two same-length strings may share an MPPT. The single 13-panel string gets its own MPPT input.</p></div><div className="mppt-grid"><span><b>MPPT 1</b>12 + 12</span><span><b>MPPT 2</b>12 + 12</span><span><b>MPPT 3</b>12 + 12</span><span className="accent"><b>MPPT 4</b>13 + spare</span></div></div>
        <button className="math-toggle" onClick={() => setShowMath(!showMath)} aria-expanded={showMath}><span>{showMath ? "−" : "+"}</span> Why are two strings longer?</button>
        {showMath && <div className="math-answer"><div><b>170 ÷ 14</b><span>= 12 panels, remainder 2</span></div><p>Start with 14 strings of 12 panels: that uses 168 panels. Put each of the two remaining panels on a different inverter, making one 13-panel string per inverter.</p><code>12 strings × 12 panels + 2 strings × 13 panels = 170</code></div>}
      </section>

      {/* PHASE 2: DETAILED INTERACTIVE SOLAR SINGLE LINE DIAGRAM */}
      <InteractiveSLD />

      <section className="section sld-section" id="sld">
        <div className="section-heading"><div><p className="kicker"><span /> Recommended drawing logic</p><h2>Make the final SLD easier to read—and safer to review</h2></div><p>Draw energy sources on the left, conversion and switching in the middle, then factory loads on the right.</p></div>
        <div className="sld-path"><div><span>1</span><b>Sources</b><small>PV · Grid · Generator · Batteries</small></div><i>→</i><div><span>2</span><b>Protection</b><small>Isolators · MCCBs · SPDs · BMS</small></div><i>→</i><div><span>3</span><b>Conversion</b><small>Hybrid inverter 1 + 2</small></div><i>→</i><div><span>4</span><b>Distribution</b><small>ACDB · Bypass · Critical loads</small></div></div>
        <div className="recommendation-grid"><article className="recommended"><span className="card-tag">Recommended</span><h3>One clear generator route</h3><p>Use the dedicated inverter GEN input for hybrid operation, or feed the inverter grid input from an ATS. Choose one architecture and label it clearly.</p></article><article><span className="card-tag warning">Avoid</span><h3>Connecting generator twice</h3><p>Do not connect the same generator through both the ATS route and the inverter GEN port unless Solis has approved the complete control arrangement.</p></article><article><span className="card-tag">Required</span><h3>Individual inverter protection</h3><p>Show separate PV inputs, battery protection and AC MCCBs for each inverter before the two units connect to a common bus.</p></article></div>
      </section>

      <section className="decision-strip"><div><span className="attention">!</span><p><b>One fact must be confirmed</b>Your present documents show 120 Trina 710 W plus 72 Jinko 550 W panels—192 panels total. This 170-panel learning model is valid only if all 170 installed panels are the same 710 W model.</p></div><a href="https://link.imm-it.com/sld.pdf" target="_blank" rel="noreferrer">Open current SLD ↗</a></section>
      <footer><div className="brand footer-brand"><span className="brand-mark">S</span><span>Solar Hybrid<br /><b>System Explorer</b></span></div><p>Conceptual learning tool—not a construction drawing. Final cable, breaker, earthing, protection and commissioning selections must be verified by the responsible electrical engineer and equipment manufacturers.</p><div><a href="https://link.imm-it.com/explain.html" target="_blank" rel="noreferrer">Current specifications</a><a href="https://www.solisinverters.com/global/energy_storage_inverters16/S6-EH3P%2829%2C9-50%29K-H_gl.html" target="_blank" rel="noreferrer">Solis inverter data</a></div></footer>
    </main>
  );
}

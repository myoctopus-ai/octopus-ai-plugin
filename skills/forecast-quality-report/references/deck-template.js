// Forecast Quality Report — pptxgenjs deck template.
// Usage: fill `data` (from forecast-quality-<version>.json + your scoring), then
//   node deck-template.js   →   Forecast Quality Report - <current>.pptx
// Layout is fixed and fits: 16:9, 13.33 x 7.5 in. Tables paginate by ROWS_PER_SLIDE
// rather than shrink. Keep cell text to one idea; the template truncates long cells.

const pptxgen = require("pptxgenjs");

// ---------------------------------------------------------------- data ----
const data = {
  org: "Octopus AI",
  currentLabel: "RF08FN",           // version under review (legend name)
  baseLabel: "RF07FN",              // the version it replaced
  period: "Aug–Dec 2026",
  level: "Budget Tree, level 1",
  thresholdText: "$250,000",
  revenueRule: "Revenue excluded (BT3)",
  orgExclusions: "excl. Superplay, BT26, BT99, BT100",
  closedMonthRule: "YTD shown, not scored — org reloads actuals into closed months",
  preparedOn: "20 Sep 2026",
  scoreChangeText: "",              // e.g. "Count score +9 pts vs RF07FN"
  // Cover table. Fill FY/YTD/YTG from the totals-only comparison calls.
  summary: [
    // { label, base, current, delta, deltaPct, direction: "risk" | "opportunity" | "flat" }
  ],
  risksTotal: { count: 0, amount: 0 },
  opportunitiesTotal: { count: 0, amount: 0 },
  score: { countExplained: 0, countTotal: 0, magExplained: 0, magTotal: 0, riskPct: 0, oppPct: 0 },
  scored: { compared: 0, material: 0, excluded: 0 },
  // One row per material node. direction "risk" (delta > 0) or "opportunity" (delta < 0).
  // explanation: null for a gap. grade: 0..4. by: "Name — insight, 1 Sep" | null.
  movements: [
    // { code, name, base, current, delta, direction, timing: bool,
    //   explanation, by, grade, nextTime, action, soThat, actionType: "gap"|"followup"|"none" }
  ],
  // Adjacent / partial / stale records that don't count.
  notExplanations: [
    // { code, name, covers, whyNot }
  ],
};

// -------------------------------------------------------------- style ----
const C = {
  bg: "F7F5F0", ink: "1F1F1F", muted: "6B6B6B", line: "D9D5CC", head: "E7E3DA",
  risk: "B3261E", riskSoft: "F6E3E1", opp: "1E7B4F", oppSoft: "E1F1E8",
  flat: "6B6B6B", accent: "8A5A3C", dark: "1F1D1B", white: "FFFFFF",
};
const F = { serif: "Georgia", sans: "Calibri" };
const W = 13.33, H = 7.5, M = 0.6;
const ROWS_PER_SLIDE = 9;

const money = (v) => {
  if (v === null || v === undefined) return "—";
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${s}$${Math.round(a / 1e3)}K`;
  return `${s}$${Math.round(a)}`;
};
const pct = (v) => (v === null || v === undefined ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`);
const dirColor = (d) => (d === "risk" ? C.risk : d === "opportunity" ? C.opp : C.flat);
const dirWord = (d) => (d === "risk" ? "Risk" : d === "opportunity" ? "Opportunity" : "Flat");
const stars = (g) => (g ? "★".repeat(g) + "☆".repeat(4 - g) : "—");
const clip = (s, n) => (s && s.length > n ? s.slice(0, n - 1) + "…" : s || "");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";

function frame(slide, title, { dark = false, footer = "" } = {}) {
  slide.background = { color: dark ? C.dark : C.bg };
  slide.addText(title, {
    x: M, y: 0.45, w: W - 2 * M, h: 0.9, fontFace: F.serif, fontSize: 28,
    color: dark ? C.white : C.ink, valign: "top",
  });
  if (footer) {
    slide.addText(footer, {
      x: M, y: H - 0.55, w: W - 2 * M, h: 0.3, fontFace: F.sans, fontSize: 10,
      color: dark ? "A9A49B" : C.muted,
    });
  }
}

function tile(slide, x, y, w, h, label, value, sub, color = C.ink) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, fill: { color: C.white }, line: { color: C.line, width: 0.75 }, rectRadius: 0.08,
  });
  slide.addText(label.toUpperCase(), { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: 0.3, fontFace: F.sans, fontSize: 11, color: C.muted, bold: true });
  slide.addText(value, { x: x + 0.25, y: y + 0.55, w: w - 0.5, h: 0.8, fontFace: F.serif, fontSize: 34, color });
  if (sub) slide.addText(sub, { x: x + 0.25, y: y + 1.35, w: w - 0.5, h: h - 1.5, fontFace: F.sans, fontSize: 11, color: C.muted, valign: "top" });
}

function table(slide, y, header, rows, colW, opts = {}) {
  const head = header.map((t) => ({ text: t, options: { bold: true, fill: { color: C.head }, color: C.ink, fontSize: 10 } }));
  slide.addTable([head, ...rows], {
    x: M, y, w: W - 2 * M, colW, fontFace: F.sans, fontSize: 10, color: C.ink,
    border: { type: "solid", pt: 0.5, color: C.line }, valign: "middle", autoPage: false, ...opts,
  });
}

function cell(text, o = {}) { return { text: text ?? "—", options: o }; }

function paginate(rows, per = ROWS_PER_SLIDE) {
  const out = []; for (let i = 0; i < rows.length; i += per) out.push(rows.slice(i, i + per)); return out.length ? out : [[]];
}

// ------------------------------------------------------------- slides ----
// 1. Cover: how the forecast moved
{
  const s = pptx.addSlide();
  s.background = { color: C.dark };
  s.addText("FORECAST QUALITY REPORT", { x: M, y: 0.5, w: 6, h: 0.35, fontFace: F.sans, fontSize: 12, color: "C9A78E", charSpacing: 2 });
  s.addText(`${data.currentLabel}, scored against ${data.baseLabel}`, { x: M, y: 0.95, w: W - 2 * M, h: 1.0, fontFace: F.serif, fontSize: 34, color: C.white });
  const hdr = ["", data.baseLabel, data.currentLabel, "Change", "Read"];
  const rows = data.summary.map((r) => [
    cell(r.label, { bold: true, color: C.white }),
    cell(money(r.base), { color: C.white, align: "right" }),
    cell(money(r.current), { color: C.white, align: "right" }),
    cell(`${money(r.delta)}  (${pct(r.deltaPct)})`, { color: r.direction === "risk" ? "F28B82" : r.direction === "opportunity" ? "7BD3A2" : "BDB8AE", align: "right", bold: true }),
    cell(dirWord(r.direction), { color: r.direction === "risk" ? "F28B82" : r.direction === "opportunity" ? "7BD3A2" : "BDB8AE", bold: true }),
  ]);
  s.addTable([hdr.map((t) => cell(t, { bold: true, color: "BDB8AE", fontSize: 10 })), ...rows], {
    x: M, y: 2.1, w: W - 2 * M, colW: [2.6, 2.3, 2.3, 2.9, 2.03], fontFace: F.sans, fontSize: 12,
    border: { type: "solid", pt: 0.5, color: "3A3733" }, fill: { color: "2A2724" },
  });
  const ty = 4.35;
  s.addShape(pptx.ShapeType.roundRect, { x: M, y: ty, w: 5.9, h: 1.2, fill: { color: "3A2422" }, line: { color: C.risk, width: 1 }, rectRadius: 0.08 });
  s.addText(`RISKS  ·  ${data.risksTotal.count} movements  ·  ${money(data.risksTotal.amount)}`, { x: M + 0.25, y: ty + 0.15, w: 5.4, h: 0.9, fontFace: F.sans, fontSize: 16, color: "F28B82", bold: true, valign: "middle" });
  s.addShape(pptx.ShapeType.roundRect, { x: W - M - 5.9, y: ty, w: 5.9, h: 1.2, fill: { color: "1F2E26" }, line: { color: C.opp, width: 1 }, rectRadius: 0.08 });
  s.addText(`OPPORTUNITIES  ·  ${data.opportunitiesTotal.count} movements  ·  ${money(data.opportunitiesTotal.amount)}`, { x: W - M - 5.65, y: ty + 0.15, w: 5.4, h: 0.9, fontFace: F.sans, fontSize: 16, color: "7BD3A2", bold: true, valign: "middle" });
  const sc = data.score;
  s.addText(
    `${sc.countExplained} of ${sc.countTotal} material movements explained (${Math.round((100 * sc.countExplained) / Math.max(1, sc.countTotal))}%) — ${money(sc.magExplained)} of ${money(sc.magTotal)} by exposure (${Math.round((100 * sc.magExplained) / Math.max(1, sc.magTotal))}%). Explained risk ${sc.riskPct}% · explained opportunity ${sc.oppPct}%. ${data.scoreChangeText}`,
    { x: M, y: 5.75, w: W - 2 * M, h: 0.7, fontFace: F.sans, fontSize: 14, color: C.white },
  );
  s.addText(`${data.period} · ${data.level} · threshold ${data.thresholdText} · ${data.revenueRule} · ${data.orgExclusions} · ${data.closedMonthRule} · prepared ${data.preparedOn}`,
    { x: M, y: H - 0.7, w: W - 2 * M, h: 0.5, fontFace: F.sans, fontSize: 10, color: "A9A49B" });
}

// 2. What was scored
{
  const s = pptx.addSlide();
  frame(s, "What was scored, and what counts as explained", { footer: "Plan figures from the Octopus AI connector, one comparison call at the reporting level" });
  tile(s, M, 1.6, 5.9, 4.2, "The scored set",
    `${data.scored.material} of ${data.scored.compared}`,
    `lines compared, ${data.baseLabel} → ${data.currentLabel}\n${data.scored.material} moved ${data.thresholdText} or more — the denominator\n${data.scored.excluded} below the threshold, excluded entirely\n${data.revenueRule}; ${data.orgExclusions}`);
  tile(s, W - M - 5.9, 1.6, 5.9, 4.2, "The evidence bar", "Forecast change",
    "A record counts only if it explains why the plan moved between these two versions — not why actuals differed from a plan, and not a standing rule.\nIt must cover the node's slice and this window.\nA story read off the numbers does not count.");
}

// 3–6. Risks / Opportunities with explanations
function movementSlides(direction, titleFn) {
  const rows = data.movements.filter((m) => m.direction === direction).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  paginate(rows, 6).forEach((chunk, i, all) => {
    const s = pptx.addSlide();
    const top = rows[0];
    const title = titleFn(rows, top) + (all.length > 1 ? `  (${i + 1}/${all.length})` : "");
    frame(s, title, { footer: `Ranked by exposure · Grade = cause, amount, recurrence, owner/timing · "Next time" is the one thing that would make it ★★★★` });
    const body = chunk.map((m) => [
      cell(`${m.code} ${clip(m.name, 28)}`, { bold: true }),
      cell(money(m.base), { align: "right" }), cell(money(m.current), { align: "right" }),
      cell(money(m.delta), { align: "right", bold: true, color: dirColor(m.direction) }),
      cell(m.timing ? "Timing" : "Level"),
      cell(m.explanation ? clip(m.explanation, 150) : "No explanation on record", m.explanation ? {} : { bold: true, color: C.risk }),
      cell(m.by || "—"), cell(stars(m.grade)), cell(m.grade ? clip(m.nextTime, 60) : "—", { color: C.muted }),
    ]);
    table(s, 1.55, ["Line", data.baseLabel, data.currentLabel, "Δ", "Kind", "Explanation", "By", "Grade", "Next time"],
      body, [2.1, 1.0, 1.0, 1.05, 0.7, 3.4, 1.35, 0.75, 0.78]);
  });
}
movementSlides("risk", (rows, top) => top && !top.explanation
  ? `${money(Math.abs(top.delta))} of risk has no reason on record`
  : `Risks — costs that went up, and what people said`);
movementSlides("opportunity", () => `Saving opportunities — and whether we can count on them`);

// 7. Records that look like explanations and aren't
if (data.notExplanations.length) {
  const s = pptx.addSlide();
  frame(s, "Records that look like explanations and are not", { dark: true, footer: "Adjacent, partial or actuals-variance records do not lift a line out of the gaps" });
  const items = data.notExplanations.slice(0, 4);
  const w = (W - 2 * M - 0.3 * (items.length - 1)) / items.length;
  items.forEach((n, i) => {
    const x = M + i * (w + 0.3);
    s.addShape(pptx.ShapeType.roundRect, { x, y: 1.7, w, h: 3.6, fill: { color: "2A2724" }, line: { color: "3A3733", width: 0.75 }, rectRadius: 0.08 });
    s.addText(`${n.code} ${n.name}`, { x: x + 0.2, y: 1.85, w: w - 0.4, h: 0.5, fontFace: F.sans, fontSize: 14, bold: true, color: "C9A78E" });
    s.addText(`${clip(n.covers, 160)}\n\n${clip(n.whyNot, 160)}`, { x: x + 0.2, y: 2.4, w: w - 0.4, h: 2.8, fontFace: F.sans, fontSize: 12, color: "E6E2DA", valign: "top" });
  });
  if (data.notExplanations.length > 4) s.addText(`+${data.notExplanations.length - 4} more, listed in the appendix`, { x: M, y: 5.5, w: 8, h: 0.4, fontFace: F.sans, fontSize: 11, color: "A9A49B" });
}

// 8. Recommended actions — always last, always one page
{
  const s = pptx.addSlide();
  const acts = data.movements.filter((m) => m.actionType !== "none").sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const shown = acts.slice(0, 12), rest = acts.length - shown.length;
  const definitive = data.movements.filter((m) => m.actionType === "none").length;
  frame(s, "Recommended actions, largest exposure first", {
    footer: `Every ask goes out as a tracked question, auto-routed by the line's dimensions — say the word and they're sent. ${definitive} explanation${definitive === 1 ? "" : "s"} need nothing further.${rest > 0 ? ` +${rest} smaller items in the appendix.` : ""}`,
  });
  const body = shown.map((m, i) => [
    cell(String(i + 1)), cell(`${m.code} ${clip(m.name, 30)}`, { bold: true }),
    cell(money(m.delta), { align: "right", color: dirColor(m.direction), bold: true }),
    cell(clip(m.action, 110)), cell(clip(m.soThat, 110), { color: C.accent }),
    cell(m.actionType === "gap" ? "Unexplained gap" : "Follow-up on explained"),
  ]);
  table(s, 1.5, ["#", "Line", "Exposure", "Action", "So that", "Type"], body, [0.4, 2.6, 1.1, 3.6, 3.0, 1.43], { fontSize: 9 });
}

pptx.writeFile({ fileName: `Forecast Quality Report - ${data.currentLabel}.pptx` }).then((f) => console.log("wrote", f));

/* CAMP Digital — Enterprise CTV deck. Design-only redesign; copy is verbatim from source. */
const Pptx = require("pptxgenjs");
const P = __dirname;

const pres = new Pptx();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.author = "CAMP Digital";
pres.company = "CAMP Digital";
pres.title = "Enterprise TV Advertising. Direct Publisher Costs. Zero Markups.";

/* ---------------------------------------------------------------- system */
const C = {
  ink: "0E1F1A",
  green: "006A49",
  greenMid: "0B5E44",
  greenDeep: "052C21",
  greenPanel: "0A3A2C",
  mint: "7FDCBB",
  mintSoft: "B2E5D5",
  mintPale: "EDF7F3",
  tint: "F3F7F5",
  line: "DDE7E3",
  lineDark: "16513D",
  body: "56645F",
  bodyDark: "9FC4B7",
  white: "FFFFFF",
};

const F = "Arial";
const M = 0.8; // page margin
const W = 13.333;
const CW = W - M * 2; // 11.733

const T = {
  title: { fontFace: F, fontSize: 27, bold: true, color: C.ink, lineSpacingMultiple: 1.06, charSpacing: -0.4 },
  titleDark: { fontFace: F, fontSize: 27, bold: true, color: C.white, lineSpacingMultiple: 1.06, charSpacing: -0.4 },
  cardH: { fontFace: F, fontSize: 13, bold: true, color: C.ink, lineSpacingMultiple: 1.1 },
  cardHDark: { fontFace: F, fontSize: 13, bold: true, color: C.white, lineSpacingMultiple: 1.1 },
  body: { fontFace: F, fontSize: 10.5, color: C.body, lineSpacingMultiple: 1.32 },
  bodyDark: { fontFace: F, fontSize: 10.5, color: C.bodyDark, lineSpacingMultiple: 1.32 },
  micro: { fontFace: F, fontSize: 8.5, color: C.body, charSpacing: 1.4, bold: true },
};

const shadowSoft = () => ({ type: "outer", color: "0E1F1A", blur: 14, offset: 3, angle: 90, opacity: 0.07 });

/* wordmark: CAMP (bold) DIGITAL (letterspaced light) — swap for the official logo file later */
function wordmark(s, x, y, size, dark, w) {
  s.addText(
    [
      { text: "CAMP", options: { bold: true, charSpacing: size * 0.09, color: dark ? C.white : C.ink } },
      { text: "  DIGITAL", options: { bold: false, charSpacing: size * 0.22, color: dark ? C.mint : C.green } },
    ],
    { x, y, w: w || 2.6, h: size / 40, fontFace: F, fontSize: size, align: "left", valign: "middle", margin: 0 }
  );
}

function footer(s, n, dark, numOnDark) {
  wordmark(s, M, 6.92, 8, dark, 2.2);
  s.addText(String(n).padStart(2, "0"), {
    x: W - M - 1.2, y: 6.92, w: 1.2, h: 0.2, align: "right", valign: "middle", margin: 0,
    fontFace: F, fontSize: 8, bold: true, charSpacing: 1.2, color: dark || numOnDark ? C.mint : C.green,
  });
}

function title(s, text, opts = {}) {
  s.addText(text, {
    x: opts.x ?? M, y: opts.y ?? 0.72, w: opts.w ?? 10.9, h: opts.h ?? 1.06,
    valign: "top", margin: 0, ...(opts.dark ? T.titleDark : T.title),
    ...(opts.fontSize ? { fontSize: opts.fontSize } : {}),
  });
}

/* light card on white */
function card(s, x, y, w, h, variant) {
  const v = variant || "plain";
  const fill = v === "accent" ? C.mintPale : v === "muted" ? C.tint : C.white;
  const line = v === "accent" ? C.B2 || "CDE8DE" : C.line;
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: fill },
    line: { color: line, width: 0.75 },
    shadow: v === "plain" ? shadowSoft() : undefined,
  });
}

function darkCard(s, x, y, w, h) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: C.greenPanel },
    line: { color: C.lineDark, width: 0.75 },
  });
}

/* closing statement band */
function band(s, x, y, w, h, text, dark) {
  s.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.05,
    fill: { color: dark ? C.greenPanel : C.green },
    line: { color: dark ? C.lineDark : C.green, width: 0.75 },
  });
  s.addText(text, {
    x: x + 0.34, y: y + 0.06, w: w - 0.68, h: h - 0.12, valign: "middle", margin: 0,
    fontFace: F, fontSize: 11, italic: true, color: C.white, lineSpacingMultiple: 1.24,
  });
}

/* icon inside a circular chip */
function iconChip(s, x, y, d, icon, tone) {
  const dark = tone === "dark";
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: d, h: d,
    fill: { color: dark ? C.greenPanel : C.mintPale },
    line: { color: dark ? C.mint : "CDE8DE", width: 0.9 },
  });
  const p = d * 0.3;
  s.addImage({ path: `${P}/ico/${icon}-${dark ? "mint" : "green"}.png`, x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
}

/* small marker used for list rows */
function dot(s, x, y, tone) {
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: 0.085, h: 0.085,
    fill: { color: tone === "dark" ? C.mint : C.green }, line: { type: "none" },
  });
}

/* ================================================================ SLIDE 1 */
{
  const s = pres.addSlide();
  s.background = { color: C.greenDeep };
  s.addImage({ path: `${P}/assets/cover_tv.jpg`, x: 8.03, y: 0, w: 5.303, h: 7.5, sizing: { type: "cover", w: 5.303, h: 7.5 } });

  wordmark(s, M, 0.62, 13, true, 3.6);

  s.addText("Enterprise TV Advertising. Direct Publisher Costs. Zero Markups.", {
    x: M, y: 1.5, w: 6.5, h: 2.0, valign: "top", margin: 0,
    fontFace: F, fontSize: 33, bold: true, color: C.white, lineSpacingMultiple: 1.04, charSpacing: -0.6,
  });
  s.addText("How CAMP Digital connects big-screen streaming to booked home service calls.", {
    x: M, y: 3.62, w: 6.2, h: 0.6, valign: "top", margin: 0,
    fontFace: F, fontSize: 13, color: C.mintSoft, lineSpacingMultiple: 1.3,
  });

  const cards = [
    { x: M, y: 4.42, w: 3.14, t: "Google Premier Partner", b: "Institutional-grade access to top-tier streaming inventory" },
    { x: M + 3.36, y: 4.42, w: 3.14, t: "Microsoft Elite Partner", b: "Direct publisher costs — zero media markups added" },
  ];
  cards.forEach((c) => {
    darkCard(s, c.x, c.y, c.w, 1.38);
    s.addText(c.t, { x: c.x + 0.26, y: c.y + 0.22, w: c.w - 0.52, h: 0.24, margin: 0, valign: "top", ...T.cardHDark, fontSize: 12 });
    s.addText(c.b, { x: c.x + 0.26, y: c.y + 0.58, w: c.w - 0.52, h: 0.66, margin: 0, valign: "top", ...T.bodyDark, fontSize: 10 });
  });

  darkCard(s, M, 5.98, 6.5, 0.96);
  s.addText("Platform Agnostic", { x: M + 0.26, y: 6.16, w: 5.98, h: 0.24, margin: 0, valign: "top", ...T.cardHDark, fontSize: 12 });
  s.addText("Strategy tailored to your trade, territory, and goals", { x: M + 0.26, y: 6.48, w: 5.98, h: 0.3, margin: 0, valign: "top", ...T.bodyDark, fontSize: 10 });
}

/* ================================================================ SLIDE 2 */
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  title(s, "Homeowners Left Cable. Traditional Agencies Kept the Markups.", { w: 10.2, y: 0.75 });

  const cy = 2.4, ch = 1.92, cw = 5.7;
  // legacy — muted
  card(s, M, cy, cw, ch, "muted");
  s.addText("The Legacy Programmatic Model", { x: M + 0.36, y: cy + 0.36, w: cw - 0.72, h: 0.28, margin: 0, valign: "top", ...T.cardH, color: C.body });
  s.addText(
    [
      { text: "Multiple middlemen — platforms like The Trade Desk or Xander — add hidden tech fees, inflating CPMs to " },
      { text: "$25–$35+", options: { bold: true, color: C.ink } },
      { text: " with black-box reporting and zero transparency on where your dollars land." },
    ],
    { x: M + 0.36, y: cy + 0.86, w: cw - 0.72, h: 1.4, margin: 0, valign: "top", ...T.body, fontSize: 11 }
  );

  // CAMP — accent
  const rx = M + cw + 0.33;
  card(s, rx, cy, cw, ch, "accent");
  s.addText("The CAMP Digital Direct Model", { x: rx + 0.36, y: cy + 0.36, w: cw - 0.72, h: 0.28, margin: 0, valign: "top", ...T.cardH, color: C.green });
  s.addText(
    [
      { text: "Direct buying through Google and Microsoft Ads engines. " },
      { text: "100% of your media spend", options: { bold: true, color: C.green } },
      { text: " goes straight to buying impressions inside your local service territory — no intermediaries, no hidden fees." },
    ],
    { x: rx + 0.36, y: cy + 0.86, w: cw - 0.72, h: 1.4, margin: 0, valign: "top", ...T.body, fontSize: 11, color: "3F5B51" }
  );

  band(s, M, 5.2, CW, 1.0, "Your local homeowners spend their evenings on streaming platforms — not cable. Your advertising strategy should follow them there.");
  footer(s, 2);
}

/* ================================================================ SLIDE 3 */
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  s.addImage({ path: `${P}/assets/tv_room.jpg`, x: 8.03, y: 0, w: 5.303, h: 7.5, sizing: { type: "cover", w: 5.303, h: 7.5 } });

  title(s, "The Same Big-Screen Placements as National Brands. Zero Middlemen.", { w: 6.6, y: 0.72, h: 1.6, fontSize: 25 });

  const cw = 3.14, cy = 2.55, ch = 1.98;
  card(s, M, cy, cw, ch);
  s.addText("Premium Publisher Access", { x: M + 0.28, y: cy + 0.3, w: cw - 0.56, h: 0.32, margin: 0, valign: "top", ...T.cardH, fontSize: 12.5 });
  s.addText("Full-screen, non-skippable living-room TV ads across Max, Hulu, Disney+, Roku, Paramount+, YouTube TV, Peacock, Samsung TV+, Sling, and Tubi.", {
    x: M + 0.28, y: cy + 0.76, w: cw - 0.56, h: 1.5, margin: 0, valign: "top", ...T.body, fontSize: 10,
  });

  const rx = M + cw + 0.32;
  card(s, rx, cy, cw, ch);
  s.addText("Zip-Code & DMA Precision", { x: rx + 0.28, y: cy + 0.3, w: cw - 0.56, h: 0.32, margin: 0, valign: "top", ...T.cardH, fontSize: 12.5 });
  s.addText("Hyper-local targeting ensures your ads only air inside your active plumbing, HVAC, or electrical service footprint.", {
    x: rx + 0.28, y: cy + 0.76, w: cw - 0.56, h: 1.3, margin: 0, valign: "top", ...T.body, fontSize: 10,
  });

  card(s, M, 4.88, 6.6, 1.28, "accent");
  s.addText("Unbiased Platform Access", { x: M + 0.28, y: 5.12, w: 6.04, h: 0.26, margin: 0, valign: "top", ...T.cardH, fontSize: 12.5, color: C.green });
  s.addText("Agnostic placement across both Microsoft Advertising and Google Ads networks — we optimize for your results, not platform commissions.", {
    x: M + 0.28, y: 5.46, w: 6.04, h: 0.5, margin: 0, valign: "top", ...T.body, fontSize: 10, color: "3F5B51",
  });
  footer(s, 3, false, true);
}

/* ================================================================ SLIDE 4 */
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  title(s, "Two Premier Partner Networks. Tailored to Your Specific Goals.", { w: 10.4, y: 0.72 });

  const tx = M, tw = CW;
  const c1 = tx + 0.32, c2 = tx + 2.9, c3 = tx + 7.35;
  const cw2 = 4.1, cw3 = 4.1;
  const hy = 2.1, hh = 0.6;

  s.addShape(pres.ShapeType.roundRect, { x: tx, y: hy, w: tw, h: hh, rectRadius: 0.05, fill: { color: C.green }, line: { type: "none" } });
  s.addText("Microsoft Advertising CTV", { x: c2, y: hy, w: cw2, h: hh, valign: "middle", margin: 0, fontFace: F, fontSize: 12, bold: true, color: C.white });
  s.addText("Google Ads / YouTube Premier CTV", { x: c3, y: hy, w: cw3, h: hh, valign: "middle", margin: 0, fontFace: F, fontSize: 12, bold: true, color: C.white });

  const rows = [
    ["Inventory", "Roku, Max, Hulu, Disney+, Paramount+, Pluto TV, Sling", "YouTube Select, YouTube TV, Disney+, Max, Paramount+, Hulu"],
    ["Core Advantage", "In-market intent signals, LinkedIn household demographics, CPCV bidding", "Real-time Google Search & Maps intent, unified frequency capping"],
    ["Synergy", "IMBR retargets TV viewers across Bing Search, Display & Native", "Direct integration with Demand Gen and Google Search PPC"],
  ];
  const rh = 1.02;
  rows.forEach((r, i) => {
    const y = hy + hh + i * rh;
    s.addShape(pres.ShapeType.rect, { x: tx, y, w: tw, h: rh, fill: { color: i % 2 === 1 ? C.tint : C.white }, line: { type: "none" } });
    if (i > 0) s.addShape(pres.ShapeType.rect, { x: tx, y, w: tw, h: 0.008, fill: { color: C.line }, line: { type: "none" } });
    s.addText(r[0], { x: c1, y, w: 2.3, h: rh, valign: "middle", margin: 0, fontFace: F, fontSize: 11.5, bold: true, color: C.ink });
    s.addText(r[1], { x: c2, y, w: cw2, h: rh, valign: "middle", margin: 0, ...T.body, fontSize: 10.5 });
    s.addText(r[2], { x: c3, y, w: cw3, h: rh, valign: "middle", margin: 0, ...T.body, fontSize: 10.5 });
  });
  s.addShape(pres.ShapeType.rect, { x: tx, y: hy + hh + rows.length * rh, w: tw, h: 0.008, fill: { color: C.line }, line: { type: "none" } });

  band(s, M, 5.9, CW, 0.86, "Because CAMP is platform-agnostic, we build the strategy around your business model — not around a single ecosystem's incentives.");
  footer(s, 4);
}

/* ================================================================ SLIDE 5 */
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  title(s, "Reaching Homeowners Before Emergency Breakdowns Happen.", { w: 10.4, y: 0.72 });

  // process figure (rebuilt natively from the source graphic; labels unchanged)
  const px = M, py = 2.2, pw = 7.35, ph = 3.94;
  s.addShape(pres.ShapeType.roundRect, { x: px, y: py, w: pw, h: ph, rectRadius: 0.05, fill: { color: C.tint }, line: { color: C.line, width: 0.75 } });

  const steps = [
    { icon: "search", label: "Active Homeowner Search" },
    { icon: "bars", label: "Intent Signal Captured" },
    { icon: "tv", label: "Living Room TV Ad" },
  ];
  const d = 1.36;
  const gap = 0.7;
  const totalW = steps.length * d + (steps.length - 1) * gap;
  const sx = px + (pw - totalW) / 2;
  const cy = py + (ph - (d + 0.24 + 0.62)) / 2;
  steps.forEach((st, i) => {
    const x = sx + i * (d + gap);
    s.addShape(pres.ShapeType.ellipse, { x, y: cy, w: d, h: d, fill: { color: C.white }, line: { color: C.green, width: 2.25 }, shadow: shadowSoft() });
    s.addImage({ path: `${P}/ico/${st.icon}-green.png`, x: x + d * 0.31, y: cy + d * 0.31, w: d * 0.38, h: d * 0.38 });
    s.addText(st.label, {
      x: x - 0.28, y: cy + d + 0.24, w: d + 0.56, h: 0.62, align: "center", valign: "top", margin: 0,
      fontFace: F, fontSize: 11, bold: true, color: C.ink, lineSpacingMultiple: 1.16,
    });
    if (i < steps.length - 1) {
      const ax = x + d + (gap - 0.26) / 2;
      s.addImage({ path: `${P}/ico/arrow-green.png`, x: ax, y: cy + d / 2 - 0.13, w: 0.26, h: 0.26 });
    }
  });

  // right column
  const rx = 8.55, rw = 3.98;
  s.addText("Beyond Basic IP Targeting", { x: rx, y: 2.42, w: rw, h: 0.28, margin: 0, valign: "top", ...T.cardH, color: C.green });
  s.addText(
    [
      { text: "Traditional TV buys target generic age groups. CAMP targets " },
      { text: "active home service intent", options: { bold: true, color: C.ink } },
      { text: " — households already searching for solutions online." },
    ],
    { x: rx, y: 2.82, w: rw, h: 1.2, margin: 0, valign: "top", ...T.body, fontSize: 10.5 }
  );
  s.addShape(pres.ShapeType.rect, { x: rx, y: 4.22, w: rw, h: 0.008, fill: { color: C.line }, line: { type: "none" } });
  s.addText("Pre-Need Brand Familiarity", { x: rx, y: 4.5, w: rw, h: 0.28, margin: 0, valign: "top", ...T.cardH, color: C.green });
  s.addText(
    [
      { text: "Build trust " },
      { text: "before", options: { bold: true, color: C.ink } },
      { text: " an emergency breakdown occurs. When a pipe bursts at midnight, your brand is the first name they call — because they've already seen you on TV." },
    ],
    { x: rx, y: 4.9, w: rw, h: 1.8, margin: 0, valign: "top", ...T.body, fontSize: 10.5 }
  );
  footer(s, 5);
}

/* ================================================================ SLIDE 6 */
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  title(s, "Building Brand Demand to Lower Your PPC Cost-Per-Lead.", { w: 10.4, y: 0.72 });

  const fx = M, fy = 1.96, fw = 6.1, fh = 4.66;
  s.addShape(pres.ShapeType.roundRect, { x: fx, y: fy, w: fw, h: fh, rectRadius: 0.05, fill: { color: C.tint }, line: { color: C.line, width: 0.75 } });
  const iw = 4.5, ih = iw * (1509 / 1596);
  s.addImage({ path: `${P}/assets/flywheel.png`, x: fx + (fw - iw) / 2, y: fy + (fh - ih) / 2, w: iw, h: ih });

  const rx = 7.44, rw = 5.09;
  s.addText("Search & TV Working Together", { x: rx, y: 2.3, w: rw, h: 0.28, margin: 0, valign: "top", ...T.cardH, color: C.green });
  s.addText("CTV creates top-of-mind trust. Search PPC captures the appointment when the repair is needed. Together, they compound your results.", {
    x: rx, y: 2.7, w: rw, h: 1.0, margin: 0, valign: "top", ...T.body, fontSize: 11,
  });
  s.addShape(pres.ShapeType.rect, { x: rx, y: 3.94, w: rw, h: 0.008, fill: { color: C.line }, line: { type: "none" } });
  s.addText("Cross-Channel Retargeting", { x: rx, y: 4.2, w: rw, h: 0.28, margin: 0, valign: "top", ...T.cardH, color: C.green });

  const items = [
    ["Microsoft IMBR:", " Retarget TV viewers with follow-up Search, Native, or Display ads"],
    ["Google Demand Gen:", " Re-engage warm streaming audiences across YouTube Shorts, Gmail, and Discover"],
  ];
  items.forEach((it, i) => {
    const y = 4.66 + i * 0.94;
    dot(s, rx + 0.03, y + 0.1, "light");
    s.addText(
      [
        { text: it[0], options: { bold: true, color: C.ink } },
        { text: it[1] },
      ],
      { x: rx + 0.28, y, w: rw - 0.28, h: 0.86, margin: 0, valign: "top", ...T.body, fontSize: 11 }
    );
  });
  footer(s, 6);
}

/* ================================================================ SLIDE 7 */
{
  const s = pres.addSlide();
  s.background = { color: C.greenDeep };
  s.addImage({ path: `${P}/assets/tech_home.jpg`, x: 0, y: 0, w: 5.1, h: 7.5, sizing: { type: "cover", w: 5.1, h: 7.5 } });

  const rx = 5.72, rw = 6.81;
  s.addText("Real-World Proof: High-Impact Local Reach at Unbeatable CPMs.", {
    x: rx, y: 0.8, w: rw, h: 1.2, valign: "top", margin: 0, ...T.titleDark, fontSize: 25,
  });

  s.addShape(pres.ShapeType.roundRect, { x: rx, y: 2.16, w: 4.06, h: 0.34, rectRadius: 0.14, fill: { color: C.greenPanel }, line: { color: C.lineDark, width: 0.75 } });
  s.addText("27-DAY ALPHA FLIGHT — PRONTO PLUMBING PILOT", {
    x: rx, y: 2.16, w: 4.06, h: 0.34, align: "center", valign: "middle", margin: 0,
    fontFace: F, fontSize: 8, bold: true, charSpacing: 0.7, color: C.mint,
  });

  const stats = [
    { n: "986K", l: "Targeted Impressions", s: "Delivered inside the core service territory" },
    { n: "$8.80", l: "CTV CPM", s: "vs. $15–$25 industry benchmark" },
    { n: "92.4%", l: "Big-Screen Spend", s: "Concentrated on living room connected TVs" },
    { n: "98.5%", l: "Geographic Precision", s: "Impressions delivered within the active service footprint" },
  ];
  const gx = [rx, rx + 3.53], gy = [2.86, 4.82], cwid = 3.28;
  stats.forEach((st, i) => {
    const x = gx[i % 2], y = gy[Math.floor(i / 2)];
    s.addText(st.n, { x, y, w: cwid, h: 0.72, valign: "top", margin: 0, fontFace: F, fontSize: 40, bold: true, color: C.mint, charSpacing: -1 });
    s.addText(st.l, { x, y: y + 0.76, w: cwid, h: 0.26, valign: "top", margin: 0, fontFace: F, fontSize: 12, bold: true, color: C.white });
    s.addText(st.s, { x, y: y + 1.06, w: cwid, h: 0.6, valign: "top", margin: 0, ...T.bodyDark, fontSize: 9.5 });
  });
  wordmark(s, rx, 6.92, 8, true, 2.2);
  s.addText("07", {
    x: W - M - 1.2, y: 6.92, w: 1.2, h: 0.2, align: "right", valign: "middle", margin: 0,
    fontFace: F, fontSize: 8, bold: true, charSpacing: 1.2, color: C.mint,
  });
}

/* ================================================================ SLIDE 8 */
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  title(s, "100% Working Media. Zero Hidden Tech Taxes.", { w: 10.4, y: 0.72 });

  const cy = 2.16, ch = 3.4, cw = 5.7;
  const left = ["Percentage-of-spend management fees (8%–15%)", "Hidden CPM markups layered on top of publisher rates", "Incentivized to grow your media spend, not your ROI", "Opaque reporting — you never see the real CPM"];
  const right = ["Net publisher CPMs — the exact rate charged by the ad exchange", "Flat monthly management fee with no media spend cut", "Low account minimums with no multi-month lock-in", "Complete spend visibility across every channel and placement"];

  card(s, M, cy, cw, ch, "muted");
  s.addText("Traditional Marked-Up Agency Model", { x: M + 0.36, y: cy + 0.36, w: cw - 0.72, h: 0.28, margin: 0, valign: "top", ...T.cardH, color: C.body });
  left.forEach((t, i) => {
    const y = cy + 0.9 + i * 0.6;
    s.addShape(pres.ShapeType.ellipse, { x: M + 0.4, y: y + 0.085, w: 0.09, h: 0.09, fill: { color: "A9B5B0" }, line: { type: "none" } });
    s.addText(t, { x: M + 0.68, y, w: cw - 1.04, h: 0.56, margin: 0, valign: "top", ...T.body, fontSize: 10.5 });
  });

  const rx = M + cw + 0.33;
  card(s, rx, cy, cw, ch, "accent");
  s.addText("CAMP Flat-Fee Transparent Model", { x: rx + 0.36, y: cy + 0.36, w: cw - 0.72, h: 0.28, margin: 0, valign: "top", ...T.cardH, color: C.green });
  right.forEach((t, i) => {
    const y = cy + 0.9 + i * 0.6;
    s.addImage({ path: `${P}/ico/check-green.png`, x: rx + 0.36, y: y + 0.03, w: 0.19, h: 0.19 });
    s.addText(t, { x: rx + 0.68, y, w: cw - 1.04, h: 0.56, margin: 0, valign: "top", ...T.body, fontSize: 10.5, color: "3F5B51" });
  });

  band(s, M, 5.8, CW, 0.9, "Our incentive is making your campaign work — not burning media budget to inflate a commission check.");
  footer(s, 8);
}

/* ================================================================ SLIDE 9 */
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  title(s, "Complete Reporting Built for Service Business Accountability.", { w: 10.4, y: 0.72 });

  const ix = M, iy = 2.16, iw = 6.5, ih = 4.0;
  s.addShape(pres.ShapeType.roundRect, { x: ix, y: iy, w: iw, h: ih, rectRadius: 0.06, fill: { color: C.tint }, line: { type: "none" } });
  s.addImage({ path: `${P}/assets/dashboard.jpg`, x: ix, y: iy, w: iw, h: ih, sizing: { type: "cover", w: iw, h: ih }, rounding: false });

  const rx = 7.62, rw = 4.91;
  const blocks = [
    ["Full Placement Visibility", "Detailed reporting on exact streaming networks — Hulu, Roku, Max, Tubi, and more — with CPMs and Video Completion Rates (VCR) broken out by placement."],
    ["Proactive Placement Filtering", "Continuous optimization excludes non-video display, mobile app clutter, and low-value gaming impressions — keeping 100% of spend on living room TV screens."],
    ["Search & Brand Lift Tracking", "Measure increases in branded search volume, direct website traffic, and view-through lead conversions."],
  ];
  blocks.forEach((b, i) => {
    const y = 2.16 + i * 1.62;
    s.addText(b[0], { x: rx, y, w: rw, h: 0.28, margin: 0, valign: "top", ...T.cardH, fontSize: 12.5, color: C.green });
    s.addText(b[1], { x: rx, y: y + 0.38, w: rw, h: 1.02, margin: 0, valign: "top", ...T.body, fontSize: 10.5 });
    if (i < blocks.length - 1) s.addShape(pres.ShapeType.rect, { x: rx, y: y + 1.44, w: rw, h: 0.008, fill: { color: C.line }, line: { type: "none" } });
  });
  footer(s, 9);
}

/* =============================================================== SLIDE 10 */
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  title(s, "Matching the Right Network to Your Local Market Goals.", { w: 10.4, y: 0.72 });

  const colW = 5.66, gutter = 0.41;
  const cols = [
    {
      x: M, label: "DEPLOY MICROSOFT ADS CTV WHEN…", mark: "ms",
      items: [
        ["bars", "Maximum Completed View Volume", "Cost Per Completed View (CPCV) bidding drives efficient full-watch delivery"],
        ["arrow", "Cross-Channel Retargeting", "Re-engage TV viewers across Bing Search and Display via Impression-Based Remarketing"],
        ["home", "Higher-Income Homeowner Targeting", "LinkedIn household demographics pinpoint specific residential ownership profiles"],
      ],
    },
    {
      x: M + colW + gutter, label: "DEPLOY GOOGLE PREMIER CTV WHEN…", mark: "g",
      items: [
        ["tv", "Living-Room Dominance", "YouTube TV and YouTube Select (top 1% channels) deliver premium connected TV reach"],
        ["layers", "Full Google Ecosystem Pairing", "Direct integration with Demand Gen, Google Maps, and Search PPC campaigns"],
        ["search", "Real-Time Search Intent", "Capture active Google searchers across local markets with unified frequency control"],
      ],
    },
  ];

  cols.forEach((col) => {
    s.addShape(pres.ShapeType.roundRect, { x: col.x, y: 2.1, w: colW, h: 0.5, rectRadius: 0.05, fill: { color: C.mintPale }, line: { color: "CDE8DE", width: 0.75 } });
    if (col.mark === "g") {
      s.addImage({ path: `${P}/assets/google_g.png`, x: col.x + 0.24, y: 2.26, w: 0.18, h: 0.18 });
    } else {
      const q = 0.082, g = 0.022, bx = col.x + 0.24, by = 2.264;
      const sq = [["F25022", 0, 0], ["7FBA00", 1, 0], ["00A4EF", 0, 1], ["FFB900", 1, 1]];
      sq.forEach(([cc, gx, gy]) => s.addShape(pres.ShapeType.rect, { x: bx + gx * (q + g), y: by + gy * (q + g), w: q, h: q, fill: { color: cc }, line: { type: "none" } }));
    }
    s.addText(col.label, { x: col.x + 0.56, y: 2.1, w: colW - 0.8, h: 0.5, valign: "middle", margin: 0, fontFace: F, fontSize: 9, bold: true, charSpacing: 1.1, color: C.green });

    col.items.forEach((it, i) => {
      const y = 3.02 + i * 1.3;
      iconChip(s, col.x, y - 0.02, 0.5, it[0], "light");
      s.addText(it[1], { x: col.x + 0.72, y: y + 0.02, w: colW - 0.72, h: 0.3, margin: 0, valign: "top", ...T.cardH, fontSize: 12 });
      s.addText(it[2], { x: col.x + 0.72, y: y + 0.36, w: colW - 0.72, h: 0.66, margin: 0, valign: "top", ...T.body, fontSize: 10.5 });
      if (i < col.items.length - 1) {
        s.addShape(pres.ShapeType.rect, { x: col.x, y: y + 1.1, w: colW, h: 0.008, fill: { color: C.line }, line: { type: "none" } });
      }
    });
  });
  footer(s, 10);
}

/* =============================================================== SLIDE 11 */
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  title(s, "From Market Analysis to Living Room Screens in 4 Steps.", { w: 10.4, y: 0.72 });

  const px = M, py = 2.14, pw = CW, ph = 2.92;
  s.addShape(pres.ShapeType.roundRect, { x: px, y: py, w: pw, h: ph, rectRadius: 0.05, fill: { color: C.tint }, line: { color: C.line, width: 0.75 } });

  const steps = [
    { icon: "map", label: "Service Audit" },
    { icon: "bars", label: "Inventory Check" },
    { icon: "video", label: "Creative Align" },
    { icon: "rocket", label: "Launch & Measure" },
  ];
  const d = 1.34, gap = 0.86;
  const totalW = steps.length * d + (steps.length - 1) * gap;
  const sx = px + (pw - totalW) / 2;
  const cy = py + (ph - (d + 0.26 + 0.36)) / 2;
  steps.forEach((st, i) => {
    const x = sx + i * (d + gap);
    s.addShape(pres.ShapeType.ellipse, { x, y: cy, w: d, h: d, fill: { color: C.white }, line: { color: C.green, width: 2.25 }, shadow: shadowSoft() });
    s.addImage({ path: `${P}/ico/${st.icon}-green.png`, x: x + d * 0.31, y: cy + d * 0.31, w: d * 0.38, h: d * 0.38 });
    s.addText(st.label, {
      x: x - 0.3, y: cy + d + 0.26, w: d + 0.6, h: 0.36, align: "center", valign: "top", margin: 0,
      fontFace: F, fontSize: 11.5, bold: true, color: C.ink,
    });
    if (i < steps.length - 1) {
      const ax = x + d + (gap - 0.28) / 2;
      s.addImage({ path: `${P}/ico/arrow-green.png`, x: ax, y: cy + d / 2 - 0.14, w: 0.28, h: 0.28 });
    }
  });

  band(s, M, 5.5, CW, 1.0, "If you have existing video creative, CAMP can validate your market's streaming inventory and launch a hyper-targeted campaign in days — no months-long production cycle required.");
  footer(s, 11);
}

/* =============================================================== SLIDE 12 */
{
  const s = pres.addSlide();
  s.background = { color: C.greenDeep };
  s.addImage({ path: `${P}/assets/couch.jpg`, x: 0, y: 0, w: 5.1, h: 7.5, sizing: { type: "cover", w: 5.1, h: 7.5 } });

  const rx = 5.72, rw = 6.81;
  s.addText("Ready to Own the Big Screen in Your Service Territory?", {
    x: rx, y: 0.8, w: rw, h: 1.1, valign: "top", margin: 0, ...T.titleDark, fontSize: 27,
  });
  s.addText(
    [
      { text: "Request a " },
      { text: "complimentary local CTV audit", options: { bold: true, color: C.mint } },
      { text: " — no commitment required. Here's what you'll receive:" },
    ],
    { x: rx, y: 2.06, w: rw, h: 0.6, valign: "top", margin: 0, ...T.bodyDark, fontSize: 11.5 }
  );

  const cw = 3.31;
  const twoUp = [
    { x: rx, icon: "pin", t: "Impression Forecast", b: "Real-time streaming volume for your exact service zip codes" },
    { x: rx + cw + 0.19, icon: "scale", t: "Platform Allocation", b: "Recommended Google vs. Microsoft mix for your trade and territory" },
  ];
  twoUp.forEach((c) => {
    darkCard(s, c.x, 2.72, cw, 1.7);
    iconChip(s, c.x + 0.28, 2.94, 0.42, c.icon, "dark");
    s.addText(c.t, { x: c.x + 0.28, y: 3.5, w: cw - 0.56, h: 0.26, margin: 0, valign: "top", ...T.cardHDark, fontSize: 12 });
    s.addText(c.b, { x: c.x + 0.28, y: 3.82, w: cw - 0.56, h: 0.52, margin: 0, valign: "top", ...T.bodyDark, fontSize: 10 });
  });

  darkCard(s, rx, 4.6, rw, 1.16);
  iconChip(s, rx + 0.28, 4.83, 0.42, "dollar", "dark");
  s.addText("Projected CPMs", { x: rx + 0.86, y: 4.86, w: rw - 1.14, h: 0.26, margin: 0, valign: "top", ...T.cardHDark, fontSize: 12 });
  s.addText("Expected local CPMs and completed view counts before you commit a dollar", {
    x: rx + 0.86, y: 5.16, w: rw - 1.14, h: 0.44, margin: 0, valign: "top", ...T.bodyDark, fontSize: 10,
  });

  s.addShape(pres.ShapeType.roundRect, { x: rx, y: 5.94, w: rw, h: 0.86, rectRadius: 0.05, fill: { color: C.mint }, line: { type: "none" } });
  s.addText("Contact your CAMP Digital strategist today to build your custom CTV strategy — and see your market's inventory before spending a single dollar.", {
    x: rx + 0.32, y: 5.99, w: rw - 0.64, h: 0.76, valign: "middle", margin: 0,
    fontFace: F, fontSize: 10.5, bold: true, color: C.greenDeep, lineSpacingMultiple: 1.24,
  });
  wordmark(s, rx, 6.98, 8, true, 2.2);
  s.addText("12", { x: W - M - 1.2, y: 6.98, w: 1.2, h: 0.2, align: "right", valign: "middle", margin: 0, fontFace: F, fontSize: 8, bold: true, charSpacing: 1.2, color: C.mint });
}

pres.writeFile({ fileName: `${P}/camp-ctv-redesigned.pptx` }).then((f) => console.log("wrote", f));

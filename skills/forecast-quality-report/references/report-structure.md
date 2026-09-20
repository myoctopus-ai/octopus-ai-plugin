# Report Structure

Slide-by-slide layout. Direction words everywhere: **Risk** (cost up, red) and **Opportunity** (cost down, green) — never a bare signed number as the only cue. Keep every slide readable at a glance; split a long table across slides rather than shrink it.

## Build from the template and the saved file

`references/deck-template.js` is a pptxgenjs generator with every slide below already laid out (grid, type sizes, colors, table geometry that fits). Copy it next to the saved comparison file, fill the `data` object at the top from `forecast-quality-<version>.json` and the scoring you did, run it, and check the render once. Do not write a new generator per run — the two most common defects (tables overflowing the slide, text colliding with the footer) are already solved in the template.

Data file shape the template expects: see the `data` object's comments in the template. Re-cutting at another threshold means regenerating that object from the same file and re-running — no connector call.

## Slide 1 — Cover: how the forecast moved

The version under review vs its baseline, FY / YTD / YTG, and the score — one screen a CFO can read without opening the rest.

| | Baseline (name) | Under review (name) | Change | Read |
| --- | --- | --- | --- | --- |
| **FY** | total | total | delta, delta % | Risk / Opportunity (colored) |
| **YTD** (Jan–closed month) | | | | |
| **YTG** (closed+1–Dec) | | | | |

- Below it: **Risks** — count and $ of material movements that went up; **Opportunities** — count and $ that went down. Two colored tiles.
- Then the headline score line: *"N of M material movements explained (x%) — $A of $B by exposure (y%). Explained risk: z%; explained opportunity: w%."*
- Footer facts: period, level, threshold, revenue excluded (or included), org exclusions applied, prepared date, and the score's change vs the previous run if there was one.

Color rule: red for Risk, green for Opportunity, neutral for unchanged. Never invert to "green = number went up".

## Slide 2 — What was scored

Scored set (lines compared, how many cleared the threshold, how many excluded, revenue excluded) and the evidence bar (insight / answered question / confirmed task; must cover the line's dimensions and window; a story read off the numbers does not count). Half a slide each.

## Slides 3–4 — Risks, with what people said

One table for risks, ranked by exposure. Columns: **Line · Baseline · Under review · Δ (red) · Timing/Level · Explanation · By · Grade · Next time**

- **Explanation** — the recorded reason in one or two sentences (the record's words, tightened), or **"No explanation on record"** in bold for a gap. If a question is already open on it: *"Asked <who>, <date> — no reply yet."*
- **By** — the human who explained it and how (insight / answered question), e.g. *"Dana K. — answered question, 10 Sep"*. Gaps: —.
- **Grade** — ★★★★ / ★★★ / ★★ / ★ against the four marks (see `scoring-playbook.md`). Gaps: —.
- **Next time** — one short clause: what would have made this a ★★★★ (*"add the monthly amount and whether it repeats"*). For a ★★★★: *"Model explanation."* Keep the tone as a colleague's note, not a review. Gaps: —.

Lead with the largest risk; if it is unexplained, the slide's title says so (*"$16M of risk has no reason on record"*).

## Slides 5–6 — Opportunities, with what people said

Same table, Δ in green, ranked by size. Frame the ask differently in the reader's head: a saving without a reason is a saving nobody can count on — the report wants the reason so the opportunity can be **locked in**, not just noticed.

## Slide 7 — Records that look like explanations and aren't

Cards, one per adjacent/partial/stale record: the line, what the record actually covers, and the one clause that says why it falls short (*"covers Herzliya; the movement is Property Rent Taxes"*). These lines stay in the gaps count. Two to four cards; if more, keep the largest by exposure and count the rest in a footer.

## Slide 8 — Recommended actions (always the last slide, always one page)

One table, largest exposure first, no more than ~12 rows; anything beyond lands as *"+N smaller items, listed in the appendix"* in the footer rather than a second page.

| # | Line | Exposure | Action | So that |
| --- | --- | --- | --- | --- |

- **Action** — *"Ask <owner/channel> for the driver"* (gap) · *"Ask <person> to add <missing mark>"* (thin explanation) · *"<forward step from the record>"* (explained, step pending) · *"No action — definitive"* (listed only if room; otherwise counted in the footer).
- **So that** — the payoff of the reason, in the org's terms: *"we can size the $2.6M labor risk before RF09"*, *"the $290K welfare saving can be booked, not hoped for"*. This column is what makes people answer; never leave it blank or generic.
- Footer: *"Every ask goes out as a tracked question, auto-routed by the line's dimensions — say the word and they're sent."* and the count of definitive explanations needing nothing.

## Appendix (optional, after the actions slide only as a data table, never as narrative)

Every material line: baseline, current, Δ, direction, timing/level, explained or gap, grade. Ties to the cover totals exactly.

## Writing rules for the risk/opportunity slides

- One idea per cell. The explanation cell is the record's words, cut to the driver; no lead-ins like "It appears that".
- Grades are earned from the four marks, not from how confident the prose sounds.
- "Next time" is one clause and always constructive. It names the missing mark, never the person's failing.
- Never describe a gap with a guessed reason. The whole point of the slide is that the cell is empty until a human fills it.

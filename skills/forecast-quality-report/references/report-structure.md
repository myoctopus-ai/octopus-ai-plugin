# Report Structure

Section-by-section layout for the Artifact. Direction words everywhere: **Risk** (cost up, red) and **Opportunity** (cost down, green) — never a bare signed number as the only cue. Keep every section readable without excessive scrolling; a long table can grow rather than shrink, but a page with many groups should stay navigable — use in-page anchors or a group nav (see `artifact-design`) rather than one undifferentiated scroll.

## Build from the artifact skills and the saved file

Load `artifact-design` before writing the page — it governs the page's title, color tokens, dark mode, layout and library rules; don't invent artifact conventions here. Load `dataviz` for the risk/opportunity color choices specifically, since this page encodes direction with color throughout. `references/report-data-shape.md` describes the data you should assemble from `forecast-quality-<version>.json` and your scoring before you start writing the page — fill that shape first, then build the page from it. Re-cutting at another threshold means regenerating that shape from the same saved file and re-rendering — no connector call.

## Section — Cover: how the forecast moved

The version under review vs its baseline, the four roll numbers, and the score — the first screen a CFO reads.

| | Baseline (name) | Under review (name) | Change | Read |
| --- | --- | --- | --- | --- |
| **FY** | total | total | delta, delta % | Risk / Opportunity (colored) |
| **Current Quarter** | | | | |
| **Current Month** | | | | |
| **YTG** (closed+1–Dec) | | | | |

- If the org reloads actuals into closed months, label Current Month (and Current Quarter, when it contains the closed month) as reload-affected rather than a clean forecast read (see SKILL.md, "Check how closed months behave").
- Org branding in the header: logo and accent color if `references/org-branding.md`'s fetch succeeded, neutral default otherwise — either way, state which happened in the footer.
- Below the table: **Risks** — count and $ of material movements that went up; **Opportunities** — count and $ that went down. Two colored tiles.
- Then the headline score line: *"N of M material movements explained (x%) — $A of $B by exposure (y%). Explained risk: z%; explained opportunity: w%."*
- Footer facts: period, dimension and level, threshold, revenue excluded (or included) and which method, org exclusions applied, prepared date, and the score's change vs the previous run if there was one.

Color rule: red for Risk, green for Opportunity, neutral for unchanged. Never invert to "green = number went up." The org's brand accent color is chrome only (header, nav, tiles) — it never substitutes for these semantic colors.

## Section — Org-wide variance summary

Before any group detail: total variance, split favorable/unfavorable, how much of each was explained (count and $), and:

- **Explained by whom** — a short ranked list of named people and how much they explained, e.g. *"Dana K. — 4 lines, $3.2M (2 risk, 2 opportunity)."* Sorted by amount.
- **Unexplained potential** — two sentences, one per direction: the size of unexplained risk framed as what could be mitigated if explained, and the size of unexplained opportunity framed as what could be locked in if explained (see SKILL.md, "Size the unexplained potential"). These are sentences, not just numbers in a table — they're the reason this section exists.

## Section — What was scored

Scored set (lines compared, how many cleared the threshold, how many excluded, revenue excluded) and the evidence bar (insight / answered question / confirmed task; must cover the line's dimensions and window; a story read off the numbers does not count). Name the report's dimension and level explicitly here (e.g. "grouped by department, level 1") — don't assume the reader remembers the scope check.

## Sections — One per group, ranked by total exposure

For each value of the report's chosen dimension (e.g. each department), ranked by that group's total exposure (|risk| + |opportunity|) descending, one section containing:

1. **Group header** — the group's name and its total exposure.
2. **That group's variance summary** — same shape as the org-wide one (total/fav/unfav, explained %, by-whom, unexplained potential), scoped to this group's lines only.
3. **Risks table** — ranked by exposure within the group. Columns: **Line · Baseline · Under review · Δ (red) · Timing/Level · Explanation · By · Grade · Next time**
   - **Explanation** — the recorded reason in one or two sentences (the record's words, tightened), or **"No explanation on record"** in bold for a gap. If a question is already open on it: *"Asked <who>, <date> — no reply yet."*
   - **By** — the human who explained it and how (insight / answered question), e.g. *"Dana K. — answered question, 10 Sep"*. Gaps: —.
   - **Grade** — ★★★★ / ★★★ / ★★ / ★ against the four marks (see `scoring-playbook.md`). Gaps: —.
   - **Next time** — one short clause: what would have made this a ★★★★ (*"add the monthly amount and whether it repeats"*). For a ★★★★: *"Model explanation."* Keep the tone as a colleague's note, not a review. Gaps: —.
   - Lead with the largest risk; if it is unexplained, the section's title says so (*"$16M of risk has no reason on record"*).
4. **Opportunities table** — same columns, Δ in green, ranked by size within the group. Frame the ask differently in the reader's head: a saving without a reason is a saving nobody can count on — the report wants the reason so the opportunity can be **locked in**, not just noticed.

A group with very few or no material movements can be a short section (e.g. a one-line "nothing material this group") rather than an empty table.

## Section — Records that look like explanations and aren't

One combined section for the whole report, after all group sections — not repeated per group, since this list is usually 2–4 items org-wide and splitting it would leave most groups with an empty subsection. Cards, one per adjacent/partial/stale record, tagged with the group it belongs to: the line, what the record actually covers, and the one clause that says why it falls short (*"covers Herzliya; the movement is Property Rent Taxes"*). These lines stay in the gaps count. Two to four cards; if more, keep the largest by exposure and count the rest in a footer.

## Section — Recommended actions (always last, one page)

One combined table across every group, largest exposure first, no more than ~12 rows; anything beyond lands as *"+N smaller items, listed in the appendix"* in the footer rather than a longer table.

| # | Group | Line | Exposure | Action | So that |
| --- | --- | --- | --- | --- | --- |

- **Action** — *"Ask <owner/channel> for the driver"* (gap) · *"Ask <person> to add <missing mark>"* (thin explanation) · *"<forward step from the record>"* (explained, step pending) · *"No action — definitive"* (listed only if room; otherwise counted in the footer).
- **So that** — the payoff of the reason, in the org's terms: *"we can size the $2.6M labor risk before RF09"*, *"the $290K welfare saving can be booked, not hoped for"*. This column is what makes people answer; never leave it blank or generic.
- Footer: *"Every ask goes out as a tracked question, auto-routed by the line's dimensions — say the word and they're sent."* and the count of definitive explanations needing nothing.

## Appendix (optional, after the actions section only as a data table, never as narrative)

Every material line: group, baseline, current, Δ, direction, timing/level, explained or gap, grade. Ties to the cover and group totals exactly.

## Writing rules for the risk/opportunity tables

- One idea per cell. The explanation cell is the record's words, cut to the driver; no lead-ins like "It appears that".
- Grades are earned from the four marks, not from how confident the prose sounds.
- "Next time" is one clause and always constructive. It names the missing mark, never the person's failing.
- Never describe a gap with a guessed reason. The whole point of the table is that the cell is empty until a human fills it.

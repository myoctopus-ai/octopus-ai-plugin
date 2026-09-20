---
name: version-comparison-report
description: >
  This skill should be used when the user asks to "compare forecasts",
  "forecast vs prior forecast", "what changed since last forecast",
  "roll vs roll", "compare budget to forecast", "compare working to
  actuals", "build the forecast change deck", "forecast movement report",
  or wants a recurring package comparing two or more versions of a
  number — forecast, budget, working, or actuals. Produces an exported
  deck or spreadsheet, not just a chat answer.
metadata:
  version: "0.2.0"
---

# Version Comparison Report

Build a report comparing two or more versions of the same figures — any mix of forecast rolls, budget, working, and actuals — and export it as a file the user can send on. Supersedes the old forecast-vs-forecast skill: same mechanics, generalized to any version pair or set instead of only forecast-vs-prior-forecast.

## Scope check

Before pulling data, confirm what the user has not already said:

1. **Which versions, two or more** — e.g. current forecast vs. last month's roll, or budget vs. working vs. actuals. Name each one exactly as the org labels it.
2. **Period covered** — remaining months of the year, a quarter, full year.
3. **Level of detail** — entity, cost center, account, or a specific hierarchy branch.
4. **Materiality threshold** — the amount above which a movement is worth calling out. If the user hasn't set one, propose one based on the size of the total and confirm it.
5. **RAG method** (see "RAG status" below) — default to materiality-tier based unless the user asks for fixed percentage bands or gives their own thresholds.
6. **Output format** — slide deck or spreadsheet.

Do not guess the version set. A comparison against the wrong baseline is worse than no report.

## Pull the data

Use the Octopus AI connector for all figures. List its tools first, then: resolve version names with the forecast legend, read org preferences (standing exclusions, applied via `exclude_dimensions`), and pull each version pair with the **version-comparison tool** — base, current, `months` = the period, `level` = the reporting level — which returns base / current / delta / delta % per node already rolled up. One call per adjacent pair; never both versions leaf-by-month. Do not fill gaps from memory or general knowledge. Actuals have no "version" of their own — pass `"actuals"` as one side; they are one comparison point, not a forecast/budget/working variant. Write the returned rows to a local file so a threshold or format change is a recompute, not a refetch.

Retrieve, at the agreed level, for every version in scope:

- Period-level values for every line
- The org's own display name for each version
- Any hierarchy metadata needed to roll lines up to parents

If a version label is numeric rather than descriptive, carry through whatever display name the connector returns rather than inventing one.

If the connector returns nothing for a version, stop and report that instead of substituting a nearby version.

## Build the comparison

For two versions: for each line compute prior value, current value, delta, delta %. For three or more versions: compute every line's value under each version, plus delta and delta % against the immediately preceding version in the list the user gave (not every pairwise combination, unless asked).

Then:

- **Rank by absolute delta**, not percentage. A 300% swing on a trivial line is noise; a 4% swing on the largest line is the story.
- **Separate timing from level.** A cost that moved between months but nets to zero across the period is a phasing change, not a level change. Call these out separately — they are the most commonly misread movements in this report.
- **Net the total.** The sum of the movements must reconcile to the change in the grand total. If it does not, find the missing lines before writing anything.
- **Flag new and dropped lines** — items present in one version and absent in another — in their own section.
- Apply materiality: surface every line above the threshold, and group the rest into a single "all other" row.

See `references/report-structure.md` for the section-by-section layout, the phasing-vs-level test, and the RAG status rules.

## RAG status

Every material line (and the grand total) gets a red/amber/green status. Two methods — pick per the scope check, default to the first:

- **Materiality-tier based (default)** — green = below the materiality threshold (immaterial). Amber = at or above the threshold but under 2x it. Red = at or above 2x the threshold. Uses the same threshold the materiality bucketing already uses, so a line is never "material" but green, or "all other" but red.
- **Fixed percentage bands** — green = |delta%| under 10%, amber = 10-25%, red = over 25%, regardless of absolute size. Only use this when the user asks for it, or gives their own band cutoffs — it ignores size, so a small line can flag red on a trivial dollar amount.

State which method was used in the report itself (a line under the headline, and a note in the appendix), so a reviewer isn't left guessing which rule produced a given color.

## Write the narrative

For each material movement, state what changed and by how much. Where the connector exposes an explanation, commentary, or driver for that line (search org memory for it — a recorded insight or answered question about that line/period), use it. Where none exists, say the driver is not recorded — never infer a business reason from the numbers alone.

Keep each callout to one or two sentences: line, direction, magnitude, RAG status, driver or "driver not recorded."

Verify every figure in the narrative against the retrieved data before export. Numbers that appear in prose but not in the underlying table are the main failure mode of this report.

## Export

Build the file with the matching document skill — the pptx skill for a deck, the xlsx skill for a spreadsheet.

Deck structure:

1. Headline: total movement, every version name in scope, period, RAG method used
2. Bridge from the first version's total to the last, largest movements first
3. One slide per material driver group (each showing its RAG status)
4. Phasing-only changes
5. New and dropped lines
6. Appendix: full line-level table with a RAG column

Spreadsheet structure: one tab with the full comparison (value per version, delta, delta %, RAG, flag), one tab with the material movements and their narrative.

Present the finished file. Offer to share it to ~~chat rather than doing so unprompted.

## Recurring runs

When the user runs this again in a later period, match the prior run's level of detail, materiality threshold, RAG method, and format unless they say otherwise, so the package stays comparable period over period.

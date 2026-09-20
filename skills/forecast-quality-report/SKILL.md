---
name: forecast-quality-report
description: >
  This skill should be used when the user asks "how good was this
  forecast", "score the forecast", "how well supported is this
  forecast", "how many of the changes since last roll were explained",
  "forecast quality report", "forecast accountability", or wants to know
  how much of a forecast's movement from the prior version is backed by
  a recorded reason versus left as an unexplained gap. Produces a
  branded report, grouped by the dimension you choose (account, entity,
  department, or whatever your org tracks) — risks and saving
  opportunities per group, who explained what and how well,
  risk-mitigation and savings-lock-in potential, and one page of
  actions — not just a chat answer.
metadata:
  version: "0.5.0"
---

# Forecast Quality Report

Score how well a forecast is supported: of the material cost movements between the version under review and the version it replaced, how many have a human explanation on record, how good those explanations are, and how much exposure is still an unexplained gap. Every movement is a **risk** (cost went up) or a **saving opportunity** (cost went down); every gap is a place a human hasn't yet said why. The report's job is to get more of those reasons recorded — it scores, then it asks.

## Scope check

Confirm only what the user has not already said:

1. **Which forecast is under review.** The baseline is never asked for — it is always the version this one replaced (see "Pick the baseline").
2. **Period covered** — default the rest of the year from the version's first forecast month; accept a quarter or full year if asked.
3. **Group by** — which dimension the whole report should be organized around. Discover what this org actually has, rather than assuming a fixed list: check org preferences and the connector's own tool descriptions (e.g. `search_insights`'s `dimensions` parameter typically enumerates the org's dimension keys — account, department, entity, vendor, site, studio are common, but do not hardcode this set as exhaustive). Default to **account** — today's only behavior — if the user doesn't care.
4. **Level within that dimension** — default the top level (for account, level 1: the children of the root — e.g. the Budget Tree's BT nodes). Accept a deeper level or a branch if asked. If the chosen dimension is not account, use `explore_dimension_hierarchy` against that dimension (`depth: 1` or `2`) to show what a level actually contains before the user commits — the same capped hierarchy call this skill already makes for account, now also usable up front for another dimension.
5. **Revenue is excluded by default.** This is a cost-quality report. Include revenue only if asked, and then score it on its own section with the favorable/unfavorable direction inverted. This exclusion is always applied against the **account** hierarchy specifically (see "Exclude revenue") — regardless of which dimension the report is grouped by. Grouping by department doesn't change what counts as revenue.

The materiality threshold is NOT confirmed here — it is proposed after the deltas exist (see "Set the threshold").

## The call order — and the cap on data

Use the Octopus AI connector. List its tools once, then follow this order; it is the whole data pull, and it stays small:

1. **Forecast legend** — resolve the version under review to its number and find the baseline (below).
2. **Org preferences** — read them before any figures. They carry the standing exclusions (entities, hierarchy nodes, accounts the org never scores), display conventions, and known data behaviours. Apply every exclusion via `exclude_dimensions`; name them on the cover.
3. **One comparison call** — the version-comparison tool with base = baseline, current = version under review, `months` = the report period, `dimension` = the scope check's chosen dimension, `level` = the scope check's chosen level, revenue and org exclusions applied. It returns one row per node with base, current, delta and delta %, already rolled up. This is the scored set. Do not pull both versions leaf-by-month and roll them up yourself — that is thousands of rows for nothing.
4. **Actuals by month** — one `query_data` call, transactions, `aggregate: "period"` is NOT what you want here; use `group_by: []` with months to find the **closed month**: the latest month with actuals. Do this before the next step — the roll numbers below depend on it.
5. **Cover totals, totals only** — same versions, `level` 0 (whole-org total, regardless of the report's grouping dimension):
   - **FY** — months = Jan–Dec
   - **Current Quarter** — the calendar quarter containing the closed month (this skill treats the fiscal year as Jan–Dec throughout; quarter = the 3-month block containing the closed month)
   - **Current Month** — the closed month only
   - **YTG** — closed month + 1 through Dec
   If the version-comparison tool can return monthly-granularity rows in one call, prefer a single totals-only call and derive all four numbers by summing months client-side — check the schema, don't assume. Otherwise these are up to four small level-0 calls; still bounded and cheap. There is no YTD line — it is not part of this report.
6. **Hierarchy, only if needed** — `explore_dimension_hierarchy` with `depth: 1` or `2` to name a branch or check a node, for either the report's chosen dimension (scope check) or the account hierarchy (revenue exclusion). Never `scope: "tree"` without `depth`.

Write the comparison rows to a local file (`forecast-quality-<version>.json`) as soon as they arrive. Every later step — threshold, scoring, re-cuts, the report — reads that file. A threshold change is a recompute, never a refetch.

## Pick the baseline

Always the prior version — the roll this one replaced — never a user-chosen pair:

- From the legend, the baseline is the largest loaded forecast number below the reviewed one for the same year, skipping Working. If the comparison call errors with "not loaded", take the next number down. If the version under review is the first roll of the year, the baseline is Budget.
- State the pair on the cover. Do not ask "which prior?" — the answer is defined, and asking invites a wrong baseline that makes the score meaningless.

## Exclude revenue

Two ways, in order:

1. `exclude_account_types: ["income"]` (or whatever the org's type vocabulary is — the tool's error lists it).
2. If the org has no account types set, exclude the hierarchy's revenue node instead: `exclude_dimensions: {"account": ["<revenue rollup code, e.g. BT3>"]}`. Find it with `explore_dimension_hierarchy` at `depth: 1` — it is the top-level node whose name says revenue/income.

Say on the cover which method was used.

## Check how closed months behave

Before computing the roll numbers, search org memory (dimensions or topics, dated) and org preferences for how this org treats closed months. Some orgs reload actuals into closed months on every roll — then a delta between two rolls on a line that includes the closed month is mostly an artefact of the reload, not a forecast decision. Because the closed month now sits inside **Current Month** (always) and **Current Quarter** (whenever the quarter contains it), if the org does this:

- Label those cover lines as reload-affected — shown, but flagged, not read as a clean forecast decision (e.g. "Current Month — actuals reload, not scored").
- YTG is unaffected (it starts the month after the closed month) and is never labeled this way.
- Say so in the cover footer, with the record that told you.

If nothing on file says either way, show all four roll numbers plainly with no caveat.

## Set the threshold — after you see the distribution

From the saved comparison file, count the movements at three candidate thresholds (e.g. $100K / $250K / $500K, scaled to the total) and show the user the counts and the exposure each captures. Then propose one and confirm it. A threshold confirmed before the deltas exist is guesswork; the same report has had 10 lines at $100K and 10 at $250K.

Immaterial lines are outside the score in both directions.

## Find the material movements

From the file: every node at or above the threshold. Classify each:

- **Risk** — cost went **up** (unfavorable). Red.
- **Saving opportunity** — cost went **down** (favorable). Green.
- **Timing vs level** — if a node's months are in the file (or one extra `query_data` per material node, `aggregate: "month"`), a move that nets to ~zero across the period is timing. Score it, but label it, so nobody reads it as a real cut or overrun.

Every material movement also carries the group it belongs to — the value of the report's chosen dimension for that node (e.g. its department, or its entity). Never present a movement as just a signed number. The reader should see Risk or Opportunity every time.

## Gather the human explanations

For each material node, look for a recorded human reason. Two tools, both filtered by the node's dimensions (pass the rollup code — the tools expand it) and the window between the two versions:

- **Org memory** (`search_insights`) — insights and discussion. Use the structured fields on each result: `dimensions` (does it bind to this node's slice?), `year` / `forecast_number` (is it about this version?), `kind` (`variance_alert` is about an actuals variance; `user_taught` is a rule or explanation a person gave), `author`, `created_at`. Decide coverage from those fields, not from reading the prose first.
- **Questions asked** (`search_tasks`) — who asked, who answered, the reply, and any insight the answer was captured into. An `answered` or `resolved` question **is** a human explanation; an `asked` one is a gap that already has a question in flight (say so — don't ask it twice).

A movement is **explained** only when a record names its driver and covers its dimensions and period **and explains a forecast change** — not an actuals variance, not a standing rule (see the evidence table in `references/scoring-playbook.md`; this distinction decided most "looks like an explanation" cases). Adjacent, partial or stale records do not count — list them separately as "looks like an explanation but isn't", and say specifically why. Never explain a movement from the shape of the numbers.

## Grade each explanation

Every explanation gets a quality grade against four marks — cause named, quantified, one-time vs recurring stated, owner or timing given — and **one** coaching line on what would make it stronger next time (`references/scoring-playbook.md`, "Explanation quality"). Name the person, credit what they did well, say the one thing to add. One line. Not a paragraph.

## Compute the score

Compute all of the following **org-wide**, for the top-of-report variance summary, and again **per group** (per dimension value), for that group's own section:

- **Count score** — explained material movements ÷ total material movements.
- **Magnitude score** — |delta| of explained movements ÷ |delta| of all material movements.
- **Explained risk vs explained opportunity** — the two magnitudes split by direction.
- **Explained by whom** — a rollup of who explained how much: for each named person, the count and $ amount of material movements they explained, split by risk vs. opportunity, and a note of how (insight, answered question). Sort by amount descending. Normalize a person's name consistently before aggregating (e.g. don't let "Dana K." and "Dana Kaplan" split into two rows for the same person) — today's per-line `by` field already names the person; this just sums it.

Report all of them. A good count score with the largest risk unexplained is not a good forecast.

## Size the unexplained potential

For every gap — org-wide and per group — compute:

- **Unexplained risk** — the sum of |delta| across unexplained risk movements. State it as what's at stake if it stays unexplained: *"$X of risk has no reason on record — if explained, this exposure could be mitigated before it lands."*
- **Unexplained opportunity** — the sum of |delta| across unexplained opportunity movements. State it as the upside on the table: *"$Y of savings are unconfirmed — if locked in, they can be booked with confidence."*

These are first-class sentences in the variance summary (both org-wide and per group), not just a clause buried in the actions table — the goal is that a reader sees the size of what's still unknown before they see any individual line.

## Derive the actions

One action per material movement, all landing on a single closing section, combined across every group:

- **Unexplained gap** → ask the line's owner for the reason — a tracked question, auto-routed by the node's dimensions. Phrase it as what the reason would let the org do: *"to size this risk"*, *"to lock in this saving"*. Largest exposure first.
- **Explained, forward step in the record** → that step, as the record states it (closely paraphrased, never embellished).
- **Explained, thin explanation** → ask the same person for the missing mark (the amount, the recurrence, the owner) — a short follow-up, credited to them.
- **Explained and definitive** → "No action — explanation is definitive." Expected and correct; do not manufacture a follow-up.

Every ask says what a fuller reason buys. Each action row also carries its group, since the table now spans every group.

## Fetch org branding

Before building the report, try to style it with the organization's own logo and color instead of a generic default — see `references/org-branding.md` for the full recipe and its fallback. This is purely cosmetic: it must never block, slow, or change anything about the scoring above. If the domain lookup tool isn't available yet, or the fetch fails for any reason, use the neutral default and say so plainly in the footer — never guess.

## Build the report

Always a report Artifact (not a slide deck). Load the `artifact-design` skill before writing the page, follow `references/report-structure.md` for the section layout, and fill the shape described in `references/report-data-shape.md` from the saved comparison file and the scoring you did. For the risk/opportunity color choices specifically, the `dataviz` skill governs — this is a color-encoded dashboard-shaped page, and risk=red/opportunity=green must stay legible in both light and dark and never be overridden by the org's brand color (see the color-role rule in `references/org-branding.md`).

Order: cover with the roll numbers (FY / Current Quarter / Current Month / YTG) and org branding in the header, then the org-wide variance summary (total/favorable/unfavorable, explained %, by-whom, unexplained potential), then what was scored (naming the chosen dimension/level explicitly), then one section per group — ranked by that group's total exposure — each with its own variance summary and risk/opportunity detail, then the records that don't count (one combined section for the whole report, not repeated per group), then exactly one combined page of recommended actions at the end, spanning every group. Answer inline only when the user asks for a bare score.

Offer to send the tracked questions from the actions page — only with the user's go-ahead — and offer to share the Artifact rather than doing so unprompted.

## Recurring runs

Next roll, keep the same dimension, level, threshold, revenue treatment and closed-month rule so scores compare roll over roll, and note the score's movement on the cover.

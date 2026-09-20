---
name: forecast-quality-report
description: >
  This skill should be used when the user asks "how good was this
  forecast", "score the forecast", "how well supported is this
  forecast", "how many of the changes since last roll were explained",
  "forecast quality report", "forecast accountability", or wants to know
  how much of a forecast's movement from the prior version is backed by
  a recorded reason versus left as an unexplained gap. Produces a scored
  deck — risks and saving opportunities, who explained what and how
  well, and one page of actions — not just a chat answer.
metadata:
  version: "0.4.0"
---

# Forecast Quality Report

Score how well a forecast is supported: of the material cost movements between the version under review and the version it replaced, how many have a human explanation on record, how good those explanations are, and how much exposure is still an unexplained gap. Every movement is a **risk** (cost went up) or a **saving opportunity** (cost went down); every gap is a place a human hasn't yet said why. The report's job is to get more of those reasons recorded — it scores, then it asks.

## Scope check

Confirm only what the user has not already said:

1. **Which forecast is under review.** The baseline is never asked for — it is always the version this one replaced (see "Pick the baseline").
2. **Period covered** — default the rest of the year from the version's first forecast month; accept a quarter or full year if asked.
3. **Level of detail** — default the top reporting level of the org's primary account hierarchy (level 1: the children of the root — e.g. the Budget Tree's BT nodes). Accept a deeper level or a branch if asked.
4. **Revenue is excluded by default.** This is a cost-quality report. Include revenue only if asked, and then score it on its own slide with the favorable/unfavorable direction inverted.

The materiality threshold is NOT confirmed here — it is proposed after the deltas exist (see "Set the threshold").

## The call order — and the cap on data

Use the Octopus AI connector. List its tools once, then follow this order; it is the whole data pull, and it stays small:

1. **Forecast legend** — resolve the version under review to its number and find the baseline (below).
2. **Org preferences** — read them before any figures. They carry the standing exclusions (entities, hierarchy nodes, accounts the org never scores), display conventions, and known data behaviours. Apply every exclusion via `exclude_dimensions`; name them on the cover.
3. **One comparison call** — the version-comparison tool with base = baseline, current = version under review, `months` = the report period, `dimension` = account, `level` = the reporting level, revenue and org exclusions applied. It returns one row per node with base, current, delta and delta %, already rolled up. This is the scored set. Do not pull both versions leaf-by-month and roll them up yourself — that is thousands of rows for nothing.
4. **Two more comparison calls, totals only** — same versions, `level` 0 (or no level, whole-org total), once for Jan–closed month and once for closed+1–Dec, for the cover's YTD / YTG lines. FY is their sum.
5. **Actuals by month** — one `query_data` call, transactions, `aggregate: "period"` is NOT what you want here; use `group_by: []` with months to find the **closed month**: the latest month with actuals.
6. **Hierarchy, only if needed** — `explore_dimension_hierarchy` with `depth: 1` or `2` to name a branch or check a node. Never `scope: "tree"` without `depth`.

Write the comparison rows to a local file (`forecast-quality-<version>.json`) as soon as they arrive. Every later step — threshold, scoring, re-cuts, the deck — reads that file. A threshold change is a recompute, never a refetch.

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

Before computing YTD, search org memory (dimensions or topics, dated) and org preferences for how this org treats closed months. Some orgs reload actuals into closed months on every roll — then a YTD delta between two rolls is mostly an artefact of the reload, not a forecast decision. If the org does this:

- Score only the forecast months (YTG); show YTD on the cover but label it "actuals reload — not scored".
- Say so in the cover footer, with the record that told you.

If nothing on file says either way, score YTG and say YTD is included as-is.

## Set the threshold — after you see the distribution

From the saved comparison file, count the movements at three candidate thresholds (e.g. $100K / $250K / $500K, scaled to the total) and show the user the counts and the exposure each captures. Then propose one and confirm it. A threshold confirmed before the deltas exist is guesswork; the same report has had 10 lines at $100K and 10 at $250K.

Immaterial lines are outside the score in both directions.

## Find the material movements

From the file: every node at or above the threshold. Classify each:

- **Risk** — cost went **up** (unfavorable). Red.
- **Saving opportunity** — cost went **down** (favorable). Green.
- **Timing vs level** — if a node's months are in the file (or one extra `query_data` per material node, `aggregate: "month"`), a move that nets to ~zero across the period is timing. Score it, but label it, so nobody reads it as a real cut or overrun.

Never present a movement as just a signed number. The reader should see Risk or Opportunity every time.

## Gather the human explanations

For each material node, look for a recorded human reason. Two tools, both filtered by the node's dimensions (pass the rollup code — the tools expand it) and the window between the two versions:

- **Org memory** (`search_insights`) — insights and discussion. Use the structured fields on each result: `dimensions` (does it bind to this node's slice?), `year` / `forecast_number` (is it about this version?), `kind` (`variance_alert` is about an actuals variance; `user_taught` is a rule or explanation a person gave), `author`, `created_at`. Decide coverage from those fields, not from reading the prose first.
- **Questions asked** (`search_tasks`) — who asked, who answered, the reply, and any insight the answer was captured into. An `answered` or `resolved` question **is** a human explanation; an `asked` one is a gap that already has a question in flight (say so — don't ask it twice).

A movement is **explained** only when a record names its driver and covers its dimensions and period **and explains a forecast change** — not an actuals variance, not a standing rule (see the evidence table in `references/scoring-playbook.md`; this distinction decided most "looks like an explanation" cases). Adjacent, partial or stale records do not count — list them separately as "looks like an explanation but isn't", and say specifically why. Never explain a movement from the shape of the numbers.

## Grade each explanation

Every explanation gets a quality grade against four marks — cause named, quantified, one-time vs recurring stated, owner or timing given — and **one** coaching line on what would make it stronger next time (`references/scoring-playbook.md`, "Explanation quality"). Name the person, credit what they did well, say the one thing to add. One line. Not a paragraph.

## Compute the score

- **Count score** — explained material movements ÷ total material movements.
- **Magnitude score** — |delta| of explained movements ÷ |delta| of all material movements.
- **Explained risk vs explained opportunity** — the two magnitudes split by direction.

Report all of them. A good count score with the largest risk unexplained is not a good forecast.

## Derive the actions

One action per material movement, all landing on a single closing slide:

- **Unexplained gap** → ask the line's owner for the reason — a tracked question, auto-routed by the node's dimensions. Phrase it as what the reason would let the org do: *"to size this risk"*, *"to lock in this saving"*. Largest exposure first.
- **Explained, forward step in the record** → that step, as the record states it (closely paraphrased, never embellished).
- **Explained, thin explanation** → ask the same person for the missing mark (the amount, the recurrence, the owner) — a short follow-up, credited to them.
- **Explained and definitive** → "No action — explanation is definitive." Expected and correct; do not manufacture a follow-up.

Every ask says what a fuller reason buys.

## Build the deck

Always a deck (pptx skill), from the saved file, laid out per `references/report-structure.md`, starting from `references/deck-template.js` — fill its data object rather than writing a generator from scratch. Cover with the FY / YTD / YTG version summary color-coded by risk and opportunity, then the score, then risks and opportunities with their explanations and grades, then the records that don't count, then exactly one page of recommended actions at the end. Answer inline only when the user asks for a bare score.

Offer to send the tracked questions from the actions page — only with the user's go-ahead — and offer to share the deck to ~~chat rather than doing so unprompted.

## Recurring runs

Next roll, keep the same level, threshold, revenue treatment and closed-month rule so scores compare roll over roll, and note the score's movement on the cover.

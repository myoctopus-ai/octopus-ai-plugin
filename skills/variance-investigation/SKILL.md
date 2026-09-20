---
name: variance-investigation
description: >
  This skill should be used when the user asks "why is this over budget",
  "investigate this variance", "what's driving the overspend", "drill into
  this account", "explain the gap vs plan", "root cause this number", or
  points at a budget-vs-actual gap and wants it explained. Walks from the
  headline variance down to transaction-level cause — can also produce a
  shareable one-page branded report on request.
metadata:
  version: "0.2.0"
---

# Variance Investigation

Take a budget-vs-actual gap and work down to the cause, tier by tier. Stop at the tier where the cause is established — do not run every tier by default.

## Frame the variance

Establish before pulling anything:

1. **What is being compared** — actual vs. budget, vs. forecast, or vs. prior period. These give different answers to "why."
2. **Scope** — account, cost center, entity, period.
3. **Materiality** — the threshold above which this is worth investigating.

Confirm the comparison basis explicitly. An "overspend" against budget is often on-plan against the current forecast, and reporting the wrong one wastes the reviewer's time.

## Tier 1 — Confirm the variance is real

Pull the headline figures from the Octopus AI connector. List its available tools first and choose those exposing actuals, plan values, and hierarchy — do not assume tool names.

Check before investigating further:

- Is the period closed, or are actuals partial? Partial-period actuals against a full-period plan produce a variance that is an artifact.
- Does the account roll into the parent correctly, and is the parent showing the same direction of variance?
- Are there known standing exclusions for this account or cost center? If the user's organization maintains an exclusion list, apply it and say which lines were excluded.
- Are NULLs being counted as zero anywhere in the comparison?

If the variance disappears under any of these checks, report that and stop. A variance that is a data artifact is a finding.

## Tier 2 — Locate it in the hierarchy

Decompose the variance one level down. At each level, rank children by contribution to the parent variance and follow only the material branches. Report at each step:

- Which children carry the variance
- Whether it is concentrated in one child or spread across many

Concentrated variance points to a specific event. Spread variance points to a rate, allocation, or driver change, and the investigation should shift to what is common across the children rather than drilling further into each.

## Tier 3 — Split price, volume, and timing

Before reading transactions, classify the variance:

- **Timing** — the spend was expected but landed in a different period. Check whether the year-to-date or full-year position is on plan while the month is not.
- **Volume** — more units, headcount, or activity than planned at roughly the planned rate.
- **Rate** — planned quantity at a different unit cost.
- **Scope** — something new that was not in the plan at all.

Most variances that reach a CFO are timing. Testing for it first avoids a full transaction drill that concludes nothing moved.

## Tier 4 — Transaction level

Only when tiers 1–3 have not settled the cause. Retrieve transactions for the account and period, then:

- Rank by absolute amount and check whether a handful of entries explain most of the gap
- Look for entries that are unusual for this account: one-off vendors, manual journals, reclasses, accruals and their reversals, duplicate postings
- Check whether a reclass moved spend between accounts — this shows as offsetting variances in two places and is not a real overspend

See `references/investigation-playbook.md` for the checks at each tier and the evidence each conclusion requires.

## Report the finding

Structure the answer:

1. **Headline** — account, period, variance amount and %, comparison basis
2. **Cause** — one or two sentences
3. **Evidence** — the specific figures, entries, or structural facts supporting it
4. **Classification** — timing / volume / rate / scope / data artifact
5. **Recurring or one-time** — and if recurring, the run-rate implication for the remaining periods
6. **What remains unexplained** — the residual amount, stated as a number

Always state the residual. A conclusion that accounts for 60% of a gap is useful; one that implies it explained all of it when it did not is misleading.

Where the data does not establish a business reason, say so and name who or what would have it — the cost center owner, the vendor contract, the journal preparer. Do not infer intent from the numbers.

Offer to post the finding to ~~chat rather than doing so unprompted.

## Sharing as a report

This skill is built to be fast — most questions resolve at tier 1 or 2, and a chat answer is the right output for that. Don't fetch branding or build anything by default. Only offer: *"Want this as a one-page branded report to share?"* If the user says yes, fetch org branding (`references/org-branding.md`, same recipe as the other reporting skills) and load `artifact-design` to build a short Artifact covering the same six points above (headline, cause, evidence, classification, recurring/one-time, residual) as a page rather than a chat reply. Skip the branding fetch and the Artifact entirely unless the user has actually asked to formalize the finding.

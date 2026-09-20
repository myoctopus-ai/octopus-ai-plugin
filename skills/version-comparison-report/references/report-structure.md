# Report Structure

Detailed layout for the version comparison package.

## Phasing vs. level test

For every line with a material delta, sum the deltas across all periods in scope:

- **Sum ≈ 0, individual months non-zero** → phasing. The spend moved in time; the total commitment is unchanged. Report in the phasing section with the months it moved from and to.
- **Sum materially non-zero** → level change. The figure itself moved up or down. Report as a driver.
- **Sum non-zero AND large month-to-month swings** → both. Split the line: state the level change, then note the re-phasing separately.

Misclassifying phasing as a level change is the most common error in this report and the one reviewers catch fastest.

## RAG status rules

Compute per material line, and for the grand total:

**Materiality-tier based (default)**

- `abs(delta) < materiality_threshold` → **green**
- `materiality_threshold <= abs(delta) < 2 * materiality_threshold` → **amber**
- `abs(delta) >= 2 * materiality_threshold` → **red**

**Fixed percentage bands** (only when asked for, or given custom cutoffs)

- `abs(delta%) < 10%` → **green**
- `10% <= abs(delta%) < 25%` → **amber**
- `abs(delta%) >= 25%` → **red**

A line with no prior value (new) or no current value (dropped) has no percentage to band — flag it in the new/dropped section instead of forcing a RAG color.

## Bridge section

Waterfall from the first version's total to the last (see the `dataviz` skill for how to render it — colors, accessibility, direction cues):

- Start bar: first version's total
- One bar per material driver group, in descending absolute size
- One bar for "all other" (everything below threshold, netted)
- End bar: last version's total

The bars must sum exactly to the difference between start and end. If they do not, lines are missing from the pull.

## Driver section (one per material group)

- Line or group name and its position in the hierarchy
- Value under each version in scope, delta, delta %
- RAG status
- Period profile: which months moved
- Driver: the recorded explanation, or "not recorded"
- Whether it is recurring or one-time, if the data says

## New and dropped lines

Two short tables:

- **New** — line, value, which version it first appears in
- **Dropped** — line, last value it held, which version it disappears after

Dropped lines with material prior values deserve a call-out: they are often an omission rather than a decision.

## Appendix table

Every line in scope, regardless of materiality, with value per version, delta, delta %, RAG, and a flag column (level / phasing / new / dropped / immaterial). This is what a reviewer will check the headline numbers against, so it must tie to the bridge exactly.

## Common data traps

- **NULL handling** — a line missing from one version is not a zero unless the data says so. Treat absent as "dropped" or "new", not as a value of zero, and never let NULLs silently drop rows from a total.
- **Sign conventions** — confirm whether costs are stored positive or negative before computing deltas; a sign flip inverts the entire narrative.
- **Currency and units** — if lines come in mixed currencies or units, do not sum them. Report per currency or convert only with a rate the user supplies.
- **Duplicate rollup** — check that a parent line is not being summed alongside its own children.
- **Actuals have no version** — when actuals are one of the comparison points, they represent a single fixed snapshot, not "a version" that could itself have a prior/current pair.

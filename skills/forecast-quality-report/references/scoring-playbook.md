# Scoring Playbook

Evidence standard for marking a material movement "explained", how to handle edge cases, and how to grade the explanations you find.

## Evidence standard per source type

| Source | Counts as explained when | Does NOT count |
| --- | --- | --- |
| Insight | An insight on file names a cause for this slice, covering the window between the two versions | An insight about the same account/department but a different period, or a different slice |
| Answered question | A tracked question about this slice has a human reply that names a driver (state `answered` or `resolved`) | A question that is `asked` with no reply yet — that is a gap with an ask already in flight; a reply that names no driver ("checking on it") |
| Task driver | A driver hypothesis on a task was confirmed by a human, not merely proposed | An unconfirmed/unjudged driver guess — treat as no record |

Take the most specific and most recent record when several exist. Conflicting records: report both, mark the line explained-but-disputed, and make the action "reconcile".

## What the record explains — the decisive test

A record must explain the **forecast change** between the two versions. Two other kinds of record look the same in prose and are not:

| Record explains… | Looks like | Verdict |
| --- | --- | --- |
| **A forecast change** — "we cut the Aug–Dec Oracle line because the licence was prepaid in July" | the movement | **Explained** |
| **An actuals variance** — "August actuals overshot the forecast because the Poland event landed early" (`kind: variance_alert`, or a reply to a variance question) | the same account, the same months | **Not this movement.** It explains why actuals differed from a plan, not why the plan moved between versions — unless the record ALSO says the next roll was changed because of it |
| **A standing rule** — "welfare accounts are managed as one basket", "BT60012 carries no forecast by design" (`kind: user_taught`, `category: business_rule` / `plan_behavior`) | context | **Not an explanation.** A rule can make a movement *expected*; it does not say what changed this roll. It CAN disqualify a movement (a $0-by-policy line that now carries a figure is a finding) |

Use the structured fields to decide before reading prose: `kind`, `category`, `forecast_number` (a record filed under the baseline version explains that version, not the change to the next one), `dimensions`. This test decided most of the "looks like an explanation but isn't" cards in real runs — apply it to every candidate.

## Closed months

Some orgs reload actuals into closed months on every roll. There, a YTD delta between two versions is the reload, not a decision — nothing a human "explained" — so it is shown on the cover and left out of the score. Check org memory and preferences for this behaviour before scoring YTD (SKILL.md, "Check how closed months behave").

## Matching a record to a movement

A record must cover the SAME dimensions (or an ancestor of them) and a period overlapping the two versions. A record for a different cost center, or a period outside the window, does not explain this movement however similar the topic. Say specifically why it falls short ("covers Herzliya; the movement is Property Rent Taxes") and keep the line in the gaps.

## Partial coverage

When a record explains part of a movement, the remainder is still a gap: report the explained portion, the residual amount, and score the line by the majority. State the residual — never round a partial to "resolved".

## Direction

Costs: up = **Risk** (unfavorable), down = **Opportunity** (favorable). Revenue (only when the user includes it): inverted. Timing moves keep their direction label but carry "timing" so they aren't read as level changes.

## Explanation quality — the four marks

Grade every explanation on record, one star per mark met:

| Mark | Met when the record… | Typical "next time" |
| --- | --- | --- |
| **Cause** | names the specific event or decision (a vendor, a contract, a hire, a policy), not a category | "name the event, not the account" |
| **Amount** | states how much of the movement it covers (a figure or "all of it") | "add the amount it explains" |
| **Recurrence** | says whether it is one-time, timing, or a new run-rate | "say if this repeats next roll" |
| **Owner or timing** | names who owns it or when it lands/reverses | "add who owns it / which month" |

- ★★★★ — all four. Write "Model explanation." in Next time.
- ★★★ — three; the missing one is the Next time.
- ★★ — two; Next time names the more important of the two missing (Amount or Recurrence first).
- ★ — cause only, or a hedge ("likely", "probably") with nothing firm. Next time: the firmest single addition.

Grading rules:
- Grade what is written, not what you infer. A confident tone earns nothing; a stated figure does.
- Carry a hedge through: a "likely offset elsewhere" is graded as unconfirmed on that mark and the action asks to confirm it.
- The coaching line is one clause, constructive, and names the mark — never the person. It is the same line whether the explainer is the CFO or an analyst.
- Credit first: when the explanation is ★★★ or better, the By cell or the coaching line acknowledges it plainly ("clear and quantified").

## What NOT to do

- Do not infer a driver from the numbers (a headcount ramp implied by a trend is a hypothesis, not a record) — it belongs in the gaps with the ask, never in explained.
- Do not let one well-explained large line make a slice look scored — report at the line level the scope names.
- Do not drop a movement that has no matching record — every material movement appears as explained or as a gap; there is no third bucket.
- Do not soften a gap. "No explanation on record" is the correct, useful cell — it is what gets a reason written.

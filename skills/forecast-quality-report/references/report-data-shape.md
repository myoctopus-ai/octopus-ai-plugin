# Report Data Shape

Assemble this shape from `forecast-quality-<version>.json` and your scoring before you write the Artifact page. This is a data spec, not executable code — there is no generator to run; build the HTML page directly from this once it's filled, per `references/report-structure.md` and the `artifact-design` skill.

```jsonc
{
  "org": "Acme Corp",
  "currentLabel": "RF08FN",           // version under review (legend name)
  "baseLabel": "RF07FN",              // the version it replaced
  "period": "Aug–Dec 2026",
  "dimension": "department",          // the report's chosen grouping dimension
  "level": "level 1",                 // level within that dimension, or a branch name
  "thresholdText": "$250,000",
  "revenueRule": "Revenue excluded (BT3)",
  "orgExclusions": "excl. Superplay, BT26, BT99, BT100",
  "closedMonthRule": "Current Month flagged — org reloads actuals into closed months",
  "preparedOn": "20 Sep 2026",
  "scoreChangeText": "",              // e.g. "Count score +9 pts vs RF07FN"

  "branding": {
    "logoUrl": null,                  // null when unavailable — see references/org-branding.md
    "accentColor": null,              // null when unavailable; chrome only, never a risk/opportunity color
    "brandFallbackUsed": true         // true whenever branding.logoUrl/accentColor are null
  },

  // Cover table. One row per roll number — no YTD row.
  "cover": [
    // { label: "FY" | "Current Quarter" | "Current Month" | "YTG",
    //   base, current, delta, deltaPct, direction: "risk" | "opportunity" | "flat",
    //   reloadFlag: bool }               // true only for Current Month/Quarter when closed-month reload applies
  ],

  "risksTotal": { "count": 0, "amount": 0 },
  "opportunitiesTotal": { "count": 0, "amount": 0 },

  // Org-wide. Same shape reused per group below.
  "summary": {
    "score": { "countExplained": 0, "countTotal": 0, "magExplained": 0, "magTotal": 0, "riskPct": 0, "oppPct": 0 },
    "explainedBy": [
      // { person, count, amount, riskAmount, oppAmount, methodMix }  sorted by amount desc
    ],
    "unexplainedRiskAmount": 0,
    "unexplainedOpportunityAmount": 0
  },

  "scored": { "compared": 0, "material": 0, "excluded": 0 },

  // One entry per group value of the chosen dimension, ordered by totalExposure desc.
  "groups": [
    // {
    //   dimensionValue: "IT",
    //   totalExposure: 0,                 // |risk| + |opportunity| for this group
    //   summary: { ...same shape as top-level summary, scoped to this group... },
    //   risks: [ ...movement rows, direction "risk"... ],
    //   opportunities: [ ...movement rows, direction "opportunity"... ]
    // }
  ],

  // Movement row shape, used inside groups[].risks / groups[].opportunities:
  // { code, name, group, base, current, delta, direction, timing: bool,
  //   explanation, by, grade, nextTime, action, soThat, actionType: "gap"|"followup"|"none" }

  // Adjacent / partial / stale records that don't count. One combined list for the whole report.
  "notExplanations": [
    // { code, name, group, covers, whyNot }
  ]
}
```

Notes:

- `cover` replaces the old FY/YTD/YTG rows with FY/Current Quarter/Current Month/YTG — there is no YTD entry anywhere in this shape.
- `groups` replaces a single flat `movements` array. The combined actions table and appendix in `report-structure.md` are built by flattening `groups[].risks` + `groups[].opportunities` back together, sorted by `|delta|`, each row carrying its `group`.
- `summary.explainedBy` and the two `unexplained*Amount` fields are new relative to prior versions of this report — see SKILL.md's "Compute the score" and "Size the unexplained potential".
- `branding` feeds the page header only; see `references/org-branding.md` for how to populate it and the color-role rule that keeps it out of the risk/opportunity color coding.

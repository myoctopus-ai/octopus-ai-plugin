# Octopus

Claude Code plugin marketplace for Octopus AI. Connects Claude to Octopus AI — a conversational connection plus a set of direct, deterministic tools for data and messaging — and adds three FP&A workflows on top.

## Install

```bash
claude plugin marketplace add https://github.com/myoctopus-ai/octopus-ai-plugin.git
claude plugin install octopus-ai
```

## Update

```bash
claude plugin update octopus-ai
```

## What's included

| Component | Name | Purpose |
| --- | --- | --- |
| MCP server | Octopus AI | Connection to Octopus AI at `https://app.myoctopus.ai/mcp` |
| Tool | Ask Octopus | Conversational access to Octopus AI, with your existing permissions, actions and history |
| Tool | Get logo | The Octopus AI logo (hosted URL + inline SVG) for embedding in decks and reports |
| Tool | Explore dimension hierarchy | List a dimension's hierarchies, or walk one's node tree (a node's immediate children, or the full subtree) |
| Tool | Get user/org preferences | Read the stored exclusions, visibility rules, and display settings for you and your organization |
| Tool | Search insights | Look up org memory — insights and discussion — by business slice, person, topic, channel, or date range (structured filters only, at least one required) |
| Tool | Get forecast legend | The organization's forecast-version numbers and their display names (version names vary by org) |
| Tool | Query data | Plan or transaction figures for a business slice, grouped or (transactions) row-level — takes forecast version numbers, not names |
| Tool | List channels and users | Who and where a question or message could go |
| Tool | Send a question | A tracked ask to an explicit channel/person, or auto-routed by business slice |
| Tool | Question status | Which sent questions are answered versus still open |
| Tool | Search questions asked | The questions asked in a date window or about a business slice — who asked, who answered, the reply, and the insight it became |
| Skill | Version Comparison Report | Compares two or more versions — forecast, budget, working, actuals — with a red/amber/green status per line, and exports a deck or spreadsheet |
| Skill | Forecast Quality Report | Scores a forecast against the version it replaced: cost risks and saving opportunities, which have a human explanation on record (by whom, how good), which are unexplained gaps, and one page of actions to get the missing reasons |
| Skill | Variance Investigation | Works a budget-vs-actual gap from headline down to transaction-level cause |

Every tool above is read-only except "Send a question."

## Setup

Installing the plugin adds the Octopus AI connector. Sign in when prompted — it uses an OAuth sign-in flow, so there is no API key to configure and no environment variables to set.

Confirm the connection by asking Claude what Octopus AI data is available before running a skill or tool.

## Usage

**Version comparison** — trigger with phrases like:

- "Compare the current forecast to last month's roll"
- "What changed since the prior forecast?"
- "Compare budget to working for Q4"
- "Build the forecast change deck"

Claude will confirm which versions, the period, the level of detail, the materiality threshold, the RAG method, and whether you want a deck or a spreadsheet, then produce the file.

**Forecast quality** — trigger with phrases like:

- "How good was this forecast?"
- "How many of the changes since last roll were actually explained?"
- "Score this roll's forecast quality"

Claude confirms the forecast under review, period, level and materiality threshold (the baseline is always the version it replaced; revenue is excluded unless asked), then builds a deck: a cover with the FY / YTD / YTG movement color-coded by risk and saving opportunity, the score, every material movement with its recorded explanation, who gave it and how well it was explained, the records that only look like explanations, and one closing page of actions — each tied to what a fuller reason would let the org do.

**Variance investigation** — trigger with phrases like:

- "Why is this account over budget?"
- "Investigate the variance in this cost center"
- "Drill into what's driving the overspend"

Claude will confirm the comparison basis and materiality, then work down through validity checks, hierarchy decomposition, price/volume/timing tests, and — only if needed — transaction review. It reports the cause, the evidence behind it, and any amount left unexplained.

**Direct tools** — Claude can also use the tools above on their own, without a skill, whenever a request is a plain lookup rather than a report: "what departments roll up under IT?", "what are my saved preferences?", "has anyone explained the marketing overspend?", "pull Q3 actuals by vendor", "who's in the #fpa-it-spend channel?", "ask finance ops about the late accrual", "did anyone answer that headcount question?".

## Customization

All three skills reference a chat tool generically as `~~chat` for sharing finished output. See `CONNECTORS.md` for the categories used and how placeholders resolve to whatever tools you have connected.

## Releasing a change

Edit the plugin's files, bump `.claude-plugin/plugin.json`'s `version`, commit, and push to `main`. Customers pick it up on their next `claude plugin update octopus-ai`.

## Version

0.2.0

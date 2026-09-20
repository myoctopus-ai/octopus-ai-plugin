# Org Branding

<!-- CANONICAL COPY — duplicated byte-for-byte into version-comparison-report/references/org-branding.md
     and variance-investigation/references/org-branding.md. If you change this file, propagate the
     change to those two copies as well; there is no build step that does it for you. -->

How to style a report Artifact with the organization's own logo and color instead of a generic look, and what to do when that isn't possible. This is purely cosmetic — it must never block, slow down, or change the substance of the report. If anything here fails, fall back and keep going.

## The recipe

1. **Check for the domain tool.** Look for `get_org_domain` in the connector's tool list. It is a recent addition and may not exist yet on an older connector or before it has been deployed — treat its absence as a normal, expected case, not an error. If it isn't there, skip straight to the fallback below.
2. **Call it.** No arguments. It returns the org's domain (e.g. `"acmecorp.com"`) or null.
3. **Null or empty** → fallback.
4. **Fetch the homepage.** One `WebFetch` of `https://<domain>`, short timeout, one attempt — do not retry, do not crawl beyond the homepage. Look for, at most:
   - a logo: an `og:image` meta tag, an `<img>` with "logo" in its `class`/`alt`/`src`, an apple-touch-icon, or a favicon, in that preference order
   - one accent color: a `theme-color` meta tag, or a prominent CSS custom property / header background color if one is easy to find
5. **Validate before trusting it.** Discard anything that fails to load, returns a non-2xx status, or is a degenerate image (e.g. a 1×1 tracking pixel or a generic placeholder). A confident-looking guess that turns out wrong is worse than the neutral fallback — when in doubt, fall back.
6. **Any failure at any step → fallback.** Use the artifact's neutral default styling. Say so plainly, once, in the report's footer — e.g. *"Styled with default colors — organization branding unavailable."* This mirrors how these reports already name which method was used for other judgment calls (e.g. which revenue-exclusion method applied) — the reader should never have to guess why a report looks generic.

## Color-role rule

The org's accent color is chrome only — headers, nav, tiles, the logo area. It must never be allowed to override the report's semantic colors (risk = red, opportunity = green, or whatever direction-coding the report uses). If the org's brand color happens to be red or green, keep the semantic colors as they are and use the brand color only where it can't be confused with a risk/opportunity signal.

## Where this fits

Do this once, near the start of building the report, after the data is scored and before you load `artifact-design` to build the page. It runs in parallel with nothing else being blocked by it — a slow or unreachable website should cost a few seconds at most, never a stalled report.

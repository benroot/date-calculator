# date-calculator — app spec

Helps a user calculate elapsed time between two dates (e.g. how many weeks
and days between them), or project forward/backward from a base date by an
offset to find another calendar date. See root
[`CLAUDE.md`](../CLAUDE.md) for repo-wide structure and working principles;
this file tracks the spec for this app specifically and should evolve as the
app does.

## Core concept

- **Base date** — entered in the first text box. Accepts either a literal
  `MM/DD/YYYY` date or an offset from *today* like `t+5`, `w-2`, `m+3`,
  `y-1` (resolved via `resolveDateField` in
  [`shared/date-utils.js`](../shared/date-utils.js)).
- **Second date** — entered in the second text box. Intended to accept the
  same dual format as the base date box (see open questions below for how
  an offset in this box should be anchored).
- Two related workflows share these two inputs:
  - Projecting a date forward/backward from the base date by an offset.
  - Comparing the base date and second date to find the elapsed time
    between them, shown in multiple units: months, weeks+days, and total
    days.

## Current state

Both boxes accept the same dual format — a literal `MM/DD/YYYY` date, or an
offset (`t`/`w`/`m`/`y`). The base-date box's offset is relative to *today*;
the second box's offset is relative to the *base date* (via
`resolveDateField`'s reference-date parameter), so it doubles as the old
"project forward/backward by an offset" workflow.

Once both dates resolve, the result panel shows the base date, the second
date, and the difference between them as three parallel figures — each one
independently a full restatement of the same span, not a combined
breakdown:

- **Months** — flat 28-day month (`formatMonthsAndDays` in
  [`shared/date-utils.js`](../shared/date-utils.js)), matching how
  `applyOffset`'s `m` unit already works elsewhere in this app.
- **Weeks + days** — `formatWeeksAndDays`.
- **Total days** — a single number.

If the second date falls before the base date, that's allowed — the
difference is shown as an absolute span with a "before"/"after" direction
sentence, rather than treated as invalid input.
# dose-counter — app spec

Helps a prescriber figure out how many pills to put on a prescription when
some doses of a course have already been given in the hospital and the rest
must be dispensed for the patient to take at home. See root
[`CLAUDE.md`](../CLAUDE.md) for repo-wide structure and working principles;
this file tracks the spec for this app specifically and should evolve as the
app does.

## Core concept

A course of medication is defined by:

- **Total days** — length of the course, in days
- **Frequency** — doses per day: `qd` (1x), `bid` (2x), `tid` (3x), `qid` (4x)

These two together fix the **total doses** for the full course. Some of
those doses have already been administered (typically in the hospital);
subtracting those gives the **doses remaining** — the number that must
actually be prescribed.

Later, instead of asking the user to state how many doses have already been
given, the app should derive that count automatically from the timing of the
first dose and the current date/time, per iteration 3 below.

## Iterations

### Iteration 1 — total doses from days + frequency (current focus)

- Text entry for number of days (a plain number).
- Frequency selector: `qd`, `bid`, `tid`, `qid`.
- Compute and display total doses needed for the full course (days ×
  doses-per-day).

### Iteration 2 — subtract doses already given

Once total doses are established (iteration 1), add:

- Numeric entry for doses already given (e.g. in the hospital).
- Compute and display doses remaining to prescribe (total − given).

### Iteration 3 — derive doses given from dose timing

Replace the manual "doses already given" entry from iteration 2 with an
automatic calculation:

- Entry for the date/time of the first dose.
- "Now" is assumed to be the current date/time.
- Using the frequency from iteration 1, calculate how many doses would have
  been administered between the first dose and now, then derive doses
  remaining as in iteration 2.

**Open questions (resolve before implementing this iteration):** the initial
prompt described entering a "date/time range" for the initial dose rather
than a single timestamp — needs clarification on whether that's a single
first-dose timestamp or a start/end window (e.g. when the exact
administration time is uncertain), and if a window, how it should be
resolved to a single point for the calculation. Also needs a rule for
mapping frequency to specific dosing intervals (e.g. does `bid` mean every
12 hours from the first dose, or two doses at fixed times of day like
8am/8pm?) — this determines how doses are counted between first-dose time
and now. Do not guess at either answer — confirm with the user before
building this iteration.

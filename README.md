# Date Calculator

A small static web app for calculating a new date from a starting date and an offset.

## Usage

Open [index.html](index.html) in a browser — no build step or server required.

1. Enter a starting date as `MM/DD/YYYY`, or an offset from today like `t+5` (resolves to a literal date once you leave the field).
2. Enter an offset to apply, e.g. `t+5`, `w-2`, `m+3`, `y-1`.
3. The resulting date appears automatically as you type.

### Offset format

An offset is a unit letter followed by a signed count:

| Unit | Meaning | Notes |
| --- | --- | --- |
| `t` | days | |
| `w` | weeks | |
| `m` | months | treated as a flat 28 days |
| `y` | years | calendar-based, clamps Feb 29 → Feb 28 |

Examples: `t+5` (5 days after), `w-2` (2 weeks before), `y-1` (1 year before).

## Project structure

- [index.html](index.html) — page markup and form (Bootstrap for styling, Alpine.js for reactivity)
- [app.js](app.js) — date parsing/formatting and offset calculation logic, plus the Alpine component
- [style.css](style.css) — page-specific styles layered on top of Bootstrap

## Dependencies

Loaded via CDN, no local install needed:

- [Bootstrap 5.3](https://getbootstrap.com/)
- [Alpine.js 3](https://alpinejs.dev/)

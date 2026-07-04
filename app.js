/* -------------------------------------------------------------
   Date Calculator — calculation logic
   Pure functions first (easy to test/reuse), Alpine wiring at the
   bottom. Keep it this way in future scaffolded apps: business
   logic in plain JS functions, Alpine only handles binding state
   to the DOM.
   ------------------------------------------------------------- */

/**
 * Formats a Date object as MM/DD/YYYY.
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

/**
 * Parses a MM/DD/YYYY string into a Date object (local time, no
 * timezone drift). Returns null if the string is not a valid date.
 * @param {string} value
 * @returns {Date|null}
 */
function parseDate(value) {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((value || "").trim());
  if (!match) return null;

  const month = Number(match[1]);
  const day = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(year, month - 1, day);
  // Reject dates JS silently rolled over, e.g. 02/30/2026.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

/**
 * Parses an offset string like "t+5", "w-2", "m+3", "y-1" into its
 * unit and signed count. Sign is optional and defaults to +.
 * @param {string} value
 * @returns {{unit: string, amount: number}|null}
 */
function parseOffset(value) {
  const match = /^\s*([twmyTWMY])\s*([+-]?\d+)\s*$/.exec(value || "");
  if (!match) return null;
  return {
    unit: match[1].toLowerCase(),
    amount: Number(match[2]),
  };
}

/**
 * Adds a parsed offset to a base date. Months are treated as a flat
 * 28 days (4 weeks) rather than calendar-month arithmetic, so every
 * unit is a simple day-count multiple. Years still use calendar-year
 * arithmetic (with day clamping for Feb 29 -> Feb 28) since "year"
 * has an unambiguous calendar meaning.
 * @param {Date} baseDate
 * @param {{unit: string, amount: number}} offset
 * @returns {Date}
 */
function applyOffset(baseDate, offset) {
  const result = new Date(baseDate.getTime());

  switch (offset.unit) {
    case "t": // days
      result.setDate(result.getDate() + offset.amount);
      return result;

    case "w": // weeks
      result.setDate(result.getDate() + offset.amount * 7);
      return result;

    case "m": // months, treated as a flat 28 days each
      result.setDate(result.getDate() + offset.amount * 28);
      return result;

    case "y": {
      // years, with day clamping (e.g. Feb 29 + 1 year -> Feb 28)
      const originalDay = result.getDate();

      result.setDate(1); // avoid month-overflow while shifting months
      result.setMonth(result.getMonth() + offset.amount * 12);

      const daysInTargetMonth = new Date(
        result.getFullYear(),
        result.getMonth() + 1,
        0
      ).getDate();
      result.setDate(Math.min(originalDay, daysInTargetMonth));
      return result;
    }

    default:
      return result;
  }
}

const OFFSET_UNIT_LABELS = {
  t: "day",
  w: "week",
  m: "month",
  y: "year",
};

/**
 * Resolves the base-date field's raw text into an actual Date,
 * accepting either a literal MM/DD/YYYY value or an offset (e.g.
 * "t+5") applied to *today's* date. Returns null if neither parses.
 * @param {string} rawValue
 * @returns {Date|null}
 */
function resolveBaseDate(rawValue) {
  const raw = (rawValue || "").trim();
  if (!raw) return null;

  const literalDate = parseDate(raw);
  if (literalDate) return literalDate;

  const offsetFromToday = parseOffset(raw);
  if (offsetFromToday) return applyOffset(new Date(), offsetFromToday);

  return null;
}

/**
 * Alpine component for the Date Calculator page.
 * Exposed on window so the inline x-data="dateCalculator()" call
 * in index.html can find it.
 */
function dateCalculator() {
  return {
    baseDateInput: formatDate(new Date()),
    offsetInput: "",
    resultDate: "",
    errorMessage: "",

    get hasResult() {
      return this.resultDate !== "" && this.errorMessage === "";
    },

    get offsetSummary() {
      const offset = parseOffset(this.offsetInput);
      if (!offset) return "";
      const unitLabel = OFFSET_UNIT_LABELS[offset.unit];
      const count = Math.abs(offset.amount);
      const plural = count === 1 ? "" : "s";
      const direction = offset.amount < 0 ? "before" : "after";
      return `${count} ${unitLabel}${plural} ${direction} the entered date`;
    },

    /**
     * Live preview only. Reads the base-date field as typed but
     * never writes back to it, so the user's cursor and in-progress
     * offset text (like "t+" before the digits land) are never
     * disturbed mid-keystroke.
     */
    calculate() {
      this.errorMessage = "";
      this.resultDate = "";

      const baseDate = resolveBaseDate(this.baseDateInput);
      if (!baseDate) {
        this.errorMessage =
          "Enter the starting date as MM/DD/YYYY, or an offset like t+5 from today.";
        return;
      }

      if (!this.offsetInput.trim()) {
        // Nothing to calculate yet; not an error state.
        return;
      }

      const offset = parseOffset(this.offsetInput);
      if (!offset) {
        this.errorMessage =
          "Enter an offset like t+5 (days), w-2 (weeks), m+3 (months), or y-1 (years).";
        return;
      }

      const result = applyOffset(baseDate, offset);
      this.resultDate = formatDate(result);
    },

    /**
     * Commits the base-date field: called on blur or Enter, never
     * on every keystroke. If the field holds an offset like "t+5",
     * rewrites it to the literal resolved date (e.g. "07/09/2026")
     * so the field always settles on a real date once the user is
     * done editing it.
     */
    commitBaseDate() {
      const resolved = resolveBaseDate(this.baseDateInput);
      if (resolved) {
        this.baseDateInput = formatDate(resolved);
      }
      this.calculate();
    },
  };
}

/* -------------------------------------------------------------
   Date Calculator — Alpine component
   Relies on shared/date-utils.js being loaded first for formatDate,
   resolveDateField, daysBetween, formatWeeksAndDays,
   formatMonthsAndDays.
   ------------------------------------------------------------- */

/**
 * Alpine component for the Date Calculator page.
 * Exposed on window so the inline x-data="dateCalculator()" call
 * in index.html can find it.
 */
function dateCalculator() {
  return {
    baseDateInput: formatDate(new Date()),
    secondDateInput: "",
    errorMessage: "",
    baseDateDisplay: "",
    secondDateDisplay: "",
    differenceSummary: "",
    monthsDisplay: "",
    weeksDisplay: "",
    daysDisplay: "",

    get hasResult() {
      return this.secondDateDisplay !== "" && this.errorMessage === "";
    },

    /**
     * Live preview only. Reads both fields as typed but never writes
     * back to them, so the user's cursor and in-progress text (like
     * "t+" before the digits land) are never disturbed mid-keystroke.
     */
    calculate() {
      this.errorMessage = "";
      this.baseDateDisplay = "";
      this.secondDateDisplay = "";
      this.differenceSummary = "";
      this.monthsDisplay = "";
      this.weeksDisplay = "";
      this.daysDisplay = "";

      const baseDate = resolveDateField(this.baseDateInput);
      if (!baseDate) {
        this.errorMessage =
          "Enter the starting date as MM/DD/YYYY, or an offset like t+5 from today.";
        return;
      }

      if (!this.secondDateInput.trim()) {
        // Nothing to calculate yet; not an error state.
        return;
      }

      const secondDate = resolveDateField(this.secondDateInput, baseDate);
      if (!secondDate) {
        this.errorMessage =
          "Enter the second date as MM/DD/YYYY, or an offset like t+5 from the base date.";
        return;
      }

      const diffDays = daysBetween(baseDate, secondDate);
      const absDays = Math.abs(diffDays);

      this.baseDateDisplay = formatDate(baseDate);
      this.secondDateDisplay = formatDate(secondDate);
      this.differenceSummary =
        diffDays === 0
          ? "The second date is the same as the base date."
          : `The second date is ${absDays} day${absDays === 1 ? "" : "s"} ${diffDays > 0 ? "after" : "before"} the base date.`;
      this.monthsDisplay = formatMonthsAndDays(absDays);
      this.weeksDisplay = formatWeeksAndDays(absDays);
      this.daysDisplay = String(absDays);
    },

    /**
     * Commits the base-date field: called on blur or Enter, never
     * on every keystroke. If the field holds an offset like "t+5",
     * rewrites it to the literal resolved date (e.g. "07/09/2026")
     * so the field always settles on a real date once the user is
     * done editing it.
     */
    commitBaseDate() {
      const resolved = resolveDateField(this.baseDateInput);
      if (resolved) {
        this.baseDateInput = formatDate(resolved);
      }
      this.calculate();
    },

    /**
     * Commits the second-date field: same idea as commitBaseDate(),
     * but an offset here resolves relative to the base date rather
     * than today.
     */
    commitSecondDate() {
      const baseDate = resolveDateField(this.baseDateInput);
      if (baseDate) {
        const resolved = resolveDateField(this.secondDateInput, baseDate);
        if (resolved) {
          this.secondDateInput = formatDate(resolved);
        }
      }
      this.calculate();
    },
  };
}
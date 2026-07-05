/* -------------------------------------------------------------
   Dose Counter — Alpine component
   Iteration 1: total doses from course length + frequency.
   See CLAUDE.md in this folder for the full spec and iteration plan.
   ------------------------------------------------------------- */

const FREQUENCY_DOSES_PER_DAY = {
  qd: 1,
  bid: 2,
  tid: 3,
  qid: 4,
};

/**
 * Alpine component for the Dose Counter page.
 * Exposed on window so the inline x-data="doseCounter()" call in
 * index.html can find it.
 */
function doseCounter() {
  return {
    daysInput: "",
    frequency: "qd",
    errorMessage: "",
    totalDoses: null,

    get hasResult() {
      return this.totalDoses !== null && this.errorMessage === "";
    },

    calculate() {
      this.errorMessage = "";
      this.totalDoses = null;

      const raw = this.daysInput.trim();
      if (!raw) return;

      const days = Number(raw);
      if (!Number.isInteger(days) || days <= 0) {
        this.errorMessage = "Enter the number of days as a whole number greater than 0.";
        return;
      }

      const dosesPerDay = FREQUENCY_DOSES_PER_DAY[this.frequency];
      this.totalDoses = days * dosesPerDay;
    },
  };
}

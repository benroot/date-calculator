/* -------------------------------------------------------------
   Dose Counter — Alpine component
   Iteration 1: total doses from course length + frequency.
   Iteration 3 relies on shared/date-utils.js being loaded first for
   resolveDateField and formatDate.
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
    firstDoseDateInput: "",
    firstDoseDateError: "",
    firstDoseDate: null,
    firstDayDoseCount: 1,
    todayDoseCount: 0,
    scheduleError: "",
    scheduleRemainingSummary: "",
    finalDoseSummary: "",

    get hasResult() {
      return this.totalDoses !== null && this.errorMessage === "";
    },

    /**
     * Iteration 3b: which numbered dose slots exist in a day for the
     * selected frequency, e.g. [1, 2, 3] for tid.
     */
    get doseNumberOptions() {
      const dosesPerDay = FREQUENCY_DOSES_PER_DAY[this.frequency];
      return Array.from({ length: dosesPerDay }, (_, i) => i + 1);
    },

    doseCountLabel(n) {
      return `${n} dose${n === 1 ? "" : "s"}`;
    },

    /**
     * Iteration 3c: whether today's dose count needs asking at all —
     * skipped when the first dispense date is today, since 3b already
     * covers that day's count.
     */
    get showTodayDoseCount() {
      return Boolean(this.firstDoseDate) && daysBetween(this.firstDoseDate, new Date()) > 0;
    },

    get todayDoseOptions() {
      const dosesPerDay = FREQUENCY_DOSES_PER_DAY[this.frequency];
      return Array.from({ length: dosesPerDay + 1 }, (_, i) => i);
    },

    calculate() {
      this.errorMessage = "";
      this.totalDoses = null;

      const dosesPerDay = FREQUENCY_DOSES_PER_DAY[this.frequency];
      if (this.firstDayDoseCount > dosesPerDay) {
        this.firstDayDoseCount = dosesPerDay;
      }
      if (this.todayDoseCount > dosesPerDay) {
        this.todayDoseCount = dosesPerDay;
      }

      const raw = this.daysInput.trim();
      if (raw) {
        const days = Number(raw);
        if (!Number.isInteger(days) || days <= 0) {
          this.errorMessage = "Enter the number of days as a whole number greater than 0.";
        } else {
          this.totalDoses = days * dosesPerDay;
        }
      }

      this.computeSchedule();
    },

    /**
     * Iteration 3a: live validation as the first-dispense date field
     * is typed. Accepts a literal MM/DD/YYYY date or an offset (e.g.
     * "t-5"), per resolveDateField, and rejects future dates since a
     * first dose can't have happened yet.
     */
    parseFirstDoseDate() {
      this.firstDoseDateError = "";
      this.firstDoseDate = null;

      const raw = this.firstDoseDateInput.trim();
      if (!raw) return;

      const resolved = resolveDateField(this.firstDoseDateInput);
      if (!resolved) {
        this.firstDoseDateError = "Enter the date of the first dose as MM/DD/YYYY.";
        return;
      }

      const today = new Date();
      if (resolved > today) {
        this.firstDoseDateError = "The date of the first dose can't be in the future.";
        return;
      }

      this.firstDoseDate = resolved;
      this.computeSchedule();
    },

    /**
     * Commits the first-dose-date field on blur or Enter: if the
     * field holds an offset like "t-5", rewrites it to the literal
     * resolved date so the field always settles on a real date once
     * the user is done editing it.
     */
    commitFirstDoseDate() {
      this.parseFirstDoseDate();
      if (this.firstDoseDate) {
        this.firstDoseDateInput = formatDate(this.firstDoseDate);
      }
    },

    /**
     * Iteration 3c/3d: derives doses given (and doses remaining) from
     * the first-dispense schedule rather than a typed count, and
     * separately projects the date of the final dose.
     *
     * Day 1 gets firstDayDoseCount doses (always 1 for qd); every day
     * after gets a full doses-per-day, including the final day, which
     * may end up short if day 1 was short.
     */
    computeSchedule() {
      this.scheduleError = "";
      this.scheduleRemainingSummary = "";
      this.finalDoseSummary = "";

      if (!this.hasResult || !this.firstDoseDate) return;

      const dosesPerDay = FREQUENCY_DOSES_PER_DAY[this.frequency];
      const day1Count = this.frequency === "qd" ? 1 : this.firstDayDoseCount;

      const elapsedDays = daysBetween(this.firstDoseDate, new Date());
      const given =
        elapsedDays <= 0
          ? day1Count
          : day1Count + (elapsedDays - 1) * dosesPerDay + this.todayDoseCount;

      if (given > this.totalDoses) {
        this.scheduleError =
          "The schedule implies more doses given than the total course — check the entries above.";
      } else {
        const remaining = this.totalDoses - given;
        this.scheduleRemainingSummary = `${remaining} dose${remaining === 1 ? "" : "s"} remaining to prescribe.`;
      }

      const remainingAfterDay1 = this.totalDoses - day1Count;
      let finalDayOffset = 0;
      let dosesOnFinalDay = this.totalDoses;
      if (remainingAfterDay1 > 0) {
        const fullDays = Math.ceil(remainingAfterDay1 / dosesPerDay);
        finalDayOffset = fullDays;
        dosesOnFinalDay = remainingAfterDay1 - (fullDays - 1) * dosesPerDay;
      }

      const finalDoseDate = applyOffset(this.firstDoseDate, { unit: "t", amount: finalDayOffset });
      this.finalDoseSummary =
        `Final dose: ${formatDate(finalDoseDate)} (${dosesOnFinalDay} dose${dosesOnFinalDay === 1 ? "" : "s"} that day).`;
    },
  };
}

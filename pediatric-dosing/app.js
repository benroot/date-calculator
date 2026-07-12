/* -------------------------------------------------------------
   Pediatric Dosing — Alpine component
   Iteration 2: weight-based acetaminophen calculator. Iteration 1's
   guidelines and dosing table (in index.html) are static reference
   content and don't need this component.
   See CLAUDE.md in this folder for the full spec and iteration plan.
   ------------------------------------------------------------- */

const ACETAMINOPHEN_MG_PER_ML = 160 / 5; // 160 mg/5 mL suspension
const KG_PER_LB = 0.45359237;

// A number followed by a required unit: "kg"/"k", or "lb"/"lbs"/"#"
// for pounds. No unit -> invalid, since kg and lb values look
// identical as bare numbers and guessing wrong would silently
// mis-dose.
const WEIGHT_INPUT_PATTERN = /^(\d+(?:\.\d+)?)\s*(kg|k|lbs?|#)$/i;

/**
 * Parses a weight string like "9.7kg", "9 k", "20lbs", or "20#"
 * into a value and normalized unit ("kg" or "lb"). Returns null if
 * no valid unit is present.
 * @param {string} rawValue
 * @returns {{value: number, unit: "kg"|"lb"}|null}
 */
function parseWeightInput(rawValue) {
  const match = WEIGHT_INPUT_PATTERN.exec((rawValue || "").trim());
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;

  const unitToken = match[2].toLowerCase();
  const unit = unitToken === "kg" || unitToken === "k" ? "kg" : "lb";
  return { value, unit };
}

/**
 * Alpine component for the Pediatric Dosing page.
 * Exposed on window so the inline x-data="pediatricDosing()" call in
 * index.html can find it.
 */
function pediatricDosing() {
  return {
    weightInput: "",
    dosePerKg: 15,
    errorMessage: "",
    doseMlDisplay: "",
    doseMgDisplay: "",

    get hasResult() {
      return this.doseMlDisplay !== "" && this.errorMessage === "";
    },

    calculate() {
      this.errorMessage = "";
      this.doseMlDisplay = "";
      this.doseMgDisplay = "";

      const raw = this.weightInput.trim();
      if (!raw) return;

      const parsed = parseWeightInput(raw);
      if (!parsed) {
        this.errorMessage = "Enter the weight with a unit, e.g. 9.7kg, 9 kg, 20lbs, or 20#.";
        return;
      }

      const weightKg = parsed.unit === "lb" ? parsed.value * KG_PER_LB : parsed.value;
      const doseMg = weightKg * this.dosePerKg;

      this.doseMlDisplay = `${(doseMg / ACETAMINOPHEN_MG_PER_ML).toFixed(1)} mL`;
      this.doseMgDisplay = `${Math.round(doseMg)} mg`;
    },

    /**
     * Rewrites the weight field to a normalized "value unit" form
     * (e.g. "20 lb") once it holds a valid parse, so shorthand like
     * "20#" or "9.7kg" settles into an unambiguous display once the
     * user is done editing it.
     */
    commitWeightInput() {
      const parsed = parseWeightInput(this.weightInput);
      this.calculate();
      if (parsed) {
        this.weightInput = `${parsed.value} ${parsed.unit}`;
      }
    },
  };
}

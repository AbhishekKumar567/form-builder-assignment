import { Parser } from "expr-eval";

export function evaluateFormula(formula: string, valuesById: Record<string, any>): any {
  if (!formula) return "";

  try {
    
    let replaced = formula.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, id) => {
      const val = valuesById[id];
      return val === undefined || val === null ? "" : val;
    });

    // Parsing and evaluating 
    const parser = new Parser();
    return parser.parse(replaced).evaluate(valuesById);
  } catch (err) {
    console.error("Formula evaluation error:", err);
    return "";
  }
}

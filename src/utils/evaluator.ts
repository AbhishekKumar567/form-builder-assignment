
export function evaluateFormula(formula: string, valuesById: Record<string, any>): any {
  if (!formula) return "";

  const replaced = formula.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, id) => {
    const v = valuesById[id];
    return JSON.stringify(v === undefined || v === null ? "" : v);
  });

  try {
    const fn = new Function(`return (${replaced});`);
    return fn();
  } catch (err) {
    try {
      const fn2 = new Function(replaced);
      return fn2();
    } catch (err2) {
      return "";
    }
  }
}

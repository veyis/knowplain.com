export type IncomeBridgeInputs = {
  spending: number;
  socialSecurityAndPension: number;
  taxableAccountWithdrawal: number;
  realizedGains: number;
  traditionalWithdrawal: number;
  rothWithdrawal: number;
  rothConversion: number;
  otherTaxableIncome: number;
};

const safe = (value: number) => Number.isFinite(value) ? Math.max(0, value) : 0;

/** Separate spendable cash from ACA MAGI; a conversion belongs only in the latter. */
export function incomeBridgeLedger(inputs: IncomeBridgeInputs) {
  const spending = safe(inputs.spending);
  const taxableAccountWithdrawal = safe(inputs.taxableAccountWithdrawal);
  const realizedGains = Math.min(taxableAccountWithdrawal, safe(inputs.realizedGains));
  const cashAvailable =
    safe(inputs.socialSecurityAndPension) +
    taxableAccountWithdrawal +
    safe(inputs.traditionalWithdrawal) +
    safe(inputs.rothWithdrawal) +
    safe(inputs.otherTaxableIncome);
  const acaMagi =
    safe(inputs.socialSecurityAndPension) +
    realizedGains +
    safe(inputs.traditionalWithdrawal) +
    safe(inputs.rothConversion) +
    safe(inputs.otherTaxableIncome);

  return {
    spending,
    cashAvailable,
    acaMagi,
    cashGap: Math.max(0, spending - cashAvailable),
    cashSurplus: Math.max(0, cashAvailable - spending),
  };
}

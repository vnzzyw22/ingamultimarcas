import { financeConfig } from "@/config/finance";

export interface FinanceInput {
  vehicleValue: number;
  downPayment: number;
  installments: number;
  monthlyRate?: number;
}

export interface FinanceResult {
  financed: number;
  installment: number;
  total: number;
  interest: number;
}

/** Tabela Price: PMT = PV · i / (1 − (1 + i)^−n). Estimativa — sem IOF, TAC ou seguros. */
export function simulateFinancing({
  vehicleValue,
  downPayment,
  installments,
  monthlyRate = financeConfig.monthlyRate,
}: FinanceInput): FinanceResult {
  const financed = Math.max(0, vehicleValue - Math.max(0, downPayment));
  if (financed === 0 || installments <= 0) {
    return { financed, installment: 0, total: 0, interest: 0 };
  }
  const installment =
    monthlyRate === 0
      ? financed / installments
      : (financed * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -installments));
  const total = installment * installments;
  return { financed, installment, total, interest: total - financed };
}

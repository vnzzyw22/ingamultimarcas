/**
 * Parâmetros da simulação de financiamento.
 *
 * ⚠️ DEMO: a taxa abaixo NÃO foi fornecida pela empresa nem por instituição
 * financeira. Serve apenas para a calculadora funcionar. Substitua pela taxa
 * de referência informada pela Ingá.
 */
export const financeConfig = {
  isDemoRate: true,
  /** Taxa mensal em decimal (0.0189 = 1,89% a.m.). */
  monthlyRate: 0.0189,
  installmentOptions: [12, 24, 36, 48, 60] as const,
  defaultInstallments: 48,
  /** Entrada mínima sugerida (fração do valor do veículo). */
  minDownPaymentRatio: 0,
  defaultDownPaymentRatio: 0.3,
  disclaimer:
    "Simulação estimativa. As condições finais dependem da análise da instituição financeira.",
} as const;

export type InstallmentOption = (typeof financeConfig.installmentOptions)[number];

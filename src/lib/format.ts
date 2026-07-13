export function formatCurrency(amount: number | null | undefined, currency = "RWF"): string {
  const val = amount || 0
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val) + ` ${currency}`
}

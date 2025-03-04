export function formatPercent(value: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

/**
 * Formats a number as currency with the specified currency code
 * @param amount The amount to format
 * @param currency The currency code (e.g. 'USD', 'CAD'). Defaults to 'USD'
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

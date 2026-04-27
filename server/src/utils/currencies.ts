/**
 * Currency utilities and constants
 * All prices are stored in USD in the database
 * Exchange rates are indicative (April 2026)
 */

export const SUPPORTED_CURRENCIES = {
  USD: { name: "US Dollar", symbol: "$", country: "US" },
  EUR: { name: "Euro", symbol: "€", country: "DE" },
  GBP: { name: "British Pound", symbol: "£", country: "GB" },
  JPY: { name: "Japanese Yen", symbol: "¥", country: "JP" },
  CAD: { name: "Canadian Dollar", symbol: "C$", country: "CA" },
  AUD: { name: "Australian Dollar", symbol: "A$", country: "AU" },
  CHF: { name: "Swiss Franc", symbol: "CHF", country: "CH" },
  INR: { name: "Indian Rupee", symbol: "₹", country: "IN" },
  MXN: { name: "Mexican Peso", symbol: "$", country: "MX" },
  BRL: { name: "Brazilian Real", symbol: "R$", country: "BR" },
  SGD: { name: "Singapore Dollar", symbol: "S$", country: "SG" },
}

// Exchange rates relative to USD (base currency)
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  CAD: 1.36,
  AUD: 1.53,
  CHF: 0.88,
  INR: 83.12,
  MXN: 17.05,
  BRL: 4.97,
  SGD: 1.35,
}

// Determine decimal places for each currency
export const CURRENCY_DECIMALS: Record<string, number> = {
  USD: 2,
  EUR: 2,
  GBP: 2,
  JPY: 0, // Yen doesn't use decimals
  CAD: 2,
  AUD: 2,
  CHF: 2,
  INR: 2,
  MXN: 2,
  BRL: 2,
  SGD: 2,
}

/**
 * Convert an amount from USD to the target currency
 * @param amountUSD - Amount in USD
 * @param targetCurrency - Target currency code
 * @returns Converted amount
 */
export function convertCurrency(
  amountUSD: number,
  targetCurrency: string = "USD"
): number {
  const rate = EXCHANGE_RATES[targetCurrency] ?? EXCHANGE_RATES.USD
  return amountUSD * rate
}

/**
 * Format a price for display
 * @param priceUSD - Price in USD (base currency)
 * @param currency - Currency code
 * @returns Formatted price string
 */
export function formatPrice(
  priceUSD: number,
  currency: string = "USD"
): string {
  const converted = convertCurrency(priceUSD, currency)
  const decimals = CURRENCY_DECIMALS[currency] ?? 2
  const currencyInfo = SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES]
  const symbol = currencyInfo?.symbol ?? currency

  // Format with proper decimals
  const formatted = converted.toFixed(decimals)

  return `${symbol}${formatted}`
}

/**
 * Get currency info
 */
export function getCurrencyInfo(currency: string) {
  return SUPPORTED_CURRENCIES[currency as keyof typeof SUPPORTED_CURRENCIES]
}

/**
 * Get all supported currencies as an array
 */
export function getSupportedCurrencies() {
  return Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => ({
    code,
    ...info,
  }))
}

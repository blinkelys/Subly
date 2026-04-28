/**
 * Currency Exchange Service
 * Handles currency conversion using an external API
 * Caches rates to minimize API calls
 */

import axios from 'axios'

interface ExchangeRateCache {
  rates: Record<string, number>
  timestamp: number
  expiresAt: number
}

// Cache configuration (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

// In-memory cache
let rateCache: ExchangeRateCache | null = null

// Fallback rates (used if API fails)
const FALLBACK_RATES: Record<string, number> = {
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
  NOK: 10.5,
  SEK: 10.5,
  DKK: 6.97,
}

const SUPPORTED_CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'INR', 
  'MXN', 'BRL', 'SGD', 'NOK', 'SEK', 'DKK'
]

/**
 * Fetch exchange rates from API
 * Using exchangerate-api.com (free tier)
 */
async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY || 'fca_live' // Free API
    const apiUrl = `https://api.exchangerate-api.com/v4/latest/USD`

    const response = await axios.get(apiUrl, {
      timeout: 5000,
    })

    if (!response.data.rates) {
      throw new Error('Invalid API response')
    }

    // Filter only supported currencies and include USD
    const rates: Record<string, number> = { USD: 1 }
    
    for (const currency of SUPPORTED_CURRENCIES) {
      if (response.data.rates[currency] !== undefined) {
        rates[currency] = response.data.rates[currency]
      }
    }

    // Update cache
    rateCache = {
      rates,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_DURATION,
    }

    return rates
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error)
    // Return fallback rates on API failure
    return FALLBACK_RATES
  }
}

/**
 * Get cached exchange rates or fetch new ones
 */
async function getExchangeRates(): Promise<Record<string, number>> {
  // Check if cache is still valid
  if (rateCache && Date.now() < rateCache.expiresAt) {
    return rateCache.rates
  }

  // Fetch new rates
  return fetchExchangeRates()
}

/**
 * Convert amount from USD to target currency
 * @param amountUSD Amount in USD
 * @param targetCurrency Target currency code
 * @returns Converted amount
 */
export async function convertFromUSD(
  amountUSD: number,
  targetCurrency: string
): Promise<number> {
  const rates = await getExchangeRates()
  const rate = rates[targetCurrency] || rates.USD
  return amountUSD * rate
}

/**
 * Convert amount from source currency to USD
 * @param amount Amount in source currency
 * @param sourceCurrency Source currency code
 * @returns Amount in USD
 */
export async function convertToUSD(
  amount: number,
  sourceCurrency: string
): Promise<number> {
  const rates = await getExchangeRates()
  const rate = rates[sourceCurrency] || rates.USD
  return amount / rate
}

/**
 * Convert from one currency to another
 * @param amount Amount to convert
 * @param fromCurrency Source currency
 * @param toCurrency Target currency
 * @returns Converted amount
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency) {
    return amount
  }

  // Convert to USD first, then to target currency
  const usdAmount = await convertToUSD(amount, fromCurrency)
  return convertFromUSD(usdAmount, toCurrency)
}

/**
 * Get all current exchange rates relative to USD
 */
export async function getAllExchangeRates(): Promise<Record<string, number>> {
  return getExchangeRates()
}

/**
 * Get specific exchange rate
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  const rates = await getExchangeRates()
  
  if (fromCurrency === toCurrency) {
    return 1
  }

  // Rate from source to target
  const fromRate = rates[fromCurrency] || 1
  const toRate = rates[toCurrency] || 1
  
  return toRate / fromRate
}

/**
 * Format price for display
 */
export function formatPrice(
  amount: number,
  currency: string,
  decimals?: number
): string {
  const currencyInfo: Record<string, { symbol: string; decimals: number }> = {
    USD: { symbol: '$', decimals: 2 },
    EUR: { symbol: '€', decimals: 2 },
    GBP: { symbol: '£', decimals: 2 },
    JPY: { symbol: '¥', decimals: 0 },
    CAD: { symbol: 'C$', decimals: 2 },
    AUD: { symbol: 'A$', decimals: 2 },
    CHF: { symbol: 'CHF', decimals: 2 },
    INR: { symbol: '₹', decimals: 2 },
    MXN: { symbol: '$', decimals: 2 },
    BRL: { symbol: 'R$', decimals: 2 },
    SGD: { symbol: 'S$', decimals: 2 },
    NOK: { symbol: 'kr', decimals: 2 },
    SEK: { symbol: 'kr', decimals: 2 },
    DKK: { symbol: 'kr', decimals: 2 },
  }

  const info = currencyInfo[currency]
  const decimal = decimals ?? info?.decimals ?? 2
  const symbol = info?.symbol ?? currency

  const formatted = amount.toFixed(decimal)
  return `${symbol}${formatted}`
}

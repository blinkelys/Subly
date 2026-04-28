import { ref, computed } from 'vue'
import api from '../api'

interface ExchangeRates {
  rates: Record<string, number>
  timestamp: string
}

const exchangeRates = ref<ExchangeRates | null>(null)
const isLoadingRates = ref(false)
const ratesError = ref<string | null>(null)

export function useCurrency() {
  /**
   * Fetch current exchange rates from backend
   */
  const fetchExchangeRates = async () => {
    isLoadingRates.value = true
    ratesError.value = null
    try {
      const response = await api.get('/auth/exchange-rates')
      exchangeRates.value = response.data
      return response.data.rates
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)
      ratesError.value = 'Failed to load exchange rates'
      throw error
    } finally {
      isLoadingRates.value = false
    }
  }

  /**
   * Convert amount from source to target currency
   * Uses backend API for conversion
   */
  const convert = async (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> => {
    try {
      const response = await api.post('/auth/convert', {
        amount,
        fromCurrency,
        toCurrency,
      })
      return response.data.converted.amount
    } catch (error) {
      console.error('Currency conversion failed:', error)
      throw error
    }
  }

  /**
   * Format price with currency symbol
   */
  const formatPrice = (
    amount: number,
    currency: string = 'USD',
    decimals?: number
  ): string => {
    const currencyInfo: Record<
      string,
      { symbol: string; decimals: number }
    > = {
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

  /**
   * Format price in base USD currency
   */
  const formatUSD = (amount: number, decimals = 2): string => {
    return formatPrice(amount, 'USD', decimals)
  }

  /**
   * Get exchange rate between two currencies
   */
  const getExchangeRate = (fromCurrency: string, toCurrency: string): number | null => {
    if (!exchangeRates.value) return null

    const rates = exchangeRates.value.rates
    if (fromCurrency === toCurrency) return 1

    const fromRate = rates[fromCurrency] ?? 1
    const toRate = rates[toCurrency] ?? 1

    return toRate / fromRate
  }

  return {
    exchangeRates: computed(() => exchangeRates.value),
    isLoadingRates: computed(() => isLoadingRates.value),
    ratesError: computed(() => ratesError.value),
    fetchExchangeRates,
    convert,
    formatPrice,
    formatUSD,
    getExchangeRate,
  }
}

import { localeCurrencies, type Locale } from '@/i18n/config';

export function getPricing(locale: Locale) {
  const currency = localeCurrencies[locale];
  return {
    currency: currency.code,
    symbol: currency.symbol,
    starter: {
      monthly: currency.starterMonthly,
      yearly: Math.round(currency.starterMonthly * 12 * 0.7),
      monthlyDisplay: `${currency.symbol}${currency.starterMonthly}`,
      yearlyDisplay: `${currency.symbol}${Math.round(currency.starterMonthly * 12 * 0.7)}`
    },
    pro: {
      monthly: currency.proMonthly,
      yearly: Math.round(currency.proMonthly * 12 * 0.7),
      monthlyDisplay: `${currency.symbol}${currency.proMonthly}`,
      yearlyDisplay: `${currency.symbol}${Math.round(currency.proMonthly * 12 * 0.7)}`
    },
    lifetime: {
      price: currency.lifetime,
      display: `${currency.symbol}${currency.lifetime}`
    }
  };
}
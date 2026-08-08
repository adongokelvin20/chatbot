import { CURRENCY } from './constants';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: CURRENCY.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCurrencySymbol(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

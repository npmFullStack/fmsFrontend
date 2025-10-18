// src/utils/formatters.js
export const formatCurrency = (amount, currency = '₱') => {
  return `${currency}${parseFloat(amount).toFixed(2)}`;
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number);
};
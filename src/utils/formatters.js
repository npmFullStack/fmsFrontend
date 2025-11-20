// src/utils/formatters.js

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};


export const formatNumber = (number) => {
  return new Intl.NumberFormat().format(number);
};

export const toUpperCase = (text) => {
  return text ? text.toString().toUpperCase() : '';
};

export const toLowerCase = (text) => {
  return text ? text.toString().toLowerCase() : '';
};

export const toTitleCase = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatPercentage = (value) => {
  if (value == null || isNaN(value)) return '0%';
  return `${parseFloat(value).toFixed(2)}%`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  
  // Format: Nov. 16, 2025
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).replace(/(\w+) (\d+), (\d+)/, '$1. $2, $3');
};
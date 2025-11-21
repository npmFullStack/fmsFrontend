// src/schemas/arSchema.js
import { z } from 'zod';

export const arSchema = z.object({
  booking_id: z.number({ 
    required_error: 'Booking is required',
    invalid_type_error: 'Booking must be a number'
  }).min(1, 'Booking is required'),
  total_payment: z.number().min(0, 'Total payment must be greater than or equal to 0'),
});

export const defaultARValues = {
  booking_id: undefined,
  total_payment: 0,
};

export const agingBuckets = [
  { value: 'current', label: 'Current', color: 'green' },
  { value: '1-30', label: '1-30 Days', color: 'blue' },
  { value: '31-60', label: '31-60 Days', color: 'yellow' },
  { value: '61-90', label: '61-90 Days', color: 'orange' },
  { value: 'over_90', label: 'Over 90 Days', color: 'red' }
];

export const dueStatuses = [
  { value: 'paid', label: 'Paid', color: 'green' },
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'overdue', label: 'Overdue', color: 'red' }
];
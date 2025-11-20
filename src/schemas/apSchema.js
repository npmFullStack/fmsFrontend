// src/schemas/apSchema.js
import { z } from 'zod';

// Base charge schema
const baseChargeSchema = {
  amount: z.number().min(0, 'Amount must be greater than or equal to 0').default(0),
  check_date: z.string().optional().nullable(),
  voucher: z.string().max(100).optional().nullable(),
};

// Freight charge schema
export const freightChargeSchema = z.object({
  ...baseChargeSchema,
}).optional().nullable();

// Trucking charge schema
export const truckingChargeSchema = z.object({
  ...baseChargeSchema,
  type: z.enum(['ORIGIN', 'DESTINATION'], {
    required_error: 'Type is required',
  }),
});

// Port charge schema
export const portChargeSchema = z.object({
  ...baseChargeSchema,
  charge_type: z.enum([
    'CRAINAGE', 
    'ARRASTRE_ORIGIN', 
    'ARRASTRE_DEST',
    'WHARFAGE_ORIGIN', 
    'WHARFAGE_DEST',
    'LABOR_ORIGIN', 
    'LABOR_DEST'
  ], {
    required_error: 'Charge type is required',
  }),
  payee: z.string().max(255).optional().nullable(),
});

// Misc charge schema
export const miscChargeSchema = z.object({
  ...baseChargeSchema,
  charge_type: z.enum([
    'REBATES', 
    'STORAGE', 
    'FACILITATION', 
    'DENR'
  ], {
    required_error: 'Charge type is required',
  }),
  payee: z.string().max(255).optional().nullable(),
});

// Main AP schema - SIMPLIFIED VALIDATION
export const apSchema = z.object({
  booking_id: z.number({ 
    required_error: 'Booking is required',
    invalid_type_error: 'Booking must be a number'
  }).min(1, 'Booking is required'),
  freight_charge: freightChargeSchema,
  trucking_charges: z.array(truckingChargeSchema).optional().default([]),
  port_charges: z.array(portChargeSchema).optional().default([]),
  misc_charges: z.array(miscChargeSchema).optional().default([]),
});

export const defaultAPValues = {
  booking_id: undefined,
  freight_charge: {
    amount: 0,
    check_date: '',
    voucher: ''
  },
  trucking_charges: [],
  port_charges: [],
  misc_charges: [],
};

export const chargeTypes = {
  freight: 'Freight',
  trucking: 'Trucking',
  port: 'Port Charges',
  misc: 'Miscellaneous'
};

export const truckingTypes = [
  { value: 'ORIGIN', label: 'Origin' },
  { value: 'DESTINATION', label: 'Destination' }
];

export const portChargeTypes = [
  { value: 'CRAINAGE', label: 'Crainage' },
  { value: 'ARRASTRE_ORIGIN', label: 'Arrastre (Origin)' },
  { value: 'ARRASTRE_DEST', label: 'Arrastre (Destination)' },
  { value: 'WHARFAGE_ORIGIN', label: 'Wharfage (Origin)' },
  { value: 'WHARFAGE_DEST', label: 'Wharfage (Destination)' },
  { value: 'LABOR_ORIGIN', label: 'Labor (Origin)' },
  { value: 'LABOR_DEST', label: 'Labor (Destination)' }
];

export const miscChargeTypes = [
  { value: 'REBATES', label: 'Rebates' },
  { value: 'STORAGE', label: 'Storage' },
  { value: 'FACILITATION', label: 'Facilitation' },
  { value: 'DENR', label: 'DENR' }
];
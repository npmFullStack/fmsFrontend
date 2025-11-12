import { z } from 'zod';

export const truckCompSchema = z.object({
  name: z
    .string({ required_error: 'Truck company name is required' })
    .min(1, 'Truck company name is required')
    .max(255, 'Truck company name must be less than 255 characters'),
});

export const defaultTruckCompValues = { name: '' };

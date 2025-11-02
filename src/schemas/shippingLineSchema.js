import { z } from 'zod';

export const shippingLineSchema = z.object({
  name: z
    .string({ required_error: 'Shipping line name is required' })
    .min(1, 'Shipping line name is required')
    .max(255, 'Shipping line name must be less than 255 characters'),
});

export const defaultShippingLineValues = {
  name: '',
};
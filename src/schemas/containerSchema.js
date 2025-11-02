// src/schemas/containerSchema.js
import { z } from 'zod';

export const containerSchema = z.object({
  size: z
    .string({ required_error: 'Container size is required' })
    .min(1, 'Container size is required'),
  max_weight: z
    .number({ invalid_type_error: 'Max weight must be a number' })
    .min(0, 'Max weight must be non-negative'),
});

export const defaultContainerValues = {
  size: '',
  max_weight: 0,
};

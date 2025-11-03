// src/schemas/categorySchema.js
import { z } from 'zod';

export const categorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .min(1, 'Category name is required')
    .max(255, 'Category name must not exceed 255 characters'),
});

export const defaultCategoryValues = {
  name: '',
};
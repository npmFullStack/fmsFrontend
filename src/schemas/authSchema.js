// src/schemas/authSchema.js
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export const defaultLoginValues = {
  email: '',
  password: '',
};
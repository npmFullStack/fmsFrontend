import { z } from 'zod';

export const userSchema = z.object({
    first_name: z
        .string({ required_error: 'First name is required' })
        .min(1, 'First name is required')
        .max(255, 'First name must be less than 255 characters'),
    last_name: z
        .string({ required_error: 'Last name is required' })
        .min(1, 'Last name is required')
        .max(255, 'Last name must be less than 255 characters'),
    email: z
        .string({ required_error: 'Email is required' })
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    contact_number: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine((val) => !val || val.length <= 20, 'Contact number must be less than 20 characters'),
    // Password removed since it will be auto-generated
});

export const updateUserSchema = z.object({
    first_name: z
        .string({ required_error: 'First name is required' })
        .min(1, 'First name is required')
        .max(255, 'First name must be less than 255 characters'),
    last_name: z
        .string({ required_error: 'Last name is required' })
        .min(1, 'Last name is required')
        .max(255, 'Last name must be less than 255 characters'),
    email: z
        .string({ required_error: 'Email is required' })
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    contact_number: z
        .string()
        .optional()
        .or(z.literal(''))
        .refine((val) => !val || val.length <= 20, 'Contact number must be less than 20 characters'),
});

export const defaultUserValues = {
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    // Password removed
};

export const defaultUpdateUserValues = {
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
};
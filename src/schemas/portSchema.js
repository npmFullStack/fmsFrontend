// src/schemas/portSchema.js
import { z } from 'zod';

export const portSchema = z.object({
  name: z
    .string({ required_error: 'Port name is required' })
    .min(1, 'Port name is required')
    .max(255, 'Port name must not exceed 255 characters'),
  route_name: z
    .string({ required_error: 'Route name is required' })
    .min(1, 'Route name is required')
    .max(255, 'Route name must not exceed 255 characters'),
  address: z
    .string()
    .optional()
    .nullable()
    .transform(val => val === '' ? null : val),
  latitude: z
    .number({ 
      required_error: 'Latitude is required',
      invalid_type_error: 'Latitude must be a number'
    })
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number({ 
      required_error: 'Longitude is required',
      invalid_type_error: 'Longitude must be a number'
    })
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
});

export const defaultPortValues = {
  name: '',
  route_name: '',
  address: '',
  latitude: 0,
  longitude: 0,
};
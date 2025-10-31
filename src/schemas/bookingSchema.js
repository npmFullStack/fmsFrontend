import { z } from 'zod';

export const bookingSchema = z.object({
  // Personal information
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  contact_number: z.string().min(1, "Contact number is required"),
  
  // Shipper information
  shipper_first_name: z.string().min(1, "Shipper first name is required"),
  shipper_last_name: z.string().min(1, "Shipper last name is required"),
  shipper_contact: z.string().min(1, "Shipper contact is required"),
  
  // Consignee information
  consignee_first_name: z.string().min(1, "Consignee first name is required"),
  consignee_last_name: z.string().min(1, "Consignee last name is required"),
  consignee_contact: z.string().min(1, "Consignee contact is required"),
  
  // Shipping preferences
  mode_of_service: z.string().min(1, "Mode of service is required"),
  container_size: z.string().min(1, "Container size is required"),
  container_quantity: z.number().min(1, "Container quantity is required"),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  shipping_line: z.string().optional().nullable(),
  
  // Dates
  departure_date: z.string().min(1, "Departure date is required"),
  delivery_date: z.string().optional().nullable(),
  
  // Locations
  pickup_location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
  }).optional().nullable(),
  
  delivery_location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
  }).optional().nullable(),
  
  // Items
  items: z.array(
    z.object({
      name: z.string().min(1, "Item name is required"),
      weight: z.number().min(0.01, "Weight must be greater than 0"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      category: z.string().min(1, "Category is required"),
    })
  ).min(1, "At least one item is required"),
});

export const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  weight: z.number().min(0.01, "Weight must be greater than 0"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  category: z.string().min(1, "Category is required"),
  customCategory: z.string().optional(),
});
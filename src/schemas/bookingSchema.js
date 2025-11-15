import { z } from 'zod';

// Item schema for individual items
export const bookingItemSchema = z.object({
  name: z
    .string({ required_error: 'Item name is required' })
    .min(1, 'Item name is required')
    .max(255, 'Item name must not exceed 255 characters'),
  weight: z
    .union([z.string(), z.number()])
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0.01, 'Weight must be greater than 0')),
  quantity: z
    .union([z.string(), z.number()])
    .transform((val) => parseInt(val))
    .pipe(z.number().min(1, 'Quantity must be at least 1')),
  category: z
    .string({ required_error: 'Category is required' })
    .min(1, 'Category is required'),
  customCategory: z.string().optional(),
});

// Main booking schema
export const bookingSchema = z.object({
  // Personal Information
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, 'First name is required')
    .max(255, 'First name must not exceed 255 characters'),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, 'Last name is required')
    .max(255, 'Last name must not exceed 255 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email address'),
  contactNumber: z.string().optional(),

  // Shipper Information
  shipperFirstName: z
    .string({ required_error: 'Shipper first name is required' })
    .min(1, 'Shipper first name is required')
    .max(255, 'Shipper first name must not exceed 255 characters'),
  shipperLastName: z
    .string({ required_error: 'Shipper last name is required' })
    .min(1, 'Shipper last name is required')
    .max(255, 'Shipper last name must not exceed 255 characters'),
  shipperContact: z.string().optional(),

  // Consignee Information
  consigneeFirstName: z
    .string({ required_error: 'Consignee first name is required' })
    .min(1, 'Consignee first name is required')
    .max(255, 'Consignee first name must not exceed 255 characters'),
  consigneeLastName: z
    .string({ required_error: 'Consignee last name is required' })
    .min(1, 'Consignee last name is required')
    .max(255, 'Consignee last name must not exceed 255 characters'),
  consigneeContact: z.string().optional(),

  // Shipping Details
  modeOfService: z
    .object({
      value: z.string(),
      label: z.string(),
    }, { required_error: 'Mode of service is required' }),
  containerSize: z
    .object({
      value: z.number(),
      label: z.string(),
      max_weight: z.union([z.string(), z.number()])
        .transform((val) => parseFloat(val))
        .pipe(z.number().min(0))
        .optional(),
    }, { required_error: 'Container type is required' }),
  containerQuantity: z
    .number()
    .min(1, 'Container quantity must be at least 1'),
  origin: z
    .object({
      value: z.number(),
      label: z.string(),
    }, { required_error: 'Origin port is required' }),
  destination: z
    .object({
      value: z.number(),
      label: z.string(),
    }, { required_error: 'Destination port is required' }),
  shippingLine: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .optional()
    .nullable(),
  // ✅ Added Truck Company
  truckCompany: z
    .object({
      value: z.number(),
      label: z.string(),
    })
    .optional()
    .nullable(),

  // Dates
  departureDate: z
    .date({ required_error: 'Departure date is required' })
    .refine((date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), {
      message: 'Departure date must be today or in the future'
    }),
  deliveryDate: z
    .date()
    .optional()
    .nullable(),

  // Locations
  pickupLocation: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional().nullable(),
  deliveryLocation: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional().nullable(),

  // Terms
  terms: z
    .number({ required_error: 'Terms is required' })
    .min(1, 'Terms must be at least 1'),

  // Items
  items: z
    .array(bookingItemSchema)
    .min(1, 'At least one item is required'),
}).refine((data) => {
  // Validate that delivery date is after departure date if provided
  if (data.deliveryDate && data.departureDate) {
    return data.deliveryDate >= data.departureDate;
  }
  return true;
}, {
  message: 'Delivery date must be after or equal to departure date',
  path: ['deliveryDate'],
});

// Default values for the booking form
export const defaultBookingValues = {
  // Personal Information
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',

  // Shipper Information
  shipperFirstName: '',
  shipperLastName: '',
  shipperContact: '',

  // Consignee Information
  consigneeFirstName: '',
  consigneeLastName: '',
  consigneeContact: '',

  // Shipping Details
  modeOfService: null,
  containerSize: null,
  containerQuantity: 1,
  origin: null,
  destination: null,
  shippingLine: null,
  truckCompany: null, // ✅ Added

  // Dates
  departureDate: null,
  deliveryDate: null,

  // Locations
  pickupLocation: null,
  deliveryLocation: null,

  // Terms
  terms: 0,

  // Items - start with one empty item
  items: [
    {
      id: 1,
      name: '',
      weight: '',
      quantity: '',
      category: '',
      customCategory: '',
    },
  ],
};

// Schema for API request (transforms frontend data to backend format)
export const bookingApiSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  contact_number: z.string().optional(),
  shipper_first_name: z.string(),
  shipper_last_name: z.string(),
  shipper_contact: z.string().optional(),
  consignee_first_name: z.string(),
  consignee_last_name: z.string(),
  consignee_contact: z.string().optional(),
  mode_of_service: z.string(),
  container_size_id: z.number(),
  container_quantity: z.number().min(1),
  origin_id: z.number(),
  destination_id: z.number(),
  shipping_line_id: z.number().optional().nullable(),
  truck_comp_id: z.number().optional().nullable(), // ✅ Added
  departure_date: z.string(),
  delivery_date: z.string().optional().nullable(),
  terms: z.number().min(1),
  pickup_location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional().nullable(),
  delivery_location: z.object({
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional().nullable(),
  items: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0.01),
    quantity: z.number().min(1),
    category: z.string(),
  })).min(1),
});

// Helper function to transform frontend data to API format
export const transformBookingToApi = (data) => {
  return {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    contact_number: data.contactNumber || null,
    shipper_first_name: data.shipperFirstName,
    shipper_last_name: data.shipperLastName,
    shipper_contact: data.shipperContact || null,
    consignee_first_name: data.consigneeFirstName,
    consignee_last_name: data.consigneeLastName,
    consignee_contact: data.consigneeContact || null,
    mode_of_service: data.modeOfService.value,
    container_size_id: data.containerSize.value,
    container_quantity: data.containerQuantity,
    origin_id: data.origin.value,
    destination_id: data.destination.value,
    shipping_line_id: data.shippingLine?.value || null,
    truck_comp_id: data.truckCompany?.value || null, // ✅ Added
    departure_date: data.departureDate.toISOString().split('T')[0],
    delivery_date: data.deliveryDate?.toISOString().split('T')[0] || null,
    terms: data.terms,
    pickup_location: data.pickupLocation || null,
    delivery_location: data.deliveryLocation || null,
    items: data.items.map(item => ({
      name: item.name,
      weight: parseFloat(item.weight),
      quantity: parseInt(item.quantity),
      category: item.category === 'other' ? item.customCategory : item.category,
    })),
  };
};
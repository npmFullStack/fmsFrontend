// schemas/quoteSchema.js
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

// Main quote schema (without userId)
export const quoteSchema = z.object({
    // Customer Information (no userId required for quotes)
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')), // Allow empty string
    contactNumber: z.string().optional(),

    // Shipper Information (now optional)
    shipperFirstName: z.string().optional().nullable(),
    shipperLastName: z.string().optional().nullable(),
    shipperContact: z.string().optional().nullable(),

    // Consignee Information (now optional)
    consigneeFirstName: z.string().optional().nullable(),
    consigneeLastName: z.string().optional().nullable(),
    consigneeContact: z.string().optional().nullable(),

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
    truckCompany: z
    .object({
        value: z.number(),
        label: z.string(),
    })
    .optional()
    .nullable(),

    // Dates
    departureDate: z.union([z.date(), z.string(), z.null()]).optional(),
    deliveryDate: z.union([z.date(), z.string(), z.null()]).optional(),

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
        const delivery = data.deliveryDate instanceof Date ? data.deliveryDate : new Date(data.deliveryDate);
        const departure = data.departureDate instanceof Date ? data.departureDate : new Date(data.departureDate);
        return delivery >= departure;
    }
    return true;
}, {
    message: 'Delivery date must be after or equal to departure date',
    path: ['deliveryDate'],
});

// Default values for the quote form
export const defaultQuoteValues = {
    // Customer Information
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",

    // Shipper Information
    shipperFirstName: "",
    shipperLastName: "",
    shipperContact: "",

    // Consignee Information
    consigneeFirstName: "",
    consigneeLastName: "",
    consigneeContact: "",

    // Shipping Details
    modeOfService: null,
    containerSize: null,
    containerQuantity: 1,
    origin: null,
    destination: null,
    shippingLine: null,
    truckCompany: null,

    // Dates
    departureDate: null,
    deliveryDate: null,

    // Locations
    pickupLocation: null,
    deliveryLocation: null,

    // Terms
    terms: 1,

    // Items - start with one empty item
    items: [
        {
            id: 1,
            name: "",
            weight: "",
            quantity: "",
            category: "",
            customCategory: "",
        },
    ],
};

// Schema for API request (transforms frontend data to backend format)
export const quoteApiSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email().optional(),
    contact_number: z.string().optional().nullable(),
    shipper_first_name: z.string().optional().nullable(),
    shipper_last_name: z.string().optional().nullable(),
    shipper_contact: z.string().optional().nullable(),
    consignee_first_name: z.string().optional().nullable(),
    consignee_last_name: z.string().optional().nullable(),
    consignee_contact: z.string().optional().nullable(),
    mode_of_service: z.string(),
    container_size_id: z.number(),
    container_quantity: z.number().min(1),
    origin_id: z.number(),
    destination_id: z.number(),
    shipping_line_id: z.number().optional().nullable(),
    truck_comp_id: z.number().optional().nullable(),
    departure_date: z.string().optional().nullable(),
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
export const transformQuoteToApi = (data) => {
    // Helper function to safely format dates
    const formatDate = (date) => {
        if (!date) return null;
        if (typeof date === 'string') return date;
        if (date instanceof Date) return date.toISOString().split("T")[0];
        return null;
    };

    return {
        first_name: data.firstName || '',
        last_name: data.lastName || '',
        email: data.email || '',
        contact_number: data.contactNumber || '',
        shipper_first_name: data.shipperFirstName || '',
        shipper_last_name: data.shipperLastName || '',
        shipper_contact: data.shipperContact || '',
        consignee_first_name: data.consigneeFirstName || '',
        consignee_last_name: data.consigneeLastName || '',
        consignee_contact: data.consigneeContact || '',
        mode_of_service: data.modeOfService.value,
        container_size_id: data.containerSize.value,
        container_quantity: data.containerQuantity,
        origin_id: data.origin.value,
        destination_id: data.destination.value,
        shipping_line_id: data.shippingLine?.value || null,
        truck_comp_id: data.truckCompany?.value || null,
        departure_date: formatDate(data.departureDate),
        delivery_date: formatDate(data.deliveryDate),
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
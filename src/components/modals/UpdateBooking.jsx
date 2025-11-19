// src/components/modals/UpdateBooking.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, X, ChevronUp, ChevronDown, Loader2, AlertCircle } from 'lucide-react';
import SharedModal from '../ui/SharedModal';
import { bookingSchema, defaultBookingValues, transformBookingToApi } from '../../schemas/bookingSchema';
import LocationFields from '../LocationFields';
import { useUser } from '../../hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';

const UpdateBooking = ({ isOpen, onClose, onUpdate, booking, isLoading = false }) => {
  const [items, setItems] = useState([
    { id: 1, name: "", weight: "", quantity: "", category: "", customCategory: "" },
  ]);
  const [departureDate, setDepartureDate] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [containerQuantity, setContainerQuantity] = useState(1);
  const [weightValidation, setWeightValidation] = useState({ isValid: true, message: "" });
  const [pickupLocation, setPickupLocation] = useState({});
  const [deliveryLocation, setDeliveryLocation] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [formTouched, setFormTouched] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('pending');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    mode: 'onBlur',
    defaultValues: {
      ...defaultBookingValues,
      containerQuantity: 1,
      terms: 1,
    },
    shouldFocusError: false,
    shouldUseNativeValidation: false,
  });

  const formData = watch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch users (customers only)
  const { usersQuery } = useUser();
  const { data: usersData, isLoading: usersLoading } = usersQuery({ role: 'customer' });

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
  });

  // Fetch ports
  const { data: portsData, isLoading: portsLoading } = useQuery({
    queryKey: ['ports'],
    queryFn: async () => {
      const res = await api.get('/ports');
      return res.data;
    },
  });

  // Fetch container types
  const { data: containerTypesData, isLoading: containerTypesLoading } = useQuery({
    queryKey: ['container-types'],
    queryFn: async () => {
      const res = await api.get('/container-types');
      return res.data;
    },
  });

  // Fetch shipping lines
  const { data: shippingLinesData, isLoading: shippingLinesLoading } = useQuery({
    queryKey: ['shipping-lines'],
    queryFn: async () => {
      const res = await api.get('/shipping-lines');
      return res.data;
    },
  });

  // Fetch truck companies
  const { data: truckCompsData, isLoading: truckCompsLoading } = useQuery({
    queryKey: ['truck-comps'],
    queryFn: async () => {
      const res = await api.get('/truck-comps');
      return res.data;
    },
  });

  // Generate options
  const userOptions = React.useMemo(() => {
    if (!usersData?.data) return [];
    const customers = usersData.data.filter(user => user.role === 'customer' || user.role === 'user');
    return customers.map(user => ({
      value: user.id,
      label: `${user.first_name} ${user.last_name} (${user.email})`,
      userData: user,
    }));
  }, [usersData]);

  const containerOptions = React.useMemo(() => {
    if (!containerTypesData?.data) return [];
    return containerTypesData.data.map(container => ({
      value: container.id,
      label: `${container.size}`,
      max_weight: parseFloat(container.max_weight) || 0,
    }));
  }, [containerTypesData]);

  const categoryOptions = React.useMemo(() => {
    if (!categoriesData?.data) return [];
    const baseOptions = categoriesData.data.map(category => ({
      value: category.name,
      label: category.name,
    }));
    return [...baseOptions, { value: "other", label: "Other" }];
  }, [categoriesData]);

  const portOptions = React.useMemo(() => {
    if (!portsData?.data) return [];
    return portsData.data.map(port => ({
      value: port.id,
      label: `${port.name} (${port.route_name})`,
    }));
  }, [portsData]);

  const shippingLineOptions = React.useMemo(() => {
    if (!shippingLinesData?.data) return [];
    return shippingLinesData.data.map(line => ({
      value: line.id,
      label: line.name,
    }));
  }, [shippingLinesData]);

  const truckCompanyOptions = React.useMemo(() => {
    if (!truckCompsData?.data) return [];
    return truckCompsData.data.map(truck => ({
      value: truck.id,
      label: truck.name,
    }));
  }, [truckCompsData]);

  const modeOptions = [
    { value: "port-to-port", label: "Port to Port" },
    { value: "door-to-door", label: "Door to Door" },
    { value: "port-to-door", label: "Port to Door" },
    { value: "door-to-port", label: "Door to Port" },
  ];

  const bookingStatusOptions = [
    { value: "pending", label: "Pending" },
    { value: "in_transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
  ];

  // Populate form with booking data when modal opens or booking changes
  useEffect(() => {
    if (isOpen && booking) {
      // Reset form first
      reset({
        ...defaultBookingValues,
        containerQuantity: 1,
        terms: 1,
      });

      // Populate form with booking data
      const populateForm = async () => {
        try {
          // Set basic fields
          setValue('userId', booking.user_id);
          setValue('shipperFirstName', booking.shipper_first_name);
          setValue('shipperLastName', booking.shipper_last_name);
          setValue('shipperContact', booking.shipper_contact || '');
          setValue('consigneeFirstName', booking.consignee_first_name);
          setValue('consigneeLastName', booking.consignee_last_name);
          setValue('consigneeContact', booking.consignee_contact || '');
          setValue('terms', booking.terms || 1);

          // Set select fields
          if (booking.mode_of_service) {
            setValue('modeOfService', modeOptions.find(opt => opt.value === booking.mode_of_service) || null);
          }
          
          if (booking.container_size_id) {
            const containerOption = containerOptions.find(opt => opt.value === booking.container_size_id);
            setValue('containerSize', containerOption || null);
          }
          
          if (booking.origin_id) {
            const originOption = portOptions.find(opt => opt.value === booking.origin_id);
            setValue('origin', originOption || null);
          }
          
          if (booking.destination_id) {
            const destinationOption = portOptions.find(opt => opt.value === booking.destination_id);
            setValue('destination', destinationOption || null);
          }
          
          if (booking.shipping_line_id) {
            const shippingLineOption = shippingLineOptions.find(opt => opt.value === booking.shipping_line_id);
            setValue('shippingLine', shippingLineOption || null);
          }
          
          if (booking.truck_comp_id) {
            const truckCompanyOption = truckCompanyOptions.find(opt => opt.value === booking.truck_comp_id);
            setValue('truckCompany', truckCompanyOption || null);
          }

          // Set user selection
          if (booking.user_id) {
            const userOption = userOptions.find(opt => opt.value === booking.user_id);
            setSelectedUser(userOption || null);
          }

          // Set dates
          if (booking.departure_date) {
            setDepartureDate(new Date(booking.departure_date));
            setValue('departureDate', new Date(booking.departure_date));
          }
          
          if (booking.delivery_date) {
            setDeliveryDate(new Date(booking.delivery_date));
            setValue('deliveryDate', new Date(booking.delivery_date));
          }

          // Set container quantity
          if (booking.container_quantity) {
            setContainerQuantity(booking.container_quantity);
            setValue('containerQuantity', booking.container_quantity);
          }

          // Set locations
          if (booking.pickup_location) {
            setPickupLocation(booking.pickup_location);
            setValue('pickupLocation', booking.pickup_location);
          }
          
          if (booking.delivery_location) {
            setDeliveryLocation(booking.delivery_location);
            setValue('deliveryLocation', booking.delivery_location);
          }

          // Set items
          if (booking.items && booking.items.length > 0) {
            const formattedItems = booking.items.map((item, index) => ({
              id: index + 1,
              name: item.name || '',
              weight: item.weight?.toString() || '',
              quantity: item.quantity?.toString() || '',
              category: item.category || '',
              customCategory: item.category || '',
            }));
            setItems(formattedItems);
          }

          // Set booking status
          if (booking.booking_status) {
            setBookingStatus(booking.booking_status);
          }

        } catch (error) {
          console.error('Error populating form:', error);
        }
      };

      populateForm();
    }
  }, [isOpen, booking, reset, setValue, containerOptions, portOptions, shippingLineOptions, truckCompanyOptions, userOptions, modeOptions]);

  // Handle form field changes to set touched state
  const handleFieldChange = (field, value, options = {}) => {
    setFormTouched(true);
    if (options.setValue) {
      setValue(field, value, { shouldValidate: true });
    }
  };

  // Handle user selection
  const handleUserSelect = (selectedOption) => {
    setSelectedUser(selectedOption);
    setFormTouched(true);

    if (selectedOption?.userData) {
      setValue("userId", selectedOption.value, { shouldValidate: true });
    } else {
      setValue("userId", null, { shouldValidate: true });
    }

    setTimeout(() => {
      trigger(['userId']);
    }, 100);
  };

  // Calculate total weight
  const calculateTotalWeight = () => {
    return items.reduce((total, item) => {
      const weight = parseFloat(item.weight) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (weight * quantity);
    }, 0);
  };

  // Validate weight against container capacity
  useEffect(() => {
    if (formData.containerSize && items.length > 0) {
      const totalWeight = calculateTotalWeight();
      const selectedContainer = containerOptions.find(opt => opt.value === formData.containerSize.value);

      if (selectedContainer && totalWeight > 0) {
        const maxWeight = (selectedContainer.max_weight || 0) * containerQuantity;
        if (totalWeight > maxWeight) {
          const excessWeight = (totalWeight - maxWeight).toFixed(2);
          setWeightValidation({
            isValid: false,
            message: `Total weight (${totalWeight.toFixed(2)} kg) exceeds container capacity (${maxWeight.toFixed(2)} kg) by ${excessWeight} kg. Please add more containers or choose a larger container size.`
          });
        } else {
          const remainingCapacity = (maxWeight - totalWeight).toFixed(2);
          setWeightValidation({
            isValid: true,
            message: `Total weight: ${totalWeight.toFixed(2)} kg / ${maxWeight.toFixed(2)} kg (${remainingCapacity} kg remaining capacity)`
          });
        }
      } else {
        setWeightValidation({ isValid: true, message: "" });
      }
    } else {
      setWeightValidation({ isValid: true, message: "" });
    }
  }, [items, formData.containerSize, containerQuantity, containerOptions]);

  // Item management
  const addItem = () => {
    setItems((s) => [...s, {
      id: Date.now(),
      name: "",
      weight: "",
      quantity: "",
      category: "",
      customCategory: "",
    }]);
    setFormTouched(true);
  };

  const removeItem = (id) => {
    setItems((s) => s.filter((it) => it.id !== id));
    setFormTouched(true);
  };

  const handleItemChange = (id, field, value) => {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
    setFormTouched(true);
  };

  const handleCategoryChange = (id, selectedOption) => {
    const categoryValue = selectedOption?.value || "";
    handleItemChange(id, "category", categoryValue);
    if (categoryValue !== "other") {
      handleItemChange(id, "customCategory", "");
    }
  };

  // Handle terms change
  const handleTermsChange = (value) => {
    setFormTouched(true);
    if (value === "" || /^\d*$/.test(value)) {
      const numValue = value === "" ? 1 : parseInt(value);
      setValue("terms", numValue, { shouldValidate: true });
    }
  };

  // Container quantity increment/decrement
  const incrementContainerQuantity = () => {
    setFormTouched(true);
    const newQuantity = containerQuantity + 1;
    setContainerQuantity(newQuantity);
    setValue("containerQuantity", newQuantity, { shouldValidate: true });
  };

  const decrementContainerQuantity = () => {
    setFormTouched(true);
    const newQuantity = containerQuantity > 1 ? containerQuantity - 1 : 1;
    setContainerQuantity(newQuantity);
    setValue("containerQuantity", newQuantity, { shouldValidate: true });
  };

  // Mode-based visibility
  const modeValue = formData.modeOfService?.value || null;
  const showPickup = modeValue === "door-to-door" || modeValue === "door-to-port";
  const showDelivery = modeValue === "door-to-door" || modeValue === "port-to-door";

  // Check if form is valid for submission
  const isFormValid = () => {
    const hasRequiredFields =
      formData.userId && 
      formData.shipperFirstName &&
      formData.shipperLastName &&
      formData.consigneeFirstName &&
      formData.consigneeLastName &&
      formData.modeOfService?.value &&
      formData.containerSize?.value &&
      formData.origin?.value &&
      formData.destination?.value &&
      (Number.isInteger(formData.terms) ? formData.terms > 0 : formData.terms) &&
      items.length > 0;

    const itemsValid = items.every(item => {
      const hasCategory = item.category && (item.category !== "other" || item.customCategory);
      const hasWeight = item.weight !== "" && !isNaN(parseFloat(item.weight)) && parseFloat(item.weight) > 0;
      const hasQuantity = item.quantity !== "" && !isNaN(parseInt(item.quantity)) && parseInt(item.quantity) > 0;
      return item.name && hasWeight && hasQuantity && hasCategory;
    });

    const weightValid = weightValidation.isValid;

    return hasRequiredFields && itemsValid && weightValid;
  };

  // Custom DatePicker input
  const DateInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <div className="relative">
      <input
        ref={ref}
        onClick={onClick}
        value={value || ""}
        readOnly
        placeholder={placeholder}
        className="modal-input pr-10 cursor-pointer"
      />
      <button
        type="button"
        onClick={onClick}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
        aria-label="open-calendar"
      >
        <Calendar className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  ));
  DateInput.displayName = "DateInput";

  // Custom Container Quantity Input
  const ContainerQuantityInput = () => (
    <div className="relative">
      <input
        type="number"
        className="modal-input pr-16"
        value={containerQuantity}
        onChange={(e) => {
          setFormTouched(true);
          const value = parseInt(e.target.value) || 1;
          const val = value > 0 ? value : 1;
          setContainerQuantity(val);
          setValue("containerQuantity", val, { shouldValidate: true });
        }}
        min="1"
        required
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
        <button
          type="button"
          onClick={incrementContainerQuantity}
          className="p-1 hover:bg-gray-100 rounded-t-md transition-colors"
          aria-label="Increase quantity"
        >
          <ChevronUp className="w-3 h-3 text-gray-500" />
        </button>
        <button
          type="button"
          onClick={decrementContainerQuantity}
          className="p-1 hover:bg-gray-100 rounded-b-md transition-colors"
          aria-label="Decrease quantity"
        >
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </button>
      </div>
    </div>
  );

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);

      const bookingData = {
        ...data,
        containerQuantity,
        departureDate: departureDate ?? null,
        deliveryDate: deliveryDate ?? null,
        pickupLocation: showPickup && Object.keys(pickupLocation).length > 0 ? pickupLocation : null,
        deliveryLocation: showDelivery && Object.keys(deliveryLocation).length > 0 ? deliveryLocation : null,
        terms: parseInt(data.terms) || 1,
        booking_status: bookingStatus, // Include booking status
        items: items.map(item => ({
          name: item.name,
          weight: parseFloat(item.weight),
          quantity: parseInt(item.quantity),
          category: item.category === "other" ? item.customCategory : item.category,
        })),
      };

      const validatedData = bookingSchema.parse(bookingData);
      const apiData = transformBookingToApi(validatedData);
      
      // Include tracking numbers and booking status in the update
      const updateData = {
        ...apiData,
        booking_status: bookingStatus,
        booking_number: booking?.booking_number,
        hwb_number: booking?.hwb_number,
        van_number: booking?.van_number,
      };

      await onUpdate(booking.id, updateData);

    } catch (error) {
      if (error?.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map(err => err.message);
        alert(`Validation error: ${errorMessages.join(', ')}`);
      } else if (error?.response) {
        alert(`API Error: ${error.response.data.message || 'Failed to update booking'}`);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const responsiveGrid = "grid grid-cols-1 md:grid-cols-2 gap-4";

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Update Booking" size="md">
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Tracking Numbers Section - NEW */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heading border-b border-main pb-2">
            Tracking Information
          </h3>
          <div className={responsiveGrid}>
            <div>
              <label className="modal-label">Booking Number</label>
              <input
                type="text"
                value={booking?.booking_number || 'Not generated'}
                className="modal-input bg-gray-100 cursor-not-allowed"
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="modal-label">HWB Number</label>
              <input
                type="text"
                value={booking?.hwb_number || 'Not generated'}
                className="modal-input bg-gray-100 cursor-not-allowed"
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="modal-label">Van Number</label>
              <input
                type="text"
                value={booking?.van_number || 'Not generated'}
                className="modal-input bg-gray-100 cursor-not-allowed"
                readOnly
                disabled
              />
            </div>
            <div>
              <label className="modal-label">Booking Status</label>
              <Select
                options={bookingStatusOptions}
                value={bookingStatusOptions.find(opt => opt.value === bookingStatus)}
                onChange={(selected) => setBookingStatus(selected.value)}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select booking status"
              />
            </div>
          </div>
        </div>

        {/* Customer Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heading border-b border-main pb-2">
            Customer Information
          </h3>
          <div>
            <label className="modal-label">Select Customer</label>
            <Select
              options={userOptions}
              value={selectedUser}
              onChange={handleUserSelect}
              className={`react-select-container ${formTouched && errors.userId ? 'border-red-500' : ''}`}
              classNamePrefix="react-select"
              placeholder="Select customer"
              isLoading={usersLoading}
              isClearable
            />
            {formTouched && errors.userId && <span className="modal-error">{errors.userId.message}</span>}
          </div>

          {selectedUser?.userData && (
            <div className="email-notice border border-blue-700 bg-blue-900">
              <div className="flex items-start gap-4 pl-4">
                <AlertCircle className="email-notice-icon text-blue-100" />
                <div className="email-notice-text text-blue-200">
                  <p><strong>Customer:</strong> {selectedUser.userData.first_name} {selectedUser.userData.last_name}</p>
                  <p><strong>Email:</strong> {selectedUser.userData.email}</p>
                  {selectedUser.userData.contact_number && (
                    <p><strong>Contact:</strong> {selectedUser.userData.contact_number}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shipper Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heading border-b border-main pb-2">
            Shipper Information
          </h3>
          <div className={responsiveGrid}>
            <div>
              <label className="modal-label">Shipper First Name</label>
              <input
                type="text"
                placeholder="Enter shipper's first name"
                className={`modal-input ${formTouched && errors.shipperFirstName ? 'border-red-500' : ''}`}
                {...register('shipperFirstName', {
                  onChange: () => setFormTouched(true)
                })}
              />
              {formTouched && errors.shipperFirstName && <span className="modal-error">{errors.shipperFirstName.message}</span>}
            </div>
            <div>
              <label className="modal-label">Shipper Last Name</label>
              <input
                type="text"
                placeholder="Enter shipper's last name"
                className={`modal-input ${formTouched && errors.shipperLastName ? 'border-red-500' : ''}`}
                {...register('shipperLastName', {
                  onChange: () => setFormTouched(true)
                })}
              />
              {formTouched && errors.shipperLastName && <span className="modal-error">{errors.shipperLastName.message}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="modal-label">Contact Number (Optional)</label>
              <input
                type="tel"
                placeholder="Enter shipper's contact number"
                className="modal-input"
                {...register('shipperContact')}
                onInput={(e) => { e.target.value = e.target.value.replace(/[^\d]/g, ''); }}
              />
            </div>
          </div>
        </div>

        {/* Consignee Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heading border-b border-main pb-2">
            Consignee Information
          </h3>
          <div className={responsiveGrid}>
            <div>
              <label className="modal-label">Consignee First Name</label>
              <input
                type="text"
                placeholder="Enter consignee's first name"
                className={`modal-input ${formTouched && errors.consigneeFirstName ? 'border-red-500' : ''}`}
                {...register('consigneeFirstName', {
                  onChange: () => setFormTouched(true)
                })}
              />
              {formTouched && errors.consigneeFirstName && <span className="modal-error">{errors.consigneeFirstName.message}</span>}
            </div>
            <div>
              <label className="modal-label">Consignee Last Name</label>
              <input
                type="text"
                placeholder="Enter consignee's last name"
                className={`modal-input ${formTouched && errors.consigneeLastName ? 'border-red-500' : ''}`}
                {...register('consigneeLastName', {
                  onChange: () => setFormTouched(true)
                })}
              />
              {formTouched && errors.consigneeLastName && <span className="modal-error">{errors.consigneeLastName.message}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="modal-label">Contact Number (Optional)</label>
              <input
                type="tel"
                placeholder="Enter consignee's contact number"
                className="modal-input"
                {...register('consigneeContact')}
                onInput={(e) => { e.target.value = e.target.value.replace(/[^\d]/g, ''); }}
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heading border-b border-main pb-2">
            Item / Commodity Information
          </h3>
          {items.map((it, idx) => {
            const showCustomCategory = it.category === "other";
            const selectedCategory = categoryOptions.find((o) => o.value === it.category) || null;

            return (
              <div key={it.id} className="bg-main border border-main rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-heading">Item {idx + 1}</h4>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(it.id)} className="text-red-500 hover:text-red-700">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className={responsiveGrid}>
                  <div>
                    <label className="modal-label">Item Name</label>
                    <input
                      className="modal-input"
                      value={it.name}
                      onChange={(e) => handleItemChange(it.id, "name", e.target.value)}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div>
                    <label className="modal-label">Category</label>
                    <Select
                      options={categoryOptions}
                      value={selectedCategory}
                      onChange={(s) => handleCategoryChange(it.id, s)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select category"
                      isLoading={categoriesLoading}
                    />
                    {showCustomCategory && (
                      <div className="mt-2">
                        <label className="modal-label">Category Name</label>
                        <input
                          className="modal-input"
                          value={it.customCategory}
                          onChange={(e) => handleItemChange(it.id, "customCategory", e.target.value)}
                          placeholder="Please specify category name"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="modal-label">Weight (kg)</label>
                    <input
                      type="number"
                      className="modal-input"
                      value={it.weight}
                      onChange={(e) => handleItemChange(it.id, "weight", e.target.value)}
                      placeholder="Enter weight in kg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="modal-label">Quantity</label>
                    <input
                      type="number"
                      className="modal-input"
                      value={it.quantity}
                      onChange={(e) => handleItemChange(it.id, "quantity", e.target.value)}
                      placeholder="Enter quantity"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" onClick={addItem} className="text-primary font-medium text-sm hover:underline">
            + Add another item
          </button>
        </div>

        {/* Shipping Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heading border-b border-main pb-2">
            Shipping Preferences
          </h3>

          {/* Basic Shipping Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-heading">Basic Details</h4>
            <div className={responsiveGrid}>
              {/* Mode of Service */}
              <div>
                <label className="modal-label">Mode of Service</label>
                <Select
                  options={modeOptions}
                  value={formData.modeOfService}
                  onChange={(s) => handleFieldChange("modeOfService", s, { setValue: true })}
                  className={`react-select-container ${formTouched && errors.modeOfService ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select mode of service"
                />
                {formTouched && errors.modeOfService && <span className="modal-error">{errors.modeOfService.message}</span>}
              </div>
              <div>
                <label className="modal-label">Terms (Days)</label>
                <input
                  type="text"
                  className={`modal-input ${formTouched && errors.terms ? 'border-red-500' : ''}`}
                  placeholder="Enter terms in days"
                  value={formData.terms || ""}
                  onChange={(e) => handleTermsChange(e.target.value)}
                />
                {formTouched && errors.terms && <span className="modal-error">{errors.terms.message}</span>}
              </div>
            </div>
          </div>

          {/* Container Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-heading">Container Information</h4>
            <div className={responsiveGrid}>
              <div>
                <label className="modal-label">Container Type</label>
                <Select
                  options={containerOptions}
                  value={formData.containerSize}
                  onChange={(s) => handleFieldChange("containerSize", s, { setValue: true })}
                  className={`react-select-container ${formTouched && errors.containerSize ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select container type"
                  isLoading={containerTypesLoading}
                />
                {formTouched && errors.containerSize && <span className="modal-error">{errors.containerSize.message}</span>}
              </div>
              {formData.containerSize && (
                <div>
                  <label className="modal-label">Container Quantity</label>
                  <ContainerQuantityInput />
                </div>
              )}
            </div>

            {/* Weight Display */}
            {items.some(item => item.weight && item.quantity) && formData.containerSize && (
              <div className={`email-notice ${
                !weightValidation.isValid
                  ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900'
                  : 'border-blue-600 bg-white dark:border-blue-700 dark:bg-blue-900'
              }`}>
                <div className="flex items-start gap-4 pl-4">
                  <AlertCircle className={`email-notice-icon ${
                    !weightValidation.isValid
                      ? 'text-red-600 dark:text-red-100'
                      : 'text-blue-600 dark:text-blue-100'
                  }`} />
                  <p className={`email-notice-text ${
                    !weightValidation.isValid
                      ? 'text-red-700 dark:text-red-200'
                      : 'text-black dark:text-blue-200'
                  }`}>
                    <strong className={`email-notice-heading ${
                      !weightValidation.isValid
                        ? 'text-red-600 dark:text-red-100'
                        : 'text-blue-600 dark:text-blue-100'
                    }`}>
                      {!weightValidation.isValid ? 'Weight Capacity Exceeded:' : 'Weight Status:'}
                    </strong>{' '}
                    {weightValidation.message}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Route Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-heading">Route Information</h4>
            <div className={responsiveGrid}>
              {/* Origin Port */}
              <div>
                <label className="modal-label">Origin Port</label>
                <Select
                  options={portOptions}
                  value={formData.origin}
                  onChange={(s) => handleFieldChange("origin", s, { setValue: true })}
                  className={`react-select-container ${formTouched && errors.origin ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select origin port"
                  isLoading={portsLoading}
                />
                {formTouched && errors.origin && <span className="modal-error">{errors.origin.message}</span>}
              </div>

              {/* Destination Port */}
              <div>
                <label className="modal-label">Destination Port</label>
                <Select
                  options={portOptions}
                  value={formData.destination}
                  onChange={(s) => handleFieldChange("destination", s, { setValue: true })}
                  className={`react-select-container ${formTouched && errors.destination ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select destination port"
                  isLoading={portsLoading}
                />
                {formTouched && errors.destination && <span className="modal-error">{errors.destination.message}</span>}
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-heading">Schedule</h4>
            <div className={responsiveGrid}>
              <div>
                <label className="modal-label">Preferred Departure Date (Optional)</label>
                <DatePicker
                  selected={departureDate}
                  onChange={(date) => {
                    setFormTouched(true);
                    setDepartureDate(date);
                    setValue('departureDate', date, { shouldValidate: true });
                  }}
                  customInput={<DateInput placeholder="Select preferred departure date" />}
                  minDate={new Date()}
                />
              </div>
              <div>
                <label className="modal-label">Preferred Delivery Date (Optional)</label>
                <DatePicker
                  selected={deliveryDate}
                  onChange={(date) => {
                    setFormTouched(true);
                    setDeliveryDate(date);
                    setValue('deliveryDate', date, { shouldValidate: true });
                  }}
                  customInput={<DateInput placeholder="Select preferred delivery date" />}
                  minDate={departureDate}
                />
              </div>
            </div>
          </div>

          {/* Service Providers */}
          <div className="space-y-4">
            <h4 className="font-semibold text-heading">Service Providers</h4>
            <div className={responsiveGrid}>
              <div>
                <label className="modal-label">Preferred Shipping Line</label>
                <Select
                  options={shippingLineOptions}
                  value={formData.shippingLine}
                  onChange={(s) => handleFieldChange("shippingLine", s, { setValue: true })}
                  className={`react-select-container ${formTouched && errors.shippingLine ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select shipping line"
                  isLoading={shippingLinesLoading}
                />
              </div>
              <div>
                <label className="modal-label">Preferred Trucking Company</label>
                <Select
                  options={truckCompanyOptions}
                  value={formData.truckCompany}
                  onChange={(s) => handleFieldChange("truckCompany", s, { setValue: true })}
                  className={`react-select-container ${formTouched && errors.truckCompany ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select trucking company"
                  isLoading={truckCompsLoading}
                />
              </div>
            </div>
          </div>

          {/* Location fields */}
          {showPickup && (
            <div className="bg-main border border-main rounded-lg p-4">
              <h4 className="font-semibold text-heading mb-4">Pickup Location</h4>
              <LocationFields
                type="pickup"
                value={pickupLocation}
                onChange={(val) => {
                  setFormTouched(true);
                  setPickupLocation(val);
                  setValue('pickupLocation', val, { shouldValidate: true });
                }}
                showStreetSearch={true}
              />
            </div>
          )}

          {showDelivery && (
            <div className="bg-main border border-main rounded-lg p-4">
              <h4 className="font-semibold text-heading mb-4">Delivery Location</h4>
              <LocationFields
                type="delivery"
                value={deliveryLocation}
                onChange={(val) => {
                  setFormTouched(true);
                  setDeliveryLocation(val);
                  setValue('deliveryLocation', val, { shouldValidate: true });
                }}
                showStreetSearch={true}
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-main">
          <button
            type="button"
            onClick={onClose}
            className={`modal-btn-cancel ${isSubmitting ? 'modal-btn-disabled' : ''}`}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              // Manually gather all form data exactly like the bypass button
              const formData = watch();
              const bookingData = {
                ...formData,
                containerQuantity,
                departureDate: departureDate ?? null,
                deliveryDate: deliveryDate ?? null,
                pickupLocation: showPickup && Object.keys(pickupLocation).length > 0 ? pickupLocation : null,
                deliveryLocation: showDelivery && Object.keys(deliveryLocation).length > 0 ? deliveryLocation : null,
                terms: parseInt(formData.terms) || 1,
                booking_status: bookingStatus,
                items: items.map(item => ({
                  name: item.name,
                  weight: parseFloat(item.weight),
                  quantity: parseInt(item.quantity),
                  category: item.category === "other" ? item.customCategory : item.category,
                })),
              };
              
              // Call onSubmit directly with the manually gathered data
              onSubmit(bookingData);
            }}
            className={`modal-btn-primary ${(!isFormValid() || isSubmitting) ? 'modal-btn-disabled' : ''}`}
            disabled={!isFormValid() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Booking'
            )}
          </button>
        </div>
      </div>
    </SharedModal>
  );
};

export default UpdateBooking;
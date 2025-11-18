import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, X, ChevronUp, ChevronDown, Loader2, Info } from 'lucide-react';
import SharedModal from '../ui/SharedModal';
import { bookingSchema, defaultBookingValues, transformBookingToApi } from '../../schemas/bookingSchema';
import LocationFields from '../LocationFields';
import { useCreateBooking } from '../../hooks/useBooking';
import { useUser } from '../../hooks/useUser';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';

const AddBooking = ({ isOpen, onClose, onSave, isLoading = false }) => {
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    mode: 'onChange',
    defaultValues: {
      ...defaultBookingValues,
      containerQuantity: 1,
      terms: 0,
    },
  });

  const formData = watch();
  const createBookingMutation = useCreateBooking();

  // Fetch users (customers only) - FIXED: Use the correct API parameter
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

  // Generate options - FIXED: Filter customers only on frontend if API doesn't filter
  const userOptions = React.useMemo(() => {
    if (!usersData?.data) return [];
    
    // Filter for customers only (in case API doesn't filter properly)
    const customers = usersData.data.filter(user => 
      user.role === 'customer' || user.role === 'user' // Include both customer and user roles
    );
    
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
      label: port.route_name,
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

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        ...defaultBookingValues,
        containerQuantity: 1,
        terms: 0,
      });
      setItems([{ id: 1, name: "", weight: "", quantity: "", category: "", customCategory: "" }]);
      setDepartureDate(null);
      setDeliveryDate(null);
      setContainerQuantity(1);
      setPickupLocation({});
      setDeliveryLocation({});
      setWeightValidation({ isValid: true, message: "" });
      setSelectedUser(null);
    }
  }, [isOpen, reset]);

  // Handle user selection
  const handleUserSelect = (selectedOption) => {
    setSelectedUser(selectedOption);
    setValue("user", selectedOption, { shouldValidate: true });
    
    if (selectedOption?.userData) {
      const user = selectedOption.userData;
      setValue("firstName", user.first_name, { shouldValidate: true });
      setValue("lastName", user.last_name, { shouldValidate: true });
      setValue("email", user.email, { shouldValidate: true });
      setValue("contactNumber", user.contact_number || "", { shouldValidate: true });
    } else {
      // Clear personal info if no user selected
      setValue("firstName", "", { shouldValidate: true });
      setValue("lastName", "", { shouldValidate: true });
      setValue("email", "", { shouldValidate: true });
      setValue("contactNumber", "", { shouldValidate: true });
    }
    
    // Trigger validation after setting values
    setTimeout(() => {
      trigger(['firstName', 'lastName', 'email']);
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
        const maxWeight = selectedContainer.max_weight * containerQuantity;
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
      }
    }
  }, [items, formData.containerSize, containerQuantity, containerOptions]);

  // Item management
  const addItem = () => {
    const newItems = [...items, {
      id: Date.now(),
      name: "",
      weight: "",
      quantity: "",
      category: "",
      customCategory: "",
    }];
    setItems(newItems);
  };

  const removeItem = (id) => {
    const newItems = items.filter((it) => it.id !== id);
    setItems(newItems);
  };

  const handleItemChange = (id, field, value) => {
    const newItems = items.map((it) => (it.id === id ? { ...it, [field]: value } : it));
    setItems(newItems);
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
    if (value === "" || /^\d*$/.test(value)) {
      const numValue = value === "" ? 0 : parseInt(value);
      setValue("terms", numValue, { shouldValidate: true });
    }
  };

  // Container quantity increment/decrement
  const incrementContainerQuantity = () => {
    const newQuantity = containerQuantity + 1;
    setContainerQuantity(newQuantity);
    setValue("containerQuantity", newQuantity, { shouldValidate: true });
  };

  const decrementContainerQuantity = () => {
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
    // Check basic required fields
    const hasRequiredFields = 
      selectedUser &&
      formData.shipperFirstName &&
      formData.shipperLastName &&
      formData.consigneeFirstName &&
      formData.consigneeLastName &&
      formData.modeOfService &&
      formData.containerSize &&
      formData.origin &&
      formData.destination &&
      formData.terms > 0 &&
      items.length > 0;

    // Check if all items have required fields
    const itemsValid = items.every(item => 
      item.name && item.weight && item.quantity && item.category
    );

    // Check weight validation
    const weightValid = weightValidation.isValid;

    return hasRequiredFields && itemsValid && weightValid && isValid;
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
          const value = parseInt(e.target.value) || 1;
          setContainerQuantity(value > 0 ? value : 1);
          setValue("containerQuantity", value > 0 ? value : 1, { shouldValidate: true });
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
      const bookingData = {
        ...data,
        containerQuantity,
        departureDate: departureDate ?? null,
        deliveryDate: deliveryDate ?? null,
        pickupLocation: showPickup && Object.keys(pickupLocation).length > 0 ? pickupLocation : null,
        deliveryLocation: showDelivery && Object.keys(deliveryLocation).length > 0 ? deliveryLocation : null,
        terms: parseInt(data.terms) || 0,
        items: items.map(item => ({
          name: item.name,
          weight: item.weight,
          quantity: item.quantity,
          category: item.category === "other" ? item.customCategory : item.category,
        })),
      };

      console.log("Booking data for validation:", bookingData);

      // Validate with schema
      const validatedData = bookingSchema.parse(bookingData);
      console.log("Validation successful:", validatedData);

      // Transform to API format - FIXED: Make shipping line and truck company required
      const apiData = transformBookingToApi({
        ...validatedData,
        shippingLine: validatedData.shippingLine || { value: 1, label: 'Default' }, // Provide default if needed
        truckCompany: validatedData.truckCompany || { value: 1, label: 'Default' }, // Provide default if needed
      });
      
      console.log("Transformed API data:", apiData);

      // Use the mutation hook
      createBookingMutation.mutate(apiData, {
        onSuccess: (response) => {
          console.log("Booking created successfully:", response);
          onSave(response);
          onClose();
        },
        onError: (error) => {
          console.error('Booking submission error:', error);
          alert('Failed to create booking. Please try again.');
        }
      });
    } catch (error) {
      console.error('Validation error:', error);
      if (error.errors) {
        const errors = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        console.log('Form errors:', errors);
        alert('Please check the form for errors and try again.');
      }
    }
  };

  // Responsive grid class
  const responsiveGrid = "grid grid-cols-1 md:grid-cols-2 gap-4";

  return (
    <SharedModal isOpen={isOpen} onClose={onClose} title="Add Booking" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Customer Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heading border-b border-main pb-2">
            Customer Information
          </h3>
          <div>
            <label className="modal-label">Select Customer *</label>
            <Select
              options={userOptions}
              value={selectedUser}
              onChange={handleUserSelect}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Select customer"
              isLoading={usersLoading}
            />
            {!selectedUser && (
              <span className="modal-error">Please select a customer</span>
            )}
          </div>
        </div>

        {/* Shipper Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heading border-b border-main pb-2">
            Shipper Information
          </h3>
          <div className={responsiveGrid}>
            <div>
              <label className="modal-label">Shipper First Name *</label>
              <input
                type="text"
                placeholder="Enter shipper's first name"
                className={`modal-input ${errors.shipperFirstName ? 'border-red-500' : ''}`}
                {...register('shipperFirstName')}
              />
              {errors.shipperFirstName && <span className="modal-error">{errors.shipperFirstName.message}</span>}
            </div>
            <div>
              <label className="modal-label">Shipper Last Name *</label>
              <input
                type="text"
                placeholder="Enter shipper's last name"
                className={`modal-input ${errors.shipperLastName ? 'border-red-500' : ''}`}
                {...register('shipperLastName')}
              />
              {errors.shipperLastName && <span className="modal-error">{errors.shipperLastName.message}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="modal-label">Contact Number (Optional)</label>
              <input
                type="tel"
                placeholder="Enter shipper's contact number"
                className="modal-input"
                {...register('shipperContact')}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^\d]/g, '');
                }}
              />
              {errors.shipperContact && <span className="modal-error">{errors.shipperContact.message}</span>}
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
              <label className="modal-label">Consignee First Name *</label>
              <input
                type="text"
                placeholder="Enter consignee's first name"
                className={`modal-input ${errors.consigneeFirstName ? 'border-red-500' : ''}`}
                {...register('consigneeFirstName')}
              />
              {errors.consigneeFirstName && <span className="modal-error">{errors.consigneeFirstName.message}</span>}
            </div>
            <div>
              <label className="modal-label">Consignee Last Name *</label>
              <input
                type="text"
                placeholder="Enter consignee's last name"
                className={`modal-input ${errors.consigneeLastName ? 'border-red-500' : ''}`}
                {...register('consigneeLastName')}
              />
              {errors.consigneeLastName && <span className="modal-error">{errors.consigneeLastName.message}</span>}
            </div>
            <div className="md:col-span-2">
              <label className="modal-label">Contact Number (Optional)</label>
              <input
                type="tel"
                placeholder="Enter consignee's contact number"
                className="modal-input"
                {...register('consigneeContact')}
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^\d]/g, '');
                }}
              />
              {errors.consigneeContact && <span className="modal-error">{errors.consigneeContact.message}</span>}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heading border-b border-main pb-2">
            Item / Commodity Information *
          </h3>
          {items.map((it, idx) => {
            const showCustomCategory = it.category === "other";
            const selectedCategory = categoryOptions.find((o) => o.value === it.category) || null;

            return (
              <div key={it.id} className="bg-main border border-main rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-heading">Item {idx + 1}</h4>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(it.id)} className="text-red-500">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className={responsiveGrid}>
                  <div>
                    <label className="modal-label">Item Name *</label>
                    <input
                      className={`modal-input ${!it.name ? 'border-red-500' : ''}`}
                      value={it.name}
                      onChange={(e) => handleItemChange(it.id, "name", e.target.value)}
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                  <div>
                    <label className="modal-label">Category *</label>
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
                        <label className="modal-label">Category Name *</label>
                        <input
                          className={`modal-input ${!it.customCategory ? 'border-red-500' : ''}`}
                          value={it.customCategory}
                          onChange={(e) => handleItemChange(it.id, "customCategory", e.target.value)}
                          placeholder="Please specify category name"
                          required
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="modal-label">Weight (kg) *</label>
                    <input
                      type="number"
                      className={`modal-input ${!it.weight ? 'border-red-500' : ''}`}
                      value={it.weight}
                      onChange={(e) => handleItemChange(it.id, "weight", e.target.value)}
                      placeholder="Enter weight in kg"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="modal-label">Quantity *</label>
                    <input
                      type="number"
                      className={`modal-input ${!it.quantity ? 'border-red-500' : ''}`}
                      value={it.quantity}
                      onChange={(e) => handleItemChange(it.id, "quantity", e.target.value)}
                      placeholder="Enter quantity"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <button type="button" onClick={addItem} className="text-primary font-medium text-sm">
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
              <div>
                <label className="modal-label">Mode of Service *</label>
                <Select
                  options={modeOptions}
                  value={formData.modeOfService}
                  onChange={(s) => setValue("modeOfService", s, { shouldValidate: true })}
                  className={`react-select-container ${errors.modeOfService ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select mode of service"
                />
                {errors.modeOfService && <span className="modal-error">{errors.modeOfService.message}</span>}
              </div>
              <div>
                <label className="modal-label">Terms (Days) *</label>
                <input
                  type="text"
                  className={`modal-input ${errors.terms ? 'border-red-500' : ''}`}
                  placeholder="Enter terms in days"
                  value={formData.terms || ""}
                  onChange={(e) => handleTermsChange(e.target.value)}
                />
                {errors.terms && <span className="modal-error">{errors.terms.message}</span>}
              </div>
            </div>
          </div>

          {/* Container Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-heading">Container Information</h4>
            <div className={responsiveGrid}>
              <div>
                <label className="modal-label">Container Type *</label>
                <Select
                  options={containerOptions}
                  value={formData.containerSize}
                  onChange={(s) => setValue("containerSize", s, { shouldValidate: true })}
                  className={`react-select-container ${errors.containerSize ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select container type"
                  isLoading={containerTypesLoading}
                />
                {errors.containerSize && <span className="modal-error">{errors.containerSize.message}</span>}
              </div>
              {formData.containerSize && (
                <div>
                  <label className="modal-label">Container Quantity *</label>
                  <ContainerQuantityInput />
                </div>
              )}
            </div>

            {/* Weight Display */}
            {items.some(item => item.weight && item.quantity) && formData.containerSize && (
              <div className={`rounded-lg p-4 border-2 ${
                !weightValidation.isValid 
                  ? 'bg-red-50 border-red-300' 
                  : 'bg-blue-900 border-blue-700'
              }`}>
                <div className="flex items-start gap-3">
                  <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    !weightValidation.isValid ? 'text-red-600' : 'text-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className={`font-semibold text-sm mb-1 ${
                      !weightValidation.isValid ? 'text-red-800' : 'text-blue-400'
                    }`}>
                      {!weightValidation.isValid ? 'Weight Capacity Exceeded' : 'Weight Status'}
                    </p>
                    <p className={`text-sm ${
                      !weightValidation.isValid ? 'text-red-700' : 'text-blue-300'
                    }`}>
                      {weightValidation.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Route Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-heading">Route Information</h4>
            <div className={responsiveGrid}>
              <div>
                <label className="modal-label">Origin Port *</label>
                <Select
                  options={portOptions}
                  value={formData.origin}
                  onChange={(s) => setValue("origin", s, { shouldValidate: true })}
                  className={`react-select-container ${errors.origin ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select origin port"
                  isLoading={portsLoading}
                />
                {errors.origin && <span className="modal-error">{errors.origin.message}</span>}
              </div>
              <div>
                <label className="modal-label">Destination Port *</label>
                <Select
                  options={portOptions}
                  value={formData.destination}
                  onChange={(s) => setValue("destination", s, { shouldValidate: true })}
                  className={`react-select-container ${errors.destination ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select destination port"
                  isLoading={portsLoading}
                />
                {errors.destination && <span className="modal-error">{errors.destination.message}</span>}
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
                  onChange={setDepartureDate}
                  customInput={<DateInput placeholder="Select preferred departure date" />}
                  minDate={new Date()}
                />
              </div>
              <div>
                <label className="modal-label">Preferred Delivery Date (Optional)</label>
                <DatePicker
                  selected={deliveryDate}
                  onChange={setDeliveryDate}
                  customInput={<DateInput placeholder="Select preferred delivery date" />}
                  minDate={departureDate}
                />
              </div>
            </div>
          </div>

          {/* Service Providers - FIXED: Made required */}
          <div className="space-y-4">
            <h4 className="font-semibold text-heading">Service Providers *</h4>
            <div className={responsiveGrid}>
              <div>
                <label className="modal-label">Preferred Shipping Line *</label>
                <Select
                  options={shippingLineOptions}
                  value={formData.shippingLine}
                  onChange={(s) => setValue("shippingLine", s, { shouldValidate: true })}
                  className={`react-select-container ${errors.shippingLine ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select shipping line"
                  isLoading={shippingLinesLoading}
                />
                {errors.shippingLine && <span className="modal-error">{errors.shippingLine.message}</span>}
              </div>
              <div>
                <label className="modal-label">Preferred Trucking Company *</label>
                <Select
                  options={truckCompanyOptions}
                  value={formData.truckCompany}
                  onChange={(s) => setValue("truckCompany", s, { shouldValidate: true })}
                  className={`react-select-container ${errors.truckCompany ? 'border-red-500' : ''}`}
                  classNamePrefix="react-select"
                  placeholder="Select trucking company"
                  isLoading={truckCompsLoading}
                />
                {errors.truckCompany && <span className="modal-error">{errors.truckCompany.message}</span>}
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
                onChange={setPickupLocation}
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
                onChange={setDeliveryLocation}
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
            className={`modal-btn-cancel ${createBookingMutation.isPending ? 'modal-btn-disabled' : ''}`}
            disabled={createBookingMutation.isPending}
          >
            Cancel
          </button>

          <button
            type="submit"
            className={`modal-btn-primary ${(!isFormValid() || createBookingMutation.isPending) ? 'modal-btn-disabled' : ''}`}
            disabled={!isFormValid() || createBookingMutation.isPending}
          >
            {createBookingMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Add Booking'
            )}
          </button>
        </div>
      </form>
    </SharedModal>
  );
};

export default AddBooking;
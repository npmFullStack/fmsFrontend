import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, X, CheckCircle, AlertCircle } from "lucide-react";
import LocationFields from "../components/LocationFields";
import api from "../api";
import { useCreateBooking } from "../hooks/useBooking";
import { bookingSchema, transformBookingToApi } from "../schemas/bookingSchema";

const Quote = () => {
  const [items, setItems] = useState([
    { id: 1, name: "", weight: "", quantity: "", category: "", customCategory: "" },
  ]);
  const [departureDate, setDepartureDate] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [containerQuantity, setContainerQuantity] = useState(1);
  const [weightValidation, setWeightValidation] = useState({ isValid: true, message: "" });
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    shipperFirstName: "",
    shipperLastName: "",
    shipperContact: "",
    consigneeFirstName: "",
    consigneeLastName: "",
    consigneeContact: "",
    modeOfService: null,
    containerSize: null,
    origin: null,
    destination: null,
    shippingLine: null,
    terms: "", // Changed to empty string initially
  });

  const [pickupLocation, setPickupLocation] = useState({});
  const [deliveryLocation, setDeliveryLocation] = useState({});

  const sectionRefs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
    4: useRef(null),
    5: useRef(null),
  };

  const [currentSection, setCurrentSection] = useState(1);

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

  // Create booking mutation
  const createBookingMutation = useCreateBooking();

  // Generate options - fix max_weight to be number
  const containerOptions = React.useMemo(() => {
    if (!containerTypesData?.data) return [];
    return containerTypesData.data.map(container => ({ 
      value: container.id,
      label: `${container.size}`,
      max_weight: parseFloat(container.max_weight) || 0, // Ensure it's a number
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

  const modeOptions = [
    { value: "port-to-port", label: "Port to Port" },
    { value: "pier-to-pier", label: "Pier to Pier" },
    { value: "door-to-door", label: "Door to Door" },
    { value: "port-to-door", label: "Port to Door" },
    { value: "door-to-port", label: "Door to Port" },
  ];

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

      if (selectedContainer) {
        const maxWeight = selectedContainer.max_weight * containerQuantity;
        if (totalWeight > maxWeight) {
          const excessWeight = totalWeight - maxWeight;
          setWeightValidation({
            isValid: false,
            message: `Total weight (${totalWeight}kg) exceeds container capacity (${maxWeight}kg) by ${excessWeight}kg. Please add more containers or choose a larger container size.`
          });
        } else {
          setWeightValidation({ isValid: true, message: "" });
        }
      }
    }
  }, [items, formData.containerSize, containerQuantity, containerOptions]);

  // Item management
  const addItem = () => setItems((s) => [...s, {
    id: Date.now(),
    name: "",
    weight: "",
    quantity: "",
    category: "",
    customCategory: "",
  }]);

  const removeItem = (id) => setItems((s) => s.filter((it) => it.id !== id));

  const handleItemChange = (id, field, value) =>
    setItems((s) => s.map((it) => (it.id === id ? { ...it, [field]: value } : it)));

  const handleCategoryChange = (id, selectedOption) => {
    const categoryValue = selectedOption?.value || "";
    handleItemChange(id, "category", categoryValue);
    if (categoryValue !== "other") {
      handleItemChange(id, "customCategory", "");
    }
  };

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // Contact number validation - only numbers
  const handleContactNumberChange = (field, value) => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^\d]/g, '');
    handleInputChange(field, numericValue);
  };

  // Handle terms change - allow empty and numbers only
  const handleTermsChange = (value) => {
    // Allow empty string or numbers only
    if (value === "" || /^\d*$/.test(value)) {
      handleInputChange("terms", value);
    }
  };

  // Mode-based visibility
  const modeValue = formData.modeOfService?.value || null;
  const showPickup = modeValue === "door-to-door" || modeValue === "door-to-port";
  const showDelivery = modeValue === "door-to-door" || modeValue === "port-to-door";

  // Section completion check (made contact numbers optional)
  const isSectionComplete = (section) => {
    switch (section) {
      case 1:
        return formData.firstName && formData.lastName && formData.email;
      case 2:
        return formData.shipperFirstName && formData.shipperLastName;
      case 3:
        return formData.consigneeFirstName && formData.consigneeLastName;
      case 4:
        return items.every((item) => {
          const hasCategory = item.category && (item.category !== "other" || item.customCategory);
          return item.name && item.weight && item.quantity && hasCategory;
        });
      case 5:
        return formData.modeOfService && formData.containerSize && formData.origin && 
               formData.destination && departureDate && formData.terms && weightValidation.isValid;
      default:
        return false;
    }
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

  // Form submission handler with schema validation
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    // Validate all sections are complete
    if (!isSectionComplete(5)) {
      console.log("Section 5 not complete");
      return;
    }

    try {
      // Prepare data for validation - ensure terms is number
      const formDataForValidation = {
        ...formData,
        containerQuantity,
        departureDate,
        deliveryDate,
        pickupLocation: showPickup ? pickupLocation : null,
        deliveryLocation: showDelivery ? deliveryLocation : null,
        terms: parseInt(formData.terms) || 0, // Convert to number
        items: items.map(item => ({
          name: item.name,
          weight: parseFloat(item.weight),
          quantity: parseInt(item.quantity),
          category: item.category === "other" ? item.customCategory : item.category,
        })),
      };

      console.log("Form data for validation:", formDataForValidation);

      // Validate with schema
      const validatedData = bookingSchema.parse(formDataForValidation);
      console.log("Validation successful:", validatedData);
      
      // Clear any previous errors
      setFormErrors({});

      // Transform to API format
      const bookingData = transformBookingToApi(validatedData);
      console.log("Transformed booking data:", bookingData);

      createBookingMutation.mutate(bookingData, {
        onSuccess: (data) => {
          console.log("Booking created successfully:", data);
          setQuoteSubmitted(true);
        },
        onError: (error) => {
          console.error('Booking submission error:', error);
          alert('Failed to submit booking. Please try again.');
        }
      });

    } catch (error) {
      console.error('Validation error:', error);
      if (error.errors) {
        // Zod validation errors
        const errors = {};
        error.errors.forEach(err => {
          const path = err.path.join('.');
          errors[path] = err.message;
        });
        setFormErrors(errors);
        console.log('Form errors:', errors);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setItems([{ id: 1, name: "", weight: "", quantity: "", category: "", customCategory: "" }]);
    setFormData({
      firstName: "", lastName: "", email: "", contactNumber: "",
      shipperFirstName: "", shipperLastName: "", shipperContact: "",
      consigneeFirstName: "", consigneeLastName: "", consigneeContact: "",
      modeOfService: null, containerSize: null, origin: null, destination: null, 
      shippingLine: null, terms: "", // Reset to empty string
    });
    setDepartureDate(null);
    setDeliveryDate(null);
    setPickupLocation({});
    setDeliveryLocation({});
    setContainerQuantity(1);
    setCurrentSection(1);
    setQuoteSubmitted(false);
    setFormErrors({});
    setWeightValidation({ isValid: true, message: "" });
  };

  // Success screen
  if (quoteSubmitted) {
    return (
      <div className="min-h-screen bg-main py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface rounded-2xl shadow-xl border border-main p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
            <h1 className="text-3xl font-bold text-heading mb-4">Quote Request Submitted!</h1>

            <div className="modal-info-box text-left">
              <div className="modal-info-title">
                <span>Pending Verification</span>
                <span className="modal-info-badge">Action Required</span>
              </div>
              <p className="modal-info-text mb-3">
                Your quote request has been received and is currently being reviewed by our team.
              </p>
<p className="modal-info-text">A confirmation email will be sent to <strong>{formData.email}</strong>. Once your quote is verified, you will receive your account credentials at this email address.</p>

            </div>

            <button
              onClick={resetForm}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors mt-6"
            >
              Request Another Quote
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-main py-12 px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface rounded-2xl shadow-xl border border-main p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-heading mb-1">Request a Quote</h1>
            <p className="text-muted text-lg">Fill out the form below to get your shipping quote</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-8">
            {/* Section 1: Personal Information - One by one layout */}
            <div className="space-y-4" ref={sectionRefs[1]}>
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                1. Personal Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="modal-label">First Name</label>
                  <input
                    className={`modal-input ${formErrors.firstName ? 'border-red-500' : ''}`}
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Last Name</label>
                  <input
                    className={`modal-input ${formErrors.lastName ? 'border-red-500' : ''}`}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Email</label>
                  <input
                    className={`modal-input ${formErrors.email ? 'border-red-500' : ''}`}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                  <div className="modal-info-box mt-2 border-blue-200 bg-blue-50">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="modal-info-text text-blue-800 text-sm">
                        <strong>Important:</strong> Please use an active email address. Your account credentials and quote details will be sent to this email once your booking is approved.
                      </p>
                    </div>
                  </div>
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Contact Number (Optional)</label>
                  <input
                    className="modal-input"
                    value={formData.contactNumber}
                    onChange={(e) => handleContactNumberChange("contactNumber", e.target.value)}
                    placeholder="Enter your contact number"
                    type="tel"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Shipper Information */}
            <div className="space-y-4" ref={sectionRefs[2]}>
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                2. Shipper Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label">Shipper First Name</label>
                  <input
                    className={`modal-input ${formErrors.shipperFirstName ? 'border-red-500' : ''}`}
                    value={formData.shipperFirstName}
                    onChange={(e) => handleInputChange("shipperFirstName", e.target.value)}
                    placeholder="Enter shipper's first name"
                    required
                  />
                  {formErrors.shipperFirstName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.shipperFirstName}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Shipper Last Name</label>
                  <input
                    className={`modal-input ${formErrors.shipperLastName ? 'border-red-500' : ''}`}
                    value={formData.shipperLastName}
                    onChange={(e) => handleInputChange("shipperLastName", e.target.value)}
                    placeholder="Enter shipper's last name"
                    required
                  />
                  {formErrors.shipperLastName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.shipperLastName}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Contact Number (Optional)</label>
                  <input
                    className="modal-input"
                    value={formData.shipperContact}
                    onChange={(e) => handleContactNumberChange("shipperContact", e.target.value)}
                    placeholder="Enter shipper's contact number"
                    type="tel"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Consignee Information */}
            <div className="space-y-4" ref={sectionRefs[3]}>
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                3. Consignee Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label">Consignee First Name</label>
                  <input
                    className={`modal-input ${formErrors.consigneeFirstName ? 'border-red-500' : ''}`}
                    value={formData.consigneeFirstName}
                    onChange={(e) => handleInputChange("consigneeFirstName", e.target.value)}
                    placeholder="Enter consignee's first name"
                    required
                  />
                  {formErrors.consigneeFirstName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.consigneeFirstName}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Consignee Last Name</label>
                  <input
                    className={`modal-input ${formErrors.consigneeLastName ? 'border-red-500' : ''}`}
                    value={formData.consigneeLastName}
                    onChange={(e) => handleInputChange("consigneeLastName", e.target.value)}
                    placeholder="Enter consignee's last name"
                    required
                  />
                  {formErrors.consigneeLastName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.consigneeLastName}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Contact Number (Optional)</label>
                  <input
                    className="modal-input"
                    value={formData.consigneeContact}
                    onChange={(e) => handleContactNumberChange("consigneeContact", e.target.value)}
                    placeholder="Enter consignee's contact number"
                    type="tel"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Items */}
            <div className="space-y-4" ref={sectionRefs[4]}>
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                4. Item / Commodity Information
              </h2>
              {items.map((it, idx) => {
                const showCustomCategory = it.category === "other";
                const selectedCategory = categoryOptions.find((o) => o.value === it.category) || null;
                return (
                  <div key={it.id} className="bg-main border border-main rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-heading">Item {idx + 1}</h3>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(it.id)} className="text-red-500">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="modal-label">Item Name</label>
                        <input
                          className="modal-input"
                          value={it.name}
                          onChange={(e) => handleItemChange(it.id, "name", e.target.value)}
                          placeholder="Enter item name"
                          required
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
                              required
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
                          required
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

            {/* Section 5: Shipping Preferences */}
            <div className="space-y-4" ref={sectionRefs[5]}>
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                5. Shipping Preferences
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label">Mode of Service</label>
                  <Select
                    options={modeOptions}
                    value={formData.modeOfService}
                    onChange={(s) => handleInputChange("modeOfService", s)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select mode of service"
                  />
                  {formErrors.modeOfService && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.modeOfService}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Container Type</label>
                  <Select
                    options={containerOptions}
                    value={formData.containerSize}
                    onChange={(s) => handleInputChange("containerSize", s)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select container type"
                    isLoading={containerTypesLoading}
                  />
                  {formData.containerSize && (
                    <div className="mt-2">
                      <label className="modal-label">Container Quantity</label>
                      <input
                        type="number"
                        className="modal-input"
                        value={containerQuantity}
                        onChange={(e) => setContainerQuantity(parseInt(e.target.value) || 1)}
                        min="1"
                        required
                      />
                    </div>
                  )}
                  {formErrors.containerSize && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.containerSize}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Origin Port</label>
                  <Select
                    options={portOptions}
                    value={formData.origin}
                    onChange={(s) => handleInputChange("origin", s)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select origin port"
                    isLoading={portsLoading}
                  />
                  {formErrors.origin && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.origin}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Destination Port</label>
                  <Select
                    options={portOptions}
                    value={formData.destination}
                    onChange={(s) => handleInputChange("destination", s)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select destination port"
                    isLoading={portsLoading}
                  />
                  {formErrors.destination && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.destination}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Departure Date</label>
                  <DatePicker
                    selected={departureDate}
                    onChange={setDepartureDate}
                    customInput={<DateInput placeholder="Select departure date" />}
                    minDate={new Date()}
                    required
                  />
                  {formErrors.departureDate && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.departureDate}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Delivery Date (Optional)</label>
                  <DatePicker
                    selected={deliveryDate}
                    onChange={setDeliveryDate}
                    customInput={<DateInput placeholder="Select delivery date" />}
                    minDate={departureDate}
                  />
                  {formErrors.deliveryDate && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.deliveryDate}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Terms (Days)</label>
                  <input
                    type="text"
                    className={`modal-input ${formErrors.terms ? 'border-red-500' : ''}`}
                    value={formData.terms}
                    onChange={(e) => handleTermsChange(e.target.value)}
                    placeholder="Enter terms in days"
                    required
                  />
                  {formErrors.terms && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.terms}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Preferred Shipping Line (Optional)</label>
                  <Select
                    options={shippingLineOptions}
                    value={formData.shippingLine}
                    onChange={(s) => handleInputChange("shippingLine", s)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select shipping line"
                    isLoading={shippingLinesLoading}
                  />
                </div>
              </div>

              {/* Weight validation */}
              {!weightValidation.isValid && (
                <div className="modal-info-box border-red-200 bg-red-50">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="modal-info-text text-red-800 font-medium">
                      {weightValidation.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Total weight display */}
              {items.some(item => item.weight && item.quantity) && (
                <div className="modal-info-box">
                  <p className="modal-info-text">
                    Total Weight: <strong>{calculateTotalWeight()} kg</strong>
                    {formData.containerSize && (
                      <span>
                        {" "} | Container Capacity:{" "}
                        <strong>
                          {containerOptions.find(opt => opt.value === formData.containerSize.value)?.max_weight * containerQuantity} kg
                        </strong>
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Location fields */}
              {showPickup && (
                <div className="border border-main rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-heading mb-4">Pickup Location</h3>
                  <LocationFields
                    location={pickupLocation}
                    setLocation={setPickupLocation}
                  />
                </div>
              )}

              {showDelivery && (
                <div className="border border-main rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-heading mb-4">Delivery Location</h3>
                  <LocationFields
                    location={deliveryLocation}
                    setLocation={setDeliveryLocation}
                  />
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-6 border-t border-main">
              <button
                type="submit"
                disabled={createBookingMutation.isPending || !isSectionComplete(5)}
                className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBookingMutation.isPending ? "Submitting..." : "Get Quote"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Quote;
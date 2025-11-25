// src/pages/Quote.jsx
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { Calendar, X, CheckCircle, AlertCircle, ChevronUp, ChevronDown } from "lucide-react";
import LocationFields from "../components/LocationFields";
import api from "../api";
import { useQuote } from "../hooks/useQuote";
import { quoteSchema, transformQuoteToApi } from "../schemas/quoteSchema";
import quoteSuccessImg from "../assets/images/quoteSuccess.png";

const Quote = () => {
  const [items, setItems] = useState([
    { id: 1, name: "", weight: "", quantity: "", category: "", customCategory: "" },
  ]);
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
    truckCompany: null, 
    terms: "",
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

  // Fetch truck companies
  const { data: truckCompsData, isLoading: truckCompsLoading } = useQuery({
    queryKey: ['truck-comps'],
    queryFn: async () => {
      const res = await api.get('/truck-comps');
      return res.data;
    },
  });

  const { createQuote } = useQuote();
const createQuoteMutation = createQuote;

  // Generate options
  const containerOptions = React.useMemo(() => {
  if (!containerTypesData?.data) return [];
  return containerTypesData.data.map(container => ({
    value: container.id,
    label: `${container.size} (Max: ${parseFloat(container.max_weight).toFixed(2)} kg)`, // Display size with max weight
    max_weight: parseFloat(container.max_weight) || 0,
    originalSize: container.size // Keep original size for reference
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
    label: `${port.name} (${port.route_name})`, // This will display like: Port of Cebu (CEB)
    portData: port
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
        // Remove trailing .00 if present
        const formattedExcess = excessWeight.replace(/\.00$/, '');
        const formattedTotal = totalWeight.toFixed(2).replace(/\.00$/, '');
        const formattedMax = maxWeight.toFixed(2).replace(/\.00$/, '');
        
        setWeightValidation({
          isValid: false,
          message: `Total weight (${formattedTotal} kg) exceeds container capacity (${formattedMax} kg) by ${formattedExcess} kg. Please add more containers or choose a larger container size.`
        });
      } else {
        const remainingCapacity = (maxWeight - totalWeight).toFixed(2);
        // Remove trailing .00 if present
        const formattedRemaining = remainingCapacity.replace(/\.00$/, '');
        const formattedTotal = totalWeight.toFixed(2).replace(/\.00$/, '');
        const formattedMax = maxWeight.toFixed(2).replace(/\.00$/, '');
        
        setWeightValidation({ 
          isValid: true, 
          message: `Total weight: ${formattedTotal} kg / ${formattedMax} kg (${formattedRemaining} kg remaining capacity)`
        });
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
    const numericValue = value.replace(/[^\d]/g, '');
    handleInputChange(field, numericValue);
  };

  // Handle terms change - allow empty and numbers only
  const handleTermsChange = (value) => {
    if (value === "" || /^\d*$/.test(value)) {
      handleInputChange("terms", value);
    }
  };

  // Container quantity increment/decrement
  const incrementContainerQuantity = () => {
    setContainerQuantity(prev => prev + 1);
  };

  const decrementContainerQuantity = () => {
    setContainerQuantity(prev => prev > 1 ? prev - 1 : 1);
  };

  // Mode-based visibility
  const modeValue = formData.modeOfService?.value || null;
  const showPickup = modeValue === "door-to-door" || modeValue === "door-to-port";
  const showDelivery = modeValue === "door-to-door" || modeValue === "port-to-door";

  // Section completion check
const isSectionComplete = (section) => {
  switch (section) {
    case 1:
      return true;
    case 2:
      // Shipper section is now optional, so always return true
      return true;
    case 3:
      // Consignee section is now optional, so always return true
      return true;
    case 4:
      return items.every((item) => {
        const hasCategory = item.category && (item.category !== "other" || item.customCategory);
        return item.name && item.weight && item.quantity && hasCategory;
      });
    case 5:
      return formData.modeOfService && formData.containerSize && formData.origin &&
        formData.destination && formData.terms && weightValidation.isValid;
    default:
      return false;
  }
};

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

  // Form submission handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    if (!isSectionComplete(5)) {
      console.log("Section 5 not complete");
      return;
    }

    try {
      const formDataForValidation = {
        ...formData,
        containerQuantity,
        pickupLocation: showPickup && Object.keys(pickupLocation).length > 0 ? pickupLocation : null,
        deliveryLocation: showDelivery && Object.keys(deliveryLocation).length > 0 ? deliveryLocation : null,
        terms: parseInt(formData.terms) || 1,
        items: items.map(item => ({
          name: item.name,
          weight: parseFloat(item.weight),
          quantity: parseInt(item.quantity),
          category: item.category === "other" ? item.customCategory : item.category,
        })),
      };

      console.log("Form data for validation:", formDataForValidation);

      const validatedData = quoteSchema.parse(formDataForValidation);
      console.log("Validation successful:", validatedData);

      setFormErrors({});

      const quoteData = transformQuoteToApi(validatedData);
      console.log("Transformed quote data:", quoteData);

      createQuoteMutation.mutate(quoteData, {
        onSuccess: (data) => {
          console.log("Quote submitted successfully:", data);
          setQuoteSubmitted(true);
        },
        onError: (error) => {
          console.error('Quote submission error:', error);
          alert('Failed to submit quote. Please try again.');
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
        setFormErrors(errors);
        console.log('Form errors:', errors);
      } else {
        console.error('Unexpected validation error:', error);
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
      shippingLine: null, truckCompany: null, terms: "",
    });
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
            <img
              src={quoteSuccessImg}
              alt="Success"
              className="w-40 h-64 mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-heading mb-4">
              Quote Request Submitted
            </h1>
            <div className="modal-info-box text-left">
              <div className="modal-info-title">
                <span>Thank You</span>
              </div>
              <p className="modal-info-text mb-3">
                Your quote request has been successfully received and is now
                waiting for verification.
              </p>
              <p className="modal-info-text">
                A confirmation message will be sent to your email:{" "}
                <strong>{formData.email}</strong>. Please wait while our team
                reviews your request.
              </p>
            </div>
            <button
              onClick={resetForm}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors mt-6"
            >
              Submit Another Request
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
            {/* Section 1: Customer Information */}
            <div className="space-y-4" ref={sectionRefs[1]}>
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                1. Customer Information
              </h2>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="modal-label">First Name (Optional)</label>
                    <input
                      className={`modal-input ${formErrors.firstName ? 'border-red-500' : ''}`}
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                      
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="modal-label">Last Name (Optional)</label>
                    <input
                      className={`modal-input ${formErrors.lastName ? 'border-red-500' : ''}`}
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                      
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
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
                  
                  <div className="email-notice border border-blue-700 bg-blue-900 mt-2">
                    <div className="flex items-start gap-4 pl-4">
                      <AlertCircle className="email-notice-icon text-blue-100" />
                      <p className="email-notice-text text-blue-200">
                        <strong className="email-notice-heading text-blue-100">
                          Important:
                        </strong>{' '}
                        Please use an active email address. Your quote details will be sent to this email once your request is processed.
                      </p>
                    </div>
                  </div>

                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
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
                  <label className="modal-label">Shipper First Name (Optional)</label>
                  <input
                    className={`modal-input ${formErrors.shipperFirstName ? 'border-red-500' : ''}`}
                    value={formData.shipperFirstName}
                    onChange={(e) => handleInputChange("shipperFirstName", e.target.value)}
                    placeholder="Enter shipper's first name"
                    
                  />
                  {formErrors.shipperFirstName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.shipperFirstName}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Shipper Last Name (Optional)</label>
                  <input
                    className={`modal-input ${formErrors.shipperLastName ? 'border-red-500' : ''}`}
                    value={formData.shipperLastName}
                    onChange={(e) => handleInputChange("shipperLastName", e.target.value)}
                    placeholder="Enter shipper's last name"
                    
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
                  <label className="modal-label">Consignee First Name (Optional)</label>
                  <input
                    className={`modal-input ${formErrors.consigneeFirstName ? 'border-red-500' : ''}`}
                    value={formData.consigneeFirstName}
                    onChange={(e) => handleInputChange("consigneeFirstName", e.target.value)}
                    placeholder="Enter consignee's first name"
                    
                  />
                  {formErrors.consigneeFirstName && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.consigneeFirstName}</p>
                  )}
                </div>
                <div>
                  <label className="modal-label">Consignee Last Name (Optional)</label>
                  <input
                    className={`modal-input ${formErrors.consigneeLastName ? 'border-red-500' : ''}`}
                    value={formData.consigneeLastName}
                    onChange={(e) => handleInputChange("consigneeLastName", e.target.value)}
                    placeholder="Enter consignee's last name "
                    
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
            <div className="space-y-6" ref={sectionRefs[5]}>
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                5. Shipping Preferences
              </h2>

              {/* Basic Shipping Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-heading">Basic Details</h3>
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
                </div>
              </div>

              {/* Container Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-heading">Container Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
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
                    {formErrors.containerSize && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.containerSize}</p>
                    )}
                  </div>
                  {formData.containerSize && (
                    <div>
                      <label className="modal-label">Container Quantity</label>
                      <ContainerQuantityInput />
                    </div>
                  )}
                </div>

                {/* Enhanced Weight Display */}
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
                <h3 className="text-lg font-semibold text-heading">Route Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Service Providers (Optional) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-heading">Service Providers</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="modal-label">Preferred Shipping Line</label>
                    <Select
                      options={shippingLineOptions}
                      value={formData.shippingLine}
                      onChange={(s) => handleInputChange("shippingLine", s)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select shipping line"
                      isLoading={shippingLinesLoading}
                      isClearable
                    />
                  </div>
                  <div>
                    <label className="modal-label">Preferred Trucking Company</label>
                    <Select
                      options={truckCompanyOptions}
                      value={formData.truckCompany}
                      onChange={(s) => handleInputChange("truckCompany", s)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select trucking company"
                      isLoading={truckCompsLoading}
                      isClearable
                    />
                  </div>
                </div>
              </div>

              {/* Location fields with item-like styling and conditional rendering */}
              {showPickup && (
                <div className="bg-main border border-main rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-heading mb-4">Pickup Location</h3>
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
                  <h3 className="text-lg font-semibold text-heading mb-4">Delivery Location</h3>
                  <LocationFields
                    type="delivery"
                    value={deliveryLocation}
                    onChange={setDeliveryLocation}
                    showStreetSearch={true}
                  />
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-6 border-t border-main">
              <button
                type="submit"
                disabled={createQuoteMutation.isPending || !isSectionComplete(5)}
                className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createQuoteMutation.isPending ? "Submitting..." : "Get Quote"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Quote;
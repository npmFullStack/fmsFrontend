import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, X, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import LocationFields from "../components/LocationFields";
import api from "../api";
import { useCreateBooking } from "../api/mutations/bookingMutations";
import { bookingSchema, itemSchema } from "../schemas/bookingSchema";

const Quote = () => {
  const [items, setItems] = useState([
    { id: 1, name: "", weight: "", quantity: "", category: "", customCategory: "" },
  ]);
  const [departureDate, setDepartureDate] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [containerQuantity, setContainerQuantity] = useState(1);
  const [weightValidation, setWeightValidation] = useState({ isValid: true, message: "" });

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

  // React Hook Form for validation
  const { handleSubmit: submitForm, formState: { errors } } = useForm({
    resolver: zodResolver(bookingSchema),
  });

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

  // Fetch container types from backend
  const { data: containerTypesData, isLoading: containerTypesLoading } = useQuery({
    queryKey: ['container-types'],
    queryFn: async () => {
      const res = await api.get('/container-types');
      return res.data;
    },
  });

  // Create booking mutation
  const createBookingMutation = useCreateBooking();

  // Generate container options from backend data
  const containerOptions = React.useMemo(() => {
    if (!containerTypesData?.data) return [];
    
    return containerTypesData.data.map(container => ({
      value: container.id,
      label: `${container.size} - ${container.load_type}`,
      max_weight: container.max_weight,
      load_type: container.load_type,
      fcl_rate: container.fcl_rate,
    }));
  }, [containerTypesData]);

  // Generate category options
  const categoryOptions = React.useMemo(() => {
    if (!categoriesData?.data) return [];
    const baseOptions = categoriesData.data.map(category => ({
      value: category.name,
      label: category.name,
    }));
    return [...baseOptions, { value: "other", label: "Other" }];
  }, [categoriesData]);

  // Generate port options
  const portOptions = React.useMemo(() => {
    if (!portsData?.data) return [];
    return portsData.data.map(port => ({
      value: port.route_name,
      label: port.route_name,
    }));
  }, [portsData]);

  const modeOptions = [
    { value: "port-to-port", label: "Port to Port" },
    { value: "pier-to-pier", label: "Pier to Pier" },
    { value: "door-to-door", label: "Door to Door" },
    { value: "port-to-door", label: "Port to Door" },
    { value: "door-to-port", label: "Door to Port" },
  ];

  const shippingLineOptions = [
    { value: "maersk", label: "Maersk Line" },
    { value: "msc", label: "MSC (Mediterranean Shipping Company)" },
    { value: "cosco", label: "COSCO Shipping" },
    { value: "hapag-lloyd", label: "Hapag-Lloyd" },
    { value: "evergreen", label: "Evergreen Line" },
    { value: "cma-cgm", label: "CMA CGM" },
    { value: "yang-ming", label: "Yang Ming Marine Transport" },
    { value: "one", label: "Ocean Network Express (ONE)" },
  ];

  // Calculate total weight and validate against container capacity
  const calculateTotalWeight = () => {
    return items.reduce((total, item) => {
      const weight = parseFloat(item.weight) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (weight * quantity);
    }, 0);
  };

  // Validate weight against selected container
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
            message: `Total weight (${totalWeight}kg) exceeds container capacity (${maxWeight}kg) by ${excessWeight}kg. Please reduce weight or increase container quantity.`
          });
        } else {
          setWeightValidation({ isValid: true, message: "" });
        }
      }
    }
  }, [items, formData.containerSize, containerQuantity, containerOptions]);

  // Item management functions
  const addItem = () => setItems((s) => [...s, { 
    id: Date.now(), 
    name: "", 
    weight: "", 
    quantity: "", 
    category: "", 
    customCategory: "" 
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

  // Mode-based visibility
  const modeValue = formData.modeOfService?.value || null;
  const showPickup = modeValue === "door-to-door" || modeValue === "door-to-port";
  const showDelivery = modeValue === "door-to-door" || modeValue === "port-to-door";

  // Section completion check
  const isSectionComplete = (section) => {
    switch (section) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.contactNumber;
      case 2:
        return formData.shipperFirstName && formData.shipperLastName && formData.shipperContact;
      case 3:
        return formData.consigneeFirstName && formData.consigneeLastName && formData.consigneeContact;
      case 4:
        return items.every((item) => {
          const hasCategory = item.category && (item.category !== "other" || item.customCategory);
          return item.name && item.weight && item.quantity && hasCategory;
        });
      case 5:
        return formData.modeOfService && formData.containerSize && formData.origin && 
               formData.destination && departureDate && weightValidation.isValid;
      default:
        return false;
    }
  };

  // Auto-advance sections when complete
  useEffect(() => {
    if (isSectionComplete(currentSection) && currentSection < 5) {
      const next = currentSection + 1;
      const ref = sectionRefs[next];
      setTimeout(() => {
        setCurrentSection(next);
        if (ref?.current) ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 250);
    }
  }, [formData, items, departureDate, currentSection, weightValidation]);

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

  const handleFormSubmit = (formData) => {
    const bookingData = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      contact_number: formData.contactNumber,
      shipper_first_name: formData.shipperFirstName,
      shipper_last_name: formData.shipperLastName,
      shipper_contact: formData.shipperContact,
      consignee_first_name: formData.consigneeFirstName,
      consignee_last_name: formData.consigneeLastName,
      consignee_contact: formData.consigneeContact,
      mode_of_service: formData.modeOfService?.value,
      container_size: formData.containerSize?.value,
      container_quantity: containerQuantity,
      origin: formData.origin?.value,
      destination: formData.destination?.value,
      shipping_line: formData.shippingLine?.value,
      departure_date: departureDate?.toISOString().split('T')[0],
      delivery_date: deliveryDate?.toISOString().split('T')[0],
      pickup_location: showPickup ? pickupLocation : null,
      delivery_location: showDelivery ? deliveryLocation : null,
      items: items.map(item => ({
        name: item.name,
        weight: parseFloat(item.weight),
        quantity: parseInt(item.quantity),
        category: item.category === "other" ? item.customCategory : item.category,
      })),
    };

    createBookingMutation.mutate(bookingData, {
      onSuccess: () => {
        setQuoteSubmitted(true);
      }
    });
  };

  // Reset form function
  const resetForm = () => {
    setItems([{ id: 1, name: "", weight: "", quantity: "", category: "", customCategory: "" }]);
    setFormData({
      firstName: "", lastName: "", email: "", contactNumber: "",
      shipperFirstName: "", shipperLastName: "", shipperContact: "",
      consigneeFirstName: "", consigneeLastName: "", consigneeContact: "",
      modeOfService: null, containerSize: null, origin: null, destination: null, shippingLine: null,
    });
    setDepartureDate(null);
    setDeliveryDate(null);
    setPickupLocation({});
    setDeliveryLocation({});
    setContainerQuantity(1);
    setCurrentSection(1);
    setQuoteSubmitted(false);
  };

  if (quoteSubmitted) {
    return (
      <div className="min-h-screen bg-main py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface rounded-2xl shadow-xl border border-main p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-heading mb-4">Quote Request Submitted!</h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-blue-800 mb-4">
                <strong>Please wait for the admin to verify your quote.</strong>
              </p>
              <p className="text-blue-700">
                We've sent a confirmation to <strong>{formData.email}</strong>. 
                Later, we'll send your account password to this email address.
              </p>
            </div>
            <button
              onClick={resetForm}
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Request Another Quote
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main py-12 px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface rounded-2xl shadow-xl border border-main p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-heading mb-1">Request a Quote</h1>
            <p className="text-muted text-lg">Fill out the form below to get your shipping quote</p>
          </div>

          <form onSubmit={submitForm(handleFormSubmit)} className="space-y-8">
            {/* Section 1: Personal Information */}
            <div className="space-y-4" ref={sectionRefs[1]}>
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                1. Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label">First Name</label>
                  <input
                    className="modal-input"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div>
                  <label className="modal-label">Last Name</label>
                  <input
                    className="modal-input"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
                <div>
                  <label className="modal-label">Email</label>
                  <input
                    className="modal-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This email will be used for your account and quote notifications
                  </p>
                </div>
                <div>
                  <label className="modal-label">Contact Number</label>
                  <input
                    className="modal-input"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                    placeholder="Enter your contact number"
                    required
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
                    className="modal-input"
                    value={formData.shipperFirstName}
                    onChange={(e) => handleInputChange("shipperFirstName", e.target.value)}
                    placeholder="Enter shipper's first name"
                    required
                  />
                </div>
                <div>
                  <label className="modal-label">Shipper Last Name</label>
                  <input
                    className="modal-input"
                    value={formData.shipperLastName}
                    onChange={(e) => handleInputChange("shipperLastName", e.target.value)}
                    placeholder="Enter shipper's last name"
                    required
                  />
                </div>
                <div>
                  <label className="modal-label">Contact Number</label>
                  <input
                    className="modal-input"
                    value={formData.shipperContact}
                    onChange={(e) => handleInputChange("shipperContact", e.target.value)}
                    placeholder="Enter shipper's contact number"
                    required
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
                    className="modal-input"
                    value={formData.consigneeFirstName}
                    onChange={(e) => handleInputChange("consigneeFirstName", e.target.value)}
                    placeholder="Enter consignee's first name"
                    required
                  />
                </div>
                <div>
                  <label className="modal-label">Consignee Last Name</label>
                  <input
                    className="modal-input"
                    value={formData.consigneeLastName}
                    onChange={(e) => handleInputChange("consigneeLastName", e.target.value)}
                    placeholder="Enter consignee's last name"
                    required
                  />
                </div>
                <div>
                  <label className="modal-label">Contact Number</label>
                  <input
                    className="modal-input"
                    value={formData.consigneeContact}
                    onChange={(e) => handleInputChange("consigneeContact", e.target.value)}
                    placeholder="Enter consignee's contact number"
                    required
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
                </div>
                <div>
                  <label className="modal-label">Delivery Date (Optional)</label>
                  <DatePicker
                    selected={deliveryDate}
                    onChange={setDeliveryDate}
                    customInput={<DateInput placeholder="Select delivery date" />}
                    minDate={departureDate}
                  />
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
                  />
                </div>
              </div>

              {/* Weight validation message */}
              {!weightValidation.isValid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">{weightValidation.message}</p>
                </div>
              )}

              {/* Total weight display */}
              {items.some(item => item.weight && item.quantity) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800">
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

              {/* Location fields based on mode */}
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
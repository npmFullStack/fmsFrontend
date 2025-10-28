import React, { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import { X } from "lucide-react";
import LocationFields from "../components/LocationFields";
import api from "../api";
import toast from "react-hot-toast";

const Quote = () => {
  // items
  const [items, setItems] = useState([
    { id: 1, name: "", weight: "", quantity: "", category: "", customCategory: "" },
  ]);

  // Dates
  const [departureDate, setDepartureDate] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    // personal
    firstName: "",
    lastName: "",
    email: "",
    contactNumber: "",
    // shipper
    shipperFirstName: "",
    shipperLastName: "",
    shipperContact: "",
    // consignee
    consigneeFirstName: "",
    consigneeLastName: "",
    consigneeContact: "",
    // shipping prefs
    modeOfService: null,
    containerSize: null,
    origin: null,
    destination: null,
    shippingLine: null,
  });

  // location objects for pickup/delivery (structured)
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

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData) => {
      const res = await api.post('/bookings', bookingData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Booking submitted successfully!');
      // Reset form
      setItems([{ id: 1, name: "", weight: "", quantity: "", category: "", customCategory: "" }]);
      setFormData({
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
      setDepartureDate(null);
      setDeliveryDate(null);
      setPickupLocation({});
      setDeliveryLocation({});
      setCurrentSection(1);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit booking');
    },
  });

  // Generate category options from API data
  const categoryOptions = React.useMemo(() => {
    if (!categoriesData?.data) return [];
    
    const baseOptions = categoriesData.data.map(category => ({
      value: category.name,
      label: category.name,
    }));
    
    // Add "Other" option
    return [...baseOptions, { value: "other", label: "Other" }];
  }, [categoriesData]);

  // Generate port options (show only route_name)
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

  const containerOptions = [
    { value: "20ft", label: "20ft Container" },
    { value: "40ft", label: "40ft Container" },
    { value: "lcl", label: "LCL (Less than Container Load)" },
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

  // helpers for items
  const addItem = () =>
    setItems((s) => [...s, { id: Date.now(), name: "", weight: "", quantity: "", category: "", customCategory: "" }]);

  const removeItem = (id) => setItems((s) => s.filter((it) => it.id !== id));

  const handleItemChange = (id, field, value) =>
    setItems((s) => s.map((it) => (it.id === id ? { ...it, [field]: value } : it)));

  // Handle category change with "Other" logic
  const handleCategoryChange = (id, selectedOption) => {
    const categoryValue = selectedOption?.value || "";
    handleItemChange(id, "category", categoryValue);
    
    // Clear custom category if not "other"
    if (categoryValue !== "other") {
      handleItemChange(id, "customCategory", "");
    }
  };

  // simple change handler for formData
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
        return formData.modeOfService && formData.containerSize && formData.origin && formData.destination && departureDate;
      default:
        return false;
    }
  };

  // auto-advance sections when complete
  useEffect(() => {
    if (isSectionComplete(currentSection) && currentSection < 5) {
      const next = currentSection + 1;
      const ref = sectionRefs[next];
      setTimeout(() => {
        setCurrentSection(next);
        if (ref?.current) ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 250);
    }
  }, [formData, items, departureDate, currentSection]);

  // Custom DatePicker input with calendar icon inside
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare the data for API
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

    createBookingMutation.mutate(bookingData);
  };

  return (
    <div className="min-h-screen bg-main py-12 px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface rounded-2xl shadow-xl border border-main p-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-heading mb-1">Request a Quote</h1>
            <p className="text-muted text-lg">Fill out the form below to get your shipping quote</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1 */}
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

            {/* Section 2: Shipper */}
            <div className="space-y-4" ref={sectionRefs[2]}>
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">2. Shipper Information</h2>
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

            {/* Section 3: Consignee */}
            <div className="space-y-4" ref={sectionRefs[3]}>
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">3. Consignee Information</h2>
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
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">4. Item / Commodity Information</h2>

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
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">5. Shipping Preferences</h2>

              <div className="grid md:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="modal-label">Mode of Service</label>
                  <Select
                    options={modeOptions}
                    value={formData.modeOfService}
                    onChange={(s) => handleInputChange("modeOfService", s)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select service mode"
                  />
                </div>

                <div>
                  <label className="modal-label">Container Size</label>
                  <Select
                    options={containerOptions}
                    value={formData.containerSize}
                    onChange={(s) => handleInputChange("containerSize", s)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select container size"
                  />
                </div>

                <div>
                  <label className="modal-label">Origin</label>
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
                  <label className="modal-label">Destination</label>
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
                  <label className="modal-label">Shipping Line</label>
                  <Select
                    options={shippingLineOptions}
                    value={formData.shippingLine}
                    onChange={(s) => handleInputChange("shippingLine", s)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select shipping line"
                  />
                </div>

                <div>
                  <label className="modal-label">Preferred Departure Date</label>
                  <DatePicker
                    selected={departureDate}
                    onChange={(d) => setDepartureDate(d)}
                    customInput={<DateInput placeholder="Select departure date" />}
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date()}
                    required
                  />
                </div>

                <div>
                  <label className="modal-label">Preferred Delivery Date</label>
                  <DatePicker
                    selected={deliveryDate}
                    onChange={(d) => setDeliveryDate(d)}
                    customInput={<DateInput placeholder="Select delivery date" />}
                    dateFormat="MMMM d, yyyy"
                    minDate={departureDate || new Date()}
                  />
                  <p className="text-xs text-muted mt-1">Required for Door to Door bookings</p>
                </div>
              </div>
            </div>

            {/* Location fields placed at the bottom (conditionally shown) */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">6. Pickup & Delivery</h2>

              {showPickup && (
                <LocationFields
                  type="pickup"
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  showStreetSearch={true}
                  required={true}
                />
              )}

              {showDelivery && (
                <LocationFields
                  type="delivery"
                  value={deliveryLocation}
                  onChange={setDeliveryLocation}
                  showStreetSearch={true}
                  required={true}
                />
              )}

              {!showPickup && !showDelivery && (
                <p className="text-muted">Pickup/delivery locations are not required for port/pier-to-port/pier bookings.</p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={createBookingMutation.isPending}
                className="px-8 py-4 bg-primary hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
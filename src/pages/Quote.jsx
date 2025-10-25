import React, { useState, useEffect, useRef } from 'react';
import Lottie from 'lottie-react';
import { X } from 'lucide-react';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import GizmoTutorial from './GizmoTutorial';
import chatbotAnimation from '../assets/lottie/Chatbot.json';

const Quote = () => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [items, setItems] = useState([{ id: 1, name: '', weight: '', quantity: '', category: '' }]);
  const [departureDate, setDepartureDate] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [currentSection, setCurrentSection] = useState(1);
  
  // Form state for tracking completion
  const [formData, setFormData] = useState({
    // Section 1
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    // Section 2
    shipperFirstName: '',
    shipperLastName: '',
    shipperContact: '',
    pickupLocation: '',
    // Section 3
    consigneeFirstName: '',
    consigneeLastName: '',
    consigneeContact: '',
    deliveryLocation: '',
    // Section 5
    modeOfService: null,
    containerSize: null,
    origin: null,
    destination: null,
  });

  const sectionRefs = {
    1: useRef(null),
    2: useRef(null),
    3: useRef(null),
    4: useRef(null),
    5: useRef(null)
  };

  const categoryOptions = [
    { value: 'general-cargo', label: 'General Cargo' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'food-beverage', label: 'Food & Beverage' },
    { value: 'clothing-textiles', label: 'Clothing & Textiles' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'automotive', label: 'Automotive Parts' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'chemicals', label: 'Chemicals' },
    { value: 'other', label: 'Other' }
  ];

  const modeOptions = [
    { value: 'port-to-port', label: 'Port to Port' },
    { value: 'pier-to-pier', label: 'Pier to Pier' },
    { value: 'door-to-door', label: 'Door to Door' },
    { value: 'port-to-door', label: 'Port to Door' },
    { value: 'door-to-port', label: 'Door to Port' }
  ];

  const containerOptions = [
    { value: '20ft', label: '20ft Container' },
    { value: '40ft', label: '40ft Container' },
    { value: 'lcl', label: 'LCL (Less than Container Load)' }
  ];

  const cityOptions = [
    { value: 'Manila', label: 'Manila' },
    { value: 'Cebu', label: 'Cebu' },
    { value: 'Davao', label: 'Davao' },
    { value: 'Cagayan de Oro', label: 'Cagayan de Oro' },
    { value: 'Iloilo', label: 'Iloilo' },
    { value: 'Zamboanga', label: 'Zamboanga' },
    { value: 'Bacolod', label: 'Bacolod' },
    { value: 'General Santos', label: 'General Santos' },
    { value: 'Batangas', label: 'Batangas' },
    { value: 'Subic', label: 'Subic' }
  ];

  const shippingLineOptions = [
    { value: 'maersk', label: 'Maersk Line' },
    { value: 'msc', label: 'MSC (Mediterranean Shipping Company)' },
    { value: 'cosco', label: 'COSCO Shipping' },
    { value: 'hapag-lloyd', label: 'Hapag-Lloyd' },
    { value: 'evergreen', label: 'Evergreen Line' },
    { value: 'cma-cgm', label: 'CMA CGM' },
    { value: 'yang-ming', label: 'Yang Ming Marine Transport' },
    { value: 'one', label: 'Ocean Network Express (ONE)' },
    { value: 'other', label: 'Other' }
  ];

  const gizmoMessages = {
    1: "Let's start with your personal information. This helps us contact you with your quote!",
    2: "Great! Now tell me about the shipper - who's sending the package?",
    3: "Perfect! Now let's get the consignee details - who's receiving the package?",
    4: "Awesome! What items are you shipping? Don't forget you can add multiple items!",
    5: "Almost done! Just need your shipping preferences and we'll calculate your quote. You're doing great! 🎉"
  };

  // Check if sections are complete
  const isSectionComplete = (section) => {
    switch(section) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.contactNumber;
      case 2:
        return formData.shipperFirstName && formData.shipperLastName && formData.shipperContact && formData.pickupLocation;
      case 3:
        return formData.consigneeFirstName && formData.consigneeLastName && formData.consigneeContact && formData.deliveryLocation;
      case 4:
        return items.every(item => item.name && item.weight && item.quantity && item.category);
      case 5:
        return formData.modeOfService && formData.containerSize && formData.origin && formData.destination && departureDate;
      default:
        return false;
    }
  };

  // Auto-advance to next section when current is complete
  useEffect(() => {
    if (isSectionComplete(currentSection) && currentSection < 5) {
      const nextSection = currentSection + 1;
      const nextRef = sectionRefs[nextSection];
      if (nextRef.current) {
        setTimeout(() => {
          setCurrentSection(nextSection);
          nextRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  }, [formData, items, departureDate, currentSection]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkipTutorial = () => {
    setShowTutorial(false);
  };

  const handleGetStarted = () => {
    setTutorialStep(1);
  };

  const handleNextStep = () => {
    if (tutorialStep < 6) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const handlePrevStep = () => {
    if (tutorialStep > 1) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now(), name: '', weight: '', quantity: '', category: '' }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted', { formData, items, departureDate, deliveryDate });
  };

  if (showTutorial) {
    return (
      <GizmoTutorial
        tutorialStep={tutorialStep}
        onSkip={handleSkipTutorial}
        onNext={handleNextStep}
        onPrev={handlePrevStep}
        onGetStarted={handleGetStarted}
      />
    );
  }

  return (
    <div className="min-h-screen bg-main py-20 px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface rounded-2xl shadow-xl border border-main p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-heading mb-2">Request a Quote</h1>
            <p className="text-muted text-lg">Fill out the form below to get your shipping quote</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal Information */}
            <div className="space-y-4" ref={sectionRefs[1]} data-section="1">
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                1. Personal Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label">First Name</label>
                  <input 
                    type="text" 
                    className="modal-input" 
                    placeholder="Juan" 
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="modal-label">Last Name</label>
                  <input 
                    type="text" 
                    className="modal-input" 
                    placeholder="Dela Cruz" 
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="modal-label">Email</label>
                  <input 
                    type="email" 
                    className="modal-input" 
                    placeholder="juan@email.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="modal-label">Contact Number</label>
                  <input 
                    type="tel" 
                    className="modal-input" 
                    placeholder="+63 912 345 6789" 
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Shipper Information */}
            <div className="space-y-4" ref={sectionRefs[2]} data-section="2">
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                2. Shipper Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label">Shipper First Name</label>
                  <input 
                    type="text" 
                    className="modal-input" 
                    placeholder="Maria" 
                    value={formData.shipperFirstName}
                    onChange={(e) => handleInputChange('shipperFirstName', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="modal-label">Shipper Last Name</label>
                  <input 
                    type="text" 
                    className="modal-input" 
                    placeholder="Santos" 
                    value={formData.shipperLastName}
                    onChange={(e) => handleInputChange('shipperLastName', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="modal-label">Contact Number</label>
                  <input 
                    type="tel" 
                    className="modal-input" 
                    placeholder="+63 912 345 6789" 
                    value={formData.shipperContact}
                    onChange={(e) => handleInputChange('shipperContact', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="modal-label">Pickup Location</label>
                  <input 
                    type="text" 
                    className="modal-input" 
                    placeholder="123 Street, Quezon City" 
                    value={formData.pickupLocation}
                    onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Consignee Information */}
            <div className="space-y-4" ref={sectionRefs[3]} data-section="3">
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                3. Consignee Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label">Consignee First Name</label>
                  <input 
                    type="text" 
                    className="modal-input" 
                    placeholder="Pedro" 
                    value={formData.consigneeFirstName}
                    onChange={(e) => handleInputChange('consigneeFirstName', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="modal-label">Consignee Last Name</label>
                  <input 
                    type="text" 
                    className="modal-input" 
                    placeholder="Reyes" 
                    value={formData.consigneeLastName}
                    onChange={(e) => handleInputChange('consigneeLastName', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="modal-label">Contact Number</label>
                  <input 
                    type="tel" 
                    className="modal-input" 
                    placeholder="+63 912 345 6789" 
                    value={formData.consigneeContact}
                    onChange={(e) => handleInputChange('consigneeContact', e.target.value)}
                    required 
                  />
                </div>
                <div>
                  <label className="modal-label">Delivery Location</label>
                  <input 
                    type="text" 
                    className="modal-input" 
                    placeholder="456 Avenue, Cebu City" 
                    value={formData.deliveryLocation}
                    onChange={(e) => handleInputChange('deliveryLocation', e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Item/Commodity Information */}
            <div className="space-y-4" ref={sectionRefs[4]} data-section="4">
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                4. Item/Commodity Information
              </h2>
              {items.map((item, index) => (
                <div key={item.id} className="bg-main border border-main rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-heading">Item {index + 1}</h3>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="modal-label">Item Name</label>
                      <input 
                        type="text" 
                        className="modal-input" 
                        placeholder="Electronics" 
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        required 
                      />
                    </div>
                    <div>
                      <label className="modal-label">Category</label>
                      <Select
                        options={categoryOptions}
                        value={categoryOptions.find(opt => opt.value === item.category)}
                        onChange={(selected) => handleItemChange(item.id, 'category', selected?.value)}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select category"
                      />
                    </div>
                    <div>
                      <label className="modal-label">Weight (kg)</label>
                      <input 
                        type="number" 
                        className="modal-input" 
                        placeholder="100" 
                        value={item.weight}
                        onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)}
                        required 
                      />
                    </div>
                    <div>
                      <label className="modal-label">Quantity</label>
                      <input 
                        type="number" 
                        className="modal-input" 
                        placeholder="10" 
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addItem}
                className="text-primary hover:text-blue-700 font-medium text-sm flex items-center gap-2 transition-colors"
              >
                + Add another item
              </button>
            </div>

            {/* Section 5: Shipping Preferences */}
            <div className="space-y-4" ref={sectionRefs[5]} data-section="5">
              <h2 className="text-2xl font-bold text-heading border-b border-main pb-2">
                5. Shipping Preferences
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="modal-label">Mode of Service</label>
                  <Select
                    options={modeOptions}
                    value={formData.modeOfService}
                    onChange={(selected) => handleInputChange('modeOfService', selected)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select mode"
                  />
                </div>
                <div>
                  <label className="modal-label">Container Size</label>
                  <Select
                    options={containerOptions}
                    value={formData.containerSize}
                    onChange={(selected) => handleInputChange('containerSize', selected)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select size"
                  />
                </div>
                <div>
                  <label className="modal-label">Origin</label>
                  <Select
                    options={cityOptions}
                    value={formData.origin}
                    onChange={(selected) => handleInputChange('origin', selected)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select origin"
                  />
                </div>
                <div>
                  <label className="modal-label">Destination</label>
                  <Select
                    options={cityOptions}
                    value={formData.destination}
                    onChange={(selected) => handleInputChange('destination', selected)}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select destination"
                  />
                </div>
                <div>
                  <label className="modal-label">Shipping Line</label>
                  <Select
                    options={shippingLineOptions}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    placeholder="Select shipping line"
                  />
                </div>
                <div>
                  <label className="modal-label">Preferred Departure Date</label>
                  <DatePicker
                    selected={departureDate}
                    onChange={(date) => setDepartureDate(date)}
                    className="modal-input w-full"
                    placeholderText="Select date"
                    dateFormat="MMMM d, yyyy"
                    minDate={new Date()}
                    required
                  />
                </div>
                <div>
                  <label className="modal-label">Preferred Delivery Date</label>
                  <DatePicker
                    selected={deliveryDate}
                    onChange={(date) => setDeliveryDate(date)}
                    className="modal-input w-full"
                    placeholderText="Select date"
                    dateFormat="MMMM d, yyyy"
                    minDate={departureDate || new Date()}
                  />
                  <p className="text-xs text-muted mt-1">Required for Door to Door bookings</p>
                </div>
                <div>
                  <label className="modal-label">Terms (Days)</label>
                  <input type="number" className="modal-input" placeholder="30" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="px-8 py-4 bg-primary hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Get Quote
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Floating Gizmo Helper */}
      <div className="fixed bottom-6 left-6 flex items-end gap-4 z-50 max-w-md">
        {/* Lottie Animation */}
        <div className="w-24 h-24 flex-shrink-0">
          <Lottie animationData={chatbotAnimation} loop={true} />
        </div>
        
        {/* Message Bubble */}
        <div className="bg-white rounded-2xl rounded-bl-none shadow-2xl p-4 border border-gray-200">
          <p className="text-gray-800 text-sm font-medium">
            {gizmoMessages[currentSection]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Quote;
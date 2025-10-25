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

  const cities = [
    'Manila', 'Cebu', 'Davao', 'Cagayan de Oro', 'Iloilo',
    'Zamboanga', 'Bacolod', 'General Santos', 'Batangas', 'Subic'
  ];

  const gizmoMessages = {
    1: "Let's start with your personal information. This helps us contact you with your quote!",
    2: "Great! Now tell me about the shipper - who's sending the package?",
    3: "Perfect! Now let's get the consignee details - who's receiving the package?",
    4: "Awesome! What items are you shipping? Don't forget you can add multiple items!",
    5: "Almost done! Just need your shipping preferences and we'll calculate your quote. You're doing great! 🎉"
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = parseInt(entry.target.dataset.section);
            setCurrentSection(section);
          }
        });
      },
      { threshold: 0.5 }
    );

    Object.values(sectionRefs).forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted');
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
                  <input type="text" className="modal-input" placeholder="Juan" required />
                </div>
                <div>
                  <label className="modal-label">Last Name</label>
                  <input type="text" className="modal-input" placeholder="Dela Cruz" required />
                </div>
                <div>
                  <label className="modal-label">Email</label>
                  <input type="email" className="modal-input" placeholder="juan@email.com" required />
                </div>
                <div>
                  <label className="modal-label">Contact Number</label>
                  <input type="tel" className="modal-input" placeholder="+63 912 345 6789" required />
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
                  <input type="text" className="modal-input" placeholder="Maria" required />
                </div>
                <div>
                  <label className="modal-label">Shipper Last Name</label>
                  <input type="text" className="modal-input" placeholder="Santos" required />
                </div>
                <div>
                  <label className="modal-label">Contact Number</label>
                  <input type="tel" className="modal-input" placeholder="+63 912 345 6789" required />
                </div>
                <div>
                  <label className="modal-label">Pickup Location</label>
                  <input type="text" className="modal-input" placeholder="123 Street, Quezon City" required />
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
                  <input type="text" className="modal-input" placeholder="Pedro" required />
                </div>
                <div>
                  <label className="modal-label">Consignee Last Name</label>
                  <input type="text" className="modal-input" placeholder="Reyes" required />
                </div>
                <div>
                  <label className="modal-label">Contact Number</label>
                  <input type="tel" className="modal-input" placeholder="+63 912 345 6789" required />
                </div>
                <div>
                  <label className="modal-label">Delivery Location</label>
                  <input type="text" className="modal-input" placeholder="456 Avenue, Cebu City" required />
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
                      <input type="text" className="modal-input" placeholder="Electronics" required />
                    </div>
                    <div>
                      <label className="modal-label">Category</label>
                      <Select
                        options={categoryOptions}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        placeholder="Select category"
                      />
                    </div>
                    <div>
                      <label className="modal-label">Weight (kg)</label>
                      <input type="number" className="modal-input" placeholder="100" required />
                    </div>
                    <div>
                      <label className="modal-label">Quantity</label>
                      <input type="number" className="modal-input" placeholder="10" required />
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
                  <select className="modal-input" required>
                    <option value="">Select mode</option>
                    <option value="port-to-port">Port to Port</option>
                    <option value="pier-to-pier">Pier to Pier</option>
                    <option value="door-to-door">Door to Door</option>
                    <option value="port-to-door">Port to Door</option>
                    <option value="door-to-port">Door to Port</option>
                  </select>
                </div>
                <div>
                  <label className="modal-label">Container Size</label>
                  <select className="modal-input" required>
                    <option value="">Select size</option>
                    <option value="20ft">20ft Container</option>
                    <option value="40ft">40ft Container</option>
                    <option value="lcl">LCL (Less than Container Load)</option>
                  </select>
                </div>
                <div>
                  <label className="modal-label">Origin</label>
                  <select className="modal-input" required>
                    <option value="">Select origin</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="modal-label">Destination</label>
                  <select className="modal-input" required>
                    <option value="">Select destination</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="modal-label">Shipping Line</label>
                  <input type="text" className="modal-input" placeholder="Enter shipping line" />
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
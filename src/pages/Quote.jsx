import React, { useState } from 'react';
import Lottie from 'lottie-react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import chatbotAnimation from '../assets/lottie/Chatbot.json';

const Quote = () => {
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [items, setItems] = useState([{ id: 1, name: '', weight: '', quantity: '', category: '' }]);

  const tutorialSteps = [
    {
      title: "Hi! I'm your shipping assistant! 🚢",
      description: "I'll help you get a quote for your shipping needs. Let me guide you through the process step by step."
    },
    {
      title: "Personal Information",
      description: "First, we'll need your basic contact details so we can send you the quote and keep you updated."
    },
    {
      title: "Shipper Details",
      description: "Next, tell us about the sender - who's shipping the goods and where they'll be picked up from."
    },
    {
      title: "Consignee Information",
      description: "Now, let's get the receiver's details and where the goods should be delivered."
    },
    {
      title: "Item Details",
      description: "What are you shipping? Tell us about your items, their weight, quantity, and category. You can add multiple items!"
    },
    {
      title: "Shipping Preferences",
      description: "Finally, choose your shipping mode, container size, route, and preferred dates. We'll calculate the best quote for you!"
    },
    {
      title: "All Set! Ready to Quote? 🎉",
      description: "That's all we need! Fill out the form and we'll get you a competitive quote right away."
    }
  ];

  const handleSkipTutorial = () => {
    setShowTutorial(false);
  };

  const handleNextStep = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
    }
  };

  const handlePrevStep = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const handleGetStarted = () => {
    setShowTutorial(false);
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
    // Handle form submission
    console.log('Form submitted');
  };

  // Philippine cities with ports (dummy data)
  const cities = [
    'Manila', 'Cebu', 'Davao', 'Cagayan de Oro', 'Iloilo', 
    'Zamboanga', 'Bacolod', 'General Santos', 'Batangas', 'Subic'
  ];

  if (showTutorial && tutorialStep === 0) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-main">
          <div className="flex flex-col md:flex-row">
            {/* Left side - Lottie Animation (40%) */}
            <div className="md:w-2/5 bg-gradient-to-br from-primary to-blue-700 p-8 flex items-center justify-center">
              <Lottie animationData={chatbotAnimation} loop={true} className="w-full max-w-xs" />
            </div>
            
            {/* Right side - Welcome content (60%) */}
            <div className="md:w-3/5 p-8 flex flex-col justify-between">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-heading mb-4">
                  Hi! I'm your cute robot assistant! 🤖
                </h2>
                <p className="text-muted text-lg mb-8">
                  I'll be helping you get a shipping quote today. Let me guide you through 
                  a quick tutorial to make this process smooth and easy!
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleGetStarted}
                  className="w-full px-6 py-4 bg-primary hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started with Tutorial
                </button>
                <button
                  onClick={handleSkipTutorial}
                  className="w-full px-6 py-4 bg-surface hover:bg-surface border-2 border-main text-content text-lg font-semibold rounded-lg transition-all"
                >
                  Continue Without Tutorial
                </button>
                <button
                  onClick={handleSkipTutorial}
                  className="w-full text-muted hover:text-content text-sm transition-colors"
                >
                  Skip tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showTutorial && tutorialStep > 0) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-main">
          <div className="flex flex-col md:flex-row">
            {/* Left side - Lottie Animation (40%) */}
            <div className="md:w-2/5 bg-gradient-to-br from-primary to-blue-700 p-8 flex items-center justify-center">
              <Lottie animationData={chatbotAnimation} loop={true} className="w-full max-w-xs" />
            </div>
            
            {/* Right side - Tutorial steps (60%) */}
            <div className="md:w-3/5 p-8 flex flex-col justify-between">
              <div className="flex-1 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="text-primary font-semibold text-sm">
                    Step {tutorialStep} of {tutorialSteps.length - 1}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-heading mb-4">
                  {tutorialSteps[tutorialStep].title}
                </h2>
                <p className="text-muted text-lg">
                  {tutorialSteps[tutorialStep].description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6">
                <button
                  onClick={handleSkipTutorial}
                  className="text-muted hover:text-content text-sm transition-colors"
                >
                  Skip tutorial
                </button>
                
                <div className="flex items-center gap-3">
                  {tutorialStep > 1 && (
                    <button
                      onClick={handlePrevStep}
                      className="p-3 bg-surface hover:bg-surface border border-main text-content rounded-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-3 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    {tutorialStep === tutorialSteps.length - 1 ? (
                      <>Start Quoting</>
                    ) : (
                      <>
                        Next <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface rounded-2xl shadow-xl border border-main p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-heading mb-2">Request a Quote</h1>
            <p className="text-muted text-lg">Fill out the form below to get your shipping quote</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Personal Information */}
            <div className="space-y-4">
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
            <div className="space-y-4">
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
            <div className="space-y-4">
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
            <div className="space-y-4">
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
                      <input type="text" className="modal-input" placeholder="General Cargo" required />
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
            <div className="space-y-4">
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
                  <input type="date" className="modal-input" required />
                </div>
                <div>
                  <label className="modal-label">Preferred Delivery Date</label>
                  <input type="date" className="modal-input" />
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
    </div>
  );
};

export default Quote;
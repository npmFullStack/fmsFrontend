import React from 'react';
import Lottie from 'lottie-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import chatbotAnimation from '../assets/lottie/Chatbot.json';

const GizmoTutorial = ({ 
  tutorialStep, 
  onSkip, 
  onNext, 
  onPrev, 
  onGetStarted 
}) => {
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

  // Initial welcome screen (step 0)
  if (tutorialStep === 0) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center p-4">
        <div className="bg-surface rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-main">
          <div className="flex flex-col md:flex-row">
            {/* Left side - Lottie Animation (40%) */}
            <div className="md:w-2/5 bg-[#36C2FD] p-8 flex items-center justify-center">
              <Lottie animationData={chatbotAnimation} loop={true} className="w-full max-w-xs" />
            </div>
            
            {/* Right side - Welcome content (60%) */}
            <div className="md:w-3/5 p-8 flex flex-col justify-between">
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-heading mb-4">
                  Hi! Gizmo here to help you out!
                </h2>
                <p className="text-muted text-lg mb-8">
                  I'll be helping you get a shipping quote today. Let me guide you through 
                  a quick tutorial to make this process smooth and easy!
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={onGetStarted}
                  className="w-full px-6 py-4 bg-primary hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started with Tutorial
                </button>
                <button
                  onClick={onSkip}
                  className="w-full px-6 py-4 bg-surface hover:bg-surface border-2 border-main text-content text-lg font-semibold rounded-lg transition-all"
                >
                  Continue Without Tutorial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tutorial steps (step 1-6)
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
                onClick={onSkip}
                className="text-muted hover:text-content text-sm transition-colors"
              >
                Skip tutorial
              </button>
              
              <div className="flex items-center gap-3">
                {tutorialStep > 1 && (
                  <button
                    onClick={onPrev}
                    className="w-10 h-10 flex items-center justify-center bg-primary hover:bg-blue-700 text-white rounded-full transition-all shadow-lg hover:shadow-xl"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onNext}
                  className="w-10 h-10 flex items-center justify-center bg-primary hover:bg-blue-700 text-white rounded-full transition-all shadow-lg hover:shadow-xl"
                >
                  {tutorialStep === tutorialSteps.length - 1 ? (
                    <span className="text-xl">✓</span>
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GizmoTutorial;
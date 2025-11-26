import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Ship,
  Truck,
  Package,
  Clock,
  Shield,
  TrendingUp,
  MapPin,
  CheckCircle,
  Phone,
  Mail,
} from 'lucide-react';
import playstore from '../assets/images/playstore.png';
import CardTilt from '../components/CardTilt';
import TextShine from '../components/TextShine';

const Home = () => {
  const navigate = useNavigate();

  const handleDownloadClick = () => {
    window.open('https://xtramile.com', '_blank');
  };

  const services = [
    {
      icon: <Ship className="w-12 h-12" />,
      title: 'Sea Freight',
      description:
        'Comprehensive ocean freight solutions for FCL and LCL shipments worldwide.',
      features: ['FCL & LCL Options', 'Door-to-Door Service', 'Customs Clearance'],
    },
    {
      icon: <Truck className="w-12 h-12" />,
      title: 'Land Transport',
      description:
        'Reliable ground transportation across the Philippines with real-time tracking.',
      features: ['Nationwide Coverage', 'Express Delivery', 'Secure Handling'],
    },
    {
      icon: <Package className="w-12 h-12" />,
      title: 'Warehousing',
      description:
        'State-of-the-art storage facilities with inventory management systems.',
      features: ['Climate Control', '24/7 Security', 'Flexible Storage'],
    },
  ];

  const features = [
    {
      title: 'On-Time Delivery',
      description: '98% on-time delivery rate with real-time tracking',
    },
    {
      title: 'Secure & Insured',
      description: 'Full insurance coverage for your cargo',
    },
    {
      title: 'Competitive Rates',
      description: 'Best pricing without compromising quality',
    },
    {
      title: 'Wide Network',
      description: 'Coverage across major ports and cities',
    },
  ];

  const stats = [
    { number: '10+', label: 'Years Experience' },
    { number: '5000+', label: 'Shipments Delivered' },
    { number: '98%', label: 'On-Time Rate' },
    { number: '24/7', label: 'Customer Support' },
  ];

  return (
    <div className="relative pt-16">
      {/* Home Section */}
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-main"
      >
        {/* Adaptive Background */}
        <div
          className="absolute inset-0 z-0 h-full w-full"
          style={{
            background:
              'radial-gradient(125% 125% at 50% 10%, rgb(var(--color-bg)) 40%, #1d4ed8 100%)',
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <TextShine>Need Reliable Shipping</TextShine>
            <br />
            <span className="text-primary">Solutions?</span>
          </h1>

          <p className="text-xl md:text-2xl text-content mb-8 max-w-3xl mx-auto">
            Your trusted partner for sea and land logistics. Fast, secure, and affordable
            shipping across the Philippines.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/quote')}
              className="px-8 py-4 bg-primary hover:bg-blue-800 text-white text-lg font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get a Quote Now
            </button>

            <button
              onClick={handleDownloadClick}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-main text-content text-lg font-semibold rounded-lg hover:bg-white hover:text-primary transition-all"
            >
              <img src={playstore} alt="Play Store" className="w-6 h-6 object-contain" />
              Download App
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-content mb-2">
                  {stat.number}
                </div>
                <div className="text-content text-sm md:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-surface py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-heading mb-4">About XMFFI</h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Leading logistics provider specializing in sea and land freight solutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-heading mb-6">Who We Are</h3>
              <p className="text-muted text-lg mb-6 leading-relaxed">
                XMFFI is a premier logistics company dedicated to providing comprehensive
                shipping solutions across the Philippines and international routes. With over a
                decade of experience, we've built a reputation for reliability, efficiency, and
                customer satisfaction.
              </p>
              <p className="text-muted text-lg mb-6 leading-relaxed">
                Our team of logistics experts ensures your cargo reaches its destination safely
                and on time, every time. We leverage cutting-edge technology and an extensive
                network to provide seamless shipping experiences.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-heading">{feature.title}</h4>
                      <p className="text-sm text-muted">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <CardTilt>
                <div className="bg-primary rounded-2xl p-8 text-white">
                  <Ship className="w-12 h-12 mb-4" />
                  <h4 className="text-2xl font-bold mb-2">Sea Freight</h4>
                  <p className="text-blue-100">International & domestic ocean shipping</p>
                </div>
              </CardTilt>

              <CardTilt>
                <div className="bg-orange-600 rounded-2xl p-8 text-white mt-8">
                  <Truck className="w-12 h-12 mb-4" />
                  <h4 className="text-2xl font-bold mb-2">Land Transport</h4>
                  <p className="text-orange-100">Nationwide ground delivery</p>
                </div>
              </CardTilt>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-main py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-heading mb-4">Our Services</h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Comprehensive logistics solutions tailored to your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-surface border border-main rounded-2xl p-8 hover:shadow-2xl transition-all transform hover:scale-105"
              >
                <div className="text-primary mb-6">{service.icon}</div>
                <h3 className="text-2xl font-bold text-heading mb-4">{service.title}</h3>
                <p className="text-muted mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-content">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-surface py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-heading mb-4">Get In Touch</h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Ready to ship? Contact us today for a personalized quote
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-main border border-main rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-heading mb-6">Send us a message</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-content mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-surface border border-main rounded-lg text-content focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-content mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 bg-surface border border-main rounded-lg text-content focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-content mb-2">Message</label>
                  <textarea
                    rows="4"
                    className="w-full px-4 py-3 bg-surface border border-main rounded-lg text-content focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                    placeholder="Tell us about your shipping needs..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-primary hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div className="bg-main border border-main rounded-2xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-primary rounded-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-heading mb-2">Phone</h4>
                    <p className="text-muted">+63 123 456 7890</p>
                    <p className="text-muted">+63 098 765 4321</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-primary rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-heading mb-2">Email</h4>
                    <p className="text-muted">info@xmffi.com</p>
                    <p className="text-muted">support@xmffi.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary rounded-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-heading mb-2">Office</h4>
                    <p className="text-muted">123 Business St., Quezon City</p>
                    <p className="text-muted">Metro Manila, Philippines</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Business Hours</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-semibold">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold">9:00 AM - 3:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold">Closed</span>
                  </div>
                </div>
                <p className="mt-6 text-blue-100 text-sm">
                  *24/7 customer support available for urgent shipping inquiries
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-main text-content border-t border-main py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 XMFFI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
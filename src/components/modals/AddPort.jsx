import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, MapPin, Eye, X } from 'lucide-react';
import SharedModal from '../ui/SharedModal';
import LocationMap from '../ui/LocationMap';

const portSchema = z.object({
  name: z.string().min(2, 'Port name must be at least 2 characters'),
  route_name: z.string().min(2, 'Route name must be at least 2 characters'),
  address: z.string().min(1, 'Address is required'),
  latitude: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90, {
    message: 'Valid latitude is required (-90 to 90)',
  }),
  longitude: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180, {
    message: 'Valid longitude is required (-180 to 180)',
  }),
});

const AddPort = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(portSchema),
    mode: 'onChange',
  });

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({ lat: null, lng: null });
  const [showMap, setShowMap] = useState(false);

  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const address = watch('address');
  const name = watch('name');
  const routeName = watch('route_name');

  useEffect(() => {
    if (isOpen) {
      reset();
      setShowMap(false);
    }
  }, [isOpen, reset]);

  // Extract city/province from address for route name
  const extractRouteName = (address) => {
    if (!address) return '';
    
    const parts = address.split(',');
    if (parts.length > 0) {
      // Look for city in the address parts
      for (let i = 0; i < Math.min(parts.length, 2); i++) {
        const part = parts[i].trim();
        // Skip if it's a street address or number
        if (part.match(/^\d/) || part.includes('Street') || part.includes('St.') || part.length < 3) {
          continue;
        }
        // Return the first meaningful part as route name
        return part;
      }
      // Fallback to first part
      return parts[0].trim();
    }
    return address;
  };

  // Extract full port name from address
  const extractPortName = (address) => {
    if (!address) return '';
    
    const parts = address.split(',');
    if (parts.length > 1) {
      // Use the first two parts for port name (e.g., "Manila International Port, Manila")
      return parts.slice(0, 2).map(part => part.trim()).join(', ');
    }
    return address;
  };

  // Fetch address suggestions using LocationIQ
  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?` +
        `key=${import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN}&` +
        `q=${encodeURIComponent(query)}&` +
        `countrycodes=ph&` +
        `limit=5&` +
        `format=json`
      );
      
      const data = await response.json();
      setAddressSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleAddressChange = (e) => {
    const value = e.target.value;
    setValue('address', value, { shouldValidate: true });
    
    // Auto-fill route name and port name if empty
    if (!routeName) {
      const extractedRouteName = extractRouteName(value);
      setValue('route_name', extractedRouteName, { shouldValidate: true });
    }
    if (!name) {
      const extractedPortName = extractPortName(value);
      setValue('name', extractedPortName, { shouldValidate: true });
    }
    
    fetchAddressSuggestions(value);
  };

  const handleAddressSelect = (suggestion) => {
    const { lat, lon, display_name } = suggestion;
    
    setValue('address', display_name, { shouldValidate: true });
    setValue('latitude', lat.toString(), { shouldValidate: true });
    setValue('longitude', lon.toString(), { shouldValidate: true });
    
    // Extract and set route name and port name
    const extractedRouteName = extractRouteName(display_name);
    const extractedPortName = extractPortName(display_name);
    
    setValue('route_name', extractedRouteName, { shouldValidate: true });
    setValue('name', extractedPortName, { shouldValidate: true });
    
    setSelectedLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const handleMapLocationChange = (lat, lng) => {
    setValue('latitude', lat.toString(), { shouldValidate: true });
    setValue('longitude', lng.toString(), { shouldValidate: true });
    setSelectedLocation({ lat, lng });
  };

  // Handle when location is set from the map
  const handleLocationSet = (lat, lng, cityName) => {
    // Close the map modal
    setShowMap(false);
    
    // Set the coordinates
    setValue('latitude', lat.toString(), { shouldValidate: true });
    setValue('longitude', lng.toString(), { shouldValidate: true });
    
    // Use the city name from map search for route name
    if (cityName && !routeName) {
      setValue('route_name', cityName, { shouldValidate: true });
    }
    
    // Reverse geocode to get full address
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse?` +
        `key=${import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN}&` +
        `lat=${lat}&` +
        `lon=${lng}&` +
        `format=json`
      );
      
      const data = await response.json();
      if (data.display_name) {
        setValue('address', data.display_name, { shouldValidate: true });
        
        // Extract and set route name and port name
        const extractedRouteName = extractRouteName(data.display_name);
        const extractedPortName = extractPortName(data.display_name);
        
        if (!routeName) {
          setValue('route_name', extractedRouteName, { shouldValidate: true });
        }
        if (!name) {
          setValue('name', extractedPortName, { shouldValidate: true });
        }
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const onSubmit = (data) => {
    const portData = {
      ...data,
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      is_active: true,
    };
    onSave(portData);
  };

  return (
    <>
      <SharedModal isOpen={isOpen} onClose={onClose} title="Add Port" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Address Field - First with View Map button at top right */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="modal-label">
                Address
              </label>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors font-medium"
              >
                <Eye className="w-4 h-4" />
                View Map
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Type to search for address..."
                className="modal-input pr-10"
                value={address || ''}
                onChange={handleAddressChange}
                onFocus={() => addressSuggestions.length > 0 && setShowSuggestions(true)}
              />
              {isGeocoding && (
                <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-muted" />
              )}
              <MapPin className="absolute right-3 top-3 w-4 h-4 text-muted" />
            </div>
            
            {/* Address Suggestions */}
            {showSuggestions && addressSuggestions.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-surface border border-main rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-main last:border-b-0 transition-colors"
                    onClick={() => handleAddressSelect(suggestion)}
                  >
                    <div className="font-medium text-content">{suggestion.display_name}</div>
                  </button>
                ))}
              </div>
            )}
            {errors.address && <span className="modal-error">{errors.address.message}</span>}
          </div>

          {/* Route Name Field */}
          <div>
            <label className="modal-label">
              Route Name
            </label>
            <input
              type="text"
              placeholder="Route name (e.g., Manila)"
              className="modal-input"
              {...register('route_name')}
            />
            {errors.route_name && <span className="modal-error">{errors.route_name.message}</span>}
            <p className="text-xs text-muted mt-1">
              This will be used when selecting origin/destination for routes
            </p>
          </div>

          {/* Port Name Field */}
          <div>
            <label className="modal-label">
              Port Name
            </label>
            <input
              type="text"
              placeholder="Full port name"
              className="modal-input"
              {...register('name')}
            />
            {errors.name && <span className="modal-error">{errors.name.message}</span>}
          </div>

          {/* Hidden Coordinates (automatically filled) */}
          <div className="hidden">
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />
          </div>

          {/* Info Box */}
          <div className="modal-info-box">
            <div className="modal-info-title">
              <span>How to add a port</span>
            </div>
            <p className="modal-info-text">
              Type an address and select from suggestions, or click "View Map" to select location directly on the map. 
              Route name and port name will be automatically extracted from the address.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`modal-btn-cancel ${isLoading ? 'modal-btn-disabled' : ''}`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`modal-btn-primary ${(!isValid || isLoading) ? 'modal-btn-disabled' : ''}`}
              disabled={isLoading || !isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Port'
              )}
            </button>
          </div>
        </form>
      </SharedModal>

      {/* Overlay Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMap(false)}
          />
          
          {/* Map Container */}
          <div className="relative bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-main">
            {/* Map Header */}
            <div className="flex items-center justify-between p-4 border-b border-main">
              <h3 className="text-lg font-semibold text-content">Select Port Location</h3>
              <button 
                onClick={() => setShowMap(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-content" />
              </button>
            </div>
            
            {/* Map Content */}
            <div className="p-4">
              <LocationMap
                latitude={latitude ? parseFloat(latitude) : null}
                longitude={longitude ? parseFloat(longitude) : null}
                onLocationChange={handleMapLocationChange}
                onLocationSet={handleLocationSet}
                height="500px"
                interactive={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPort;
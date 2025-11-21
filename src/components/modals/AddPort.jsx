import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { portSchema, defaultPortValues } from '../../schemas/portSchema';
import { Loader2, MapPin, AlertCircle } from 'lucide-react';
import SharedModal from '../ui/SharedModal';

const AddPort = ({ isOpen, onClose, onSave, isLoading = false }) => {
  const { 
    register, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    formState: { errors, isValid } 
  } = useForm({
    resolver: zodResolver(portSchema),
    mode: 'onChange',
    defaultValues: defaultPortValues,
  });

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({ lat: null, lng: null });

  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const address = watch('address');
  const name = watch('name');
  const routeName = watch('route_name');

  useEffect(() => {
    if (isOpen) {
      reset(defaultPortValues);
      setAddressSuggestions([]);
      setShowSuggestions(false);
      setSelectedLocation({ lat: null, lng: null });
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
    setValue('latitude', parseFloat(lat), { shouldValidate: true });
    setValue('longitude', parseFloat(lon), { shouldValidate: true });
    
    // Extract and set route name and port name
    const extractedRouteName = extractRouteName(display_name);
    const extractedPortName = extractPortName(display_name);
    
    setValue('route_name', extractedRouteName, { shouldValidate: true });
    setValue('name', extractedPortName, { shouldValidate: true });
    
    setSelectedLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
    setShowSuggestions(false);
    setAddressSuggestions([]);
  };

  const onSubmit = (data) => {
    // Format the data properly
    const formattedData = {
      name: data.name.trim(),
      route_name: data.route_name.trim(),
      address: data.address?.trim() || null,
      latitude: data.latitude,
      longitude: data.longitude,
    };
    onSave(formattedData);
  };

  const handleClose = () => {
    reset(defaultPortValues);
    onClose();
  };

  return (
    <SharedModal isOpen={isOpen} onClose={handleClose} title="Add Port" size="sm">
<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Address Field */}
        <div>
          <label className="modal-label">
            Address
          </label>
          
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
            <div className="absolute z-20 w-full mt-1 bg-surface border border-main rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {addressSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-main last:border-b-0 transition-colors text-sm"
                  onClick={() => handleAddressSelect(suggestion)}
                >
                  <div className="font-medium text-content">{suggestion.display_name}</div>
                </button>
              ))}
            </div>
          )}
          {errors.address && <span className="modal-error text-sm">{errors.address.message}</span>}
        </div>

        {/* Route Name Field */}
        <div>
          <label className="modal-label">
            Route Name
          </label>
          <input
            type="text"
            placeholder="Route name (e.g., MNL)"
            className="modal-input"
            {...register('route_name')}
          />
          {errors.route_name && <span className="modal-error text-sm">{errors.route_name.message}</span>}
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
          {errors.name && <span className="modal-error text-sm">{errors.name.message}</span>}
        </div>

        {/* Hidden Coordinates (automatically filled) */}
        <div className="hidden">
          <input type="hidden" {...register('latitude', { valueAsNumber: true })} />
          <input type="hidden" {...register('longitude', { valueAsNumber: true })} />
        </div>

        {/* Info Box - Updated to match AddBooking design */}
        <div className="email-notice border border-blue-700 bg-blue-900 py-2">
          <div className="flex items-start gap-3 pl-3">
            <AlertCircle className="email-notice-icon text-blue-100 w-4 h-4 mt-0.5" />
            <div className="email-notice-text text-blue-200 text-sm">
              <p className="font-medium">How to add a port:</p>
              <p>Type an address and select from suggestions. Route name and port name will be automatically extracted.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            type="button"
            onClick={handleClose}
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
  );
};

export default AddPort;
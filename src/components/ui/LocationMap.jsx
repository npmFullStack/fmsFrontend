import React, { useRef, useEffect, useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const LocationMap = ({ 
  latitude, 
  longitude, 
  onLocationChange,
  onLocationSet,
  height = '400px',
  zoom = 12,
  interactive = true
}) => {
  const mapContainer = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const locationIqToken = import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN;

  const getMapUrl = () => {
    if (!locationIqToken) {
      console.error('LocationIQ access token is not defined');
      return '';
    }

    const baseUrl = 'https://maps.locationiq.com/v3/staticmap';
    const params = new URLSearchParams({
      key: locationIqToken,
      center: `${latitude || 14.5995},${longitude || 120.9842}`,
      zoom: zoom.toString(),
      size: '600x400',
      format: 'png',
      markers: latitude && longitude ? `icon:small-blue-cutout|${latitude},${longitude}` : ''
    });

    return `${baseUrl}?${params.toString()}`;
  };

  // Extract city name from address for route name
  const extractCityName = (address) => {
    if (!address) return '';
    
    const parts = address.split(',');
    if (parts.length > 0) {
      // Look for city in the address parts (usually the first or second part)
      for (let i = 0; i < Math.min(parts.length, 2); i++) {
        const part = parts[i].trim();
        // Skip if it's a street address or number
        if (part.match(/^\d/) || part.includes('Street') || part.includes('St.') || part.length < 3) {
          continue;
        }
        // Return the first meaningful part as city name
        return part;
      }
      // Fallback to first part
      return parts[0].trim();
    }
    return address;
  };

  // Search for locations
  const handleSearch = async (query) => {
    if (!query || query.length < 3) {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.locationiq.com/v1/autocomplete?` +
        `key=${locationIqToken}&` +
        `q=${encodeURIComponent(query)}&` +
        `countrycodes=ph&` +
        `limit=5&` +
        `format=json`
      );
      
      const data = await response.json();
      setSearchSuggestions(data || []);
      setShowSearchSuggestions(true);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSelect = (suggestion) => {
    const { lat, lon, display_name } = suggestion;
    onLocationChange(parseFloat(lat), parseFloat(lon));
    
    // Extract city name for route name
    const cityName = extractCityName(display_name);
    setSearchQuery(cityName);
    
    setShowSearchSuggestions(false);
    setSearchSuggestions([]);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  const handleSetLocation = () => {
    if (latitude && longitude && onLocationSet) {
      onLocationSet(latitude, longitude, searchQuery);
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    setMapLoaded(true);

    const handleMapClick = (e) => {
      if (!interactive || !onLocationChange) return;
      
      const rect = mapContainer.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const lat = latitude ? latitude - ((y - 200) / 400) * 0.1 : 14.5995;
      const lng = longitude ? longitude + ((x - 300) / 600) * 0.1 : 120.9842;
      
      onLocationChange(lat, lng);
    };

    if (interactive) {
      mapContainer.current.addEventListener('click', handleMapClick);
    }

    return () => {
      if (mapContainer.current && interactive) {
        mapContainer.current.removeEventListener('click', handleMapClick);
      }
    };
  }, [latitude, longitude, zoom, interactive, onLocationChange]);

  if (!locationIqToken) {
    return (
      <div 
        className="location-map-container rounded-lg overflow-hidden relative bg-surface flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-red-400 p-4">
          <p className="font-medium">LocationIQ token not configured</p>
          <p className="text-sm mt-1 text-muted">
            Please set VITE_LOCATIONIQ_ACCESS_TOKEN in your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="location-map-container rounded-lg overflow-hidden relative bg-surface border border-main">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for city or location..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchSuggestions.length > 0 && setShowSearchSuggestions(true)}
              className="modal-input pr-24 bg-surface text-content placeholder-muted"
            />
            {isSearching && (
              <div className="absolute right-14 top-3 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            <Search className="absolute right-10 top-3 w-4 h-4 text-muted" />
            
            {/* Set Location Button */}
            <button
              onClick={handleSetLocation}
              className="absolute right-3 top-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors font-medium"
              disabled={!latitude || !longitude}
            >
              Set
            </button>
          </div>
          
          {/* Search Suggestions */}
          {showSearchSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-surface border border-main rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-main last:border-b-0 transition-colors text-content"
                  onClick={() => handleSearchSelect(suggestion)}
                >
                  <div className="font-medium">{suggestion.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div 
        ref={mapContainer} 
        className="location-map rounded-lg"
        style={{ 
          height, 
          backgroundImage: `url(${getMapUrl()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          cursor: interactive ? 'pointer' : 'default'
        }}
      >
        {interactive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-70 text-white px-4 py-3 rounded-lg text-sm border border-main">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Click on map to set location</span>
              </div>
            </div>
          </div>
        )}

        {/* Current Location Indicator */}
        {(latitude && longitude) && (
          <div className="absolute bottom-4 left-4 bg-surface border border-main rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-content">
              <MapPin className="w-4 h-4 text-blue-600" />
              <div className="text-sm">
                <div className="font-medium">Location Selected</div>
                <div className="text-xs text-muted">
                  {searchQuery || 'City name will appear here'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMap;
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type LocationStatus = 'idle' | 'detecting' | 'granted' | 'denied' | 'unavailable';

export interface LocationData {
  latitude: number;
  longitude: number;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  displayName: string;
}

interface LocationContextType {
  location: LocationData | null;
  status: LocationStatus;
  errorMessage: string | null;
  requestLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(() => {
    try {
      const cached = sessionStorage.getItem('kanyakriti_current_location');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [status, setStatus] = useState<LocationStatus>('detecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number): Promise<LocationData> => {
    try {
      // Attempt server reverse geocoding
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
      if (res.ok) {
        const data = await res.json();
        return {
          latitude: lat,
          longitude: lng,
          locality: data.locality,
          city: data.city,
          state: data.state,
          country: data.country,
          displayName: data.displayName || `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
        };
      }
    } catch (err) {
      console.warn('Backend geocode hitch, trying direct nominatim lookup:', err);
    }

    // Direct fallback lookup if server route had a hiccup
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const locality = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.town || '';
        const city = addr.city || addr.town || addr.municipality || addr.state_district || '';
        const state = addr.state || '';
        const parts = [locality, city || state].filter(Boolean);
        const displayName = parts.length > 0 ? parts.join(', ') : (data.name || `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`);
        return {
          latitude: lat,
          longitude: lng,
          locality,
          city,
          state,
          country: addr.country,
          displayName,
        };
      }
    } catch {
      // ignore
    }

    return {
      latitude: lat,
      longitude: lng,
      displayName: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
    };
  };

  const requestLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      setErrorMessage('Geolocation is not supported by your browser');
      setLocation(null);
      return;
    }

    setStatus('detecting');
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const locData = await reverseGeocode(lat, lng);
          setLocation(locData);
          setStatus('granted');
          try {
            sessionStorage.setItem('kanyakriti_current_location', JSON.stringify(locData));
          } catch {
            // ignore
          }
        } catch (err) {
          setLocation({
            latitude: lat,
            longitude: lng,
            displayName: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
          });
          setStatus('granted');
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied');
          setErrorMessage('Location permission denied');
        } else {
          setStatus('unavailable');
          setErrorMessage('Location unavailable');
        }
        setLocation(null);
        try {
          sessionStorage.removeItem('kanyakriti_current_location');
        } catch {
          // ignore
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, []);

  useEffect(() => {
    // Initial gentle location check
    requestLocation();
  }, [requestLocation]);

  return (
    <LocationContext.Provider
      value={{
        location,
        status,
        errorMessage,
        requestLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useCurrentLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useCurrentLocation must be used within a LocationProvider');
  }
  return context;
};

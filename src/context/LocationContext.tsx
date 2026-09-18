import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type LocationStatus = 'idle' | 'detecting' | 'granted' | 'denied' | 'unavailable';
export type LocationSource = 'gps' | 'manual' | 'default';

export interface LocationData {
  latitude: number;
  longitude: number;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  displayName: string;
  source: LocationSource;
}

export interface LocationContextType {
  location: LocationData | null;
  status: LocationStatus;
  errorMessage: string | null;
  selectedRadius: number;
  setSelectedRadius: (radius: number) => void;
  requestLocation: () => Promise<void>;
  setManualLocation: (data: {
    latitude: number;
    longitude: number;
    locality?: string;
    city?: string;
    state?: string;
    country?: string;
    displayName?: string;
  }) => void;
  geocodeAndSetNeighbourhood: (query: string) => Promise<boolean>;
  isNeighbourhoodModalOpen: boolean;
  openNeighbourhoodModal: () => void;
  closeNeighbourhoodModal: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'kanyakriti_authoritative_location';
const RADIUS_KEY = 'kanyakriti_selected_radius';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationData | null>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem('kanyakriti_current_location');
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          source: parsed.source || 'manual',
        };
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [status, setStatus] = useState<LocationStatus>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) return 'granted';
    } catch {
      // ignore
    }
    return 'detecting';
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [selectedRadius, setSelectedRadiusState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(RADIUS_KEY);
      if (saved) {
        const num = Number(saved);
        if (num > 0) return num;
      }
    } catch {
      // ignore
    }
    return 5;
  });

  const [isNeighbourhoodModalOpen, setIsNeighbourhoodModalOpen] = useState<boolean>(false);

  const openNeighbourhoodModal = useCallback(() => {
    setIsNeighbourhoodModalOpen(true);
  }, []);

  const closeNeighbourhoodModal = useCallback(() => {
    setIsNeighbourhoodModalOpen(false);
  }, []);

  const setSelectedRadius = useCallback((radius: number) => {
    setSelectedRadiusState(radius);
    try {
      localStorage.setItem(RADIUS_KEY, String(radius));
    } catch {
      // ignore
    }
  }, []);

  // Sync with backend active location
  const syncWithBackend = useCallback((locData: LocationData) => {
    fetch('/api/location/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: locData.latitude,
        longitude: locData.longitude,
        locality: locData.locality,
        city: locData.city,
        source: locData.source,
      }),
    }).catch((err) => {
      console.warn('[Location] Backend sync warning:', err);
    });
  }, []);

  const reverseGeocode = async (lat: number, lng: number): Promise<Omit<LocationData, 'source'>> => {
    try {
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
      console.warn('[Location] Server geocode warning, checking nominatim fallback:', err);
    }

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' }, signal: AbortSignal.timeout(4000) }
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

  const setManualLocation = useCallback((data: {
    latitude: number;
    longitude: number;
    locality?: string;
    city?: string;
    state?: string;
    country?: string;
    displayName?: string;
  }) => {
    const locality = (data.locality || '').trim();
    const city = (data.city || '').trim();
    const displayName = data.displayName || [locality, city].filter(Boolean).join(', ') || `${data.latitude.toFixed(3)}°, ${data.longitude.toFixed(3)}°`;

    const fullLoc: LocationData = {
      latitude: data.latitude,
      longitude: data.longitude,
      locality,
      city,
      state: data.state,
      country: data.country,
      displayName,
      source: 'manual',
    };

    setLocation(fullLoc);
    setStatus('granted');
    setErrorMessage(null);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullLoc));
      sessionStorage.setItem('kanyakriti_current_location', JSON.stringify(fullLoc));
    } catch {
      // ignore
    }

    syncWithBackend(fullLoc);
  }, [syncWithBackend]);

  const geocodeAndSetNeighbourhood = useCallback(async (query: string): Promise<boolean> => {
    const q = query.trim();
    if (!q) return false;

    try {
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          const match = data.results[0];
          setManualLocation({
            latitude: match.latitude,
            longitude: match.longitude,
            locality: match.locality,
            city: match.city,
            state: match.state,
            country: match.country,
            displayName: match.displayName,
          });
          return true;
        }
      }
    } catch (err) {
      console.warn('[Location] Forward geocode error:', err);
    }
    return false;
  }, [setManualLocation]);

  const requestLocation = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      setErrorMessage('Geolocation is not supported by your browser. Please choose your neighbourhood manually.');
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
          const fullLoc: LocationData = {
            ...locData,
            source: 'gps',
          };
          setLocation(fullLoc);
          setStatus('granted');
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fullLoc));
            sessionStorage.setItem('kanyakriti_current_location', JSON.stringify(fullLoc));
          } catch {
            // ignore
          }
          syncWithBackend(fullLoc);
        } catch (err) {
          const fallbackLoc: LocationData = {
            latitude: lat,
            longitude: lng,
            displayName: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°`,
            source: 'gps',
          };
          setLocation(fallbackLoc);
          setStatus('granted');
          syncWithBackend(fallbackLoc);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus('denied');
          setErrorMessage('Location permission denied. Please choose your neighbourhood manually.');
        } else {
          setStatus('unavailable');
          setErrorMessage('Could not detect device location. Please choose your neighbourhood manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  }, [syncWithBackend]);

  // Initial mount behavior:
  // If user previously manually chose their neighbourhood, respect it.
  // Otherwise, default to user's current device location via requestLocation().
  useEffect(() => {
    let hasManual = false;
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.source === 'manual') {
          hasManual = true;
          syncWithBackend(parsed);
        }
      }
    } catch {
      // ignore
    }

    if (!hasManual) {
      requestLocation();
    }
  }, [requestLocation, syncWithBackend]);

  return (
    <LocationContext.Provider
      value={{
        location,
        status,
        errorMessage,
        selectedRadius,
        setSelectedRadius,
        requestLocation,
        setManualLocation,
        geocodeAndSetNeighbourhood,
        isNeighbourhoodModalOpen,
        openNeighbourhoodModal,
        closeNeighbourhoodModal,
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

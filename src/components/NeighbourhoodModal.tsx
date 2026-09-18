import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  X,
  Check,
  Loader2,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useCurrentLocation, LocationData } from '../context/LocationContext';

const QUICK_NEIGHBOURHOODS = [
  { name: 'Koramangala', city: 'Bengaluru', lat: 12.9352, lng: 77.6245 },
  { name: 'Indiranagar', city: 'Bengaluru', lat: 12.9784, lng: 77.6408 },
  { name: 'HSR Layout', city: 'Bengaluru', lat: 12.9121, lng: 77.6446 },
  { name: 'Bandra West', city: 'Mumbai', lat: 19.0596, lng: 72.8295 },
  { name: 'Powai', city: 'Mumbai', lat: 19.1176, lng: 72.9060 },
  { name: 'Connaught Place', city: 'New Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'Hauz Khas', city: 'New Delhi', lat: 28.5494, lng: 77.2001 },
  { name: 'Sector 18', city: 'Noida', lat: 28.5708, lng: 77.3261 },
  { name: 'Koregaon Park', city: 'Pune', lat: 18.5362, lng: 73.8940 },
  { name: 'Banjara Hills', city: 'Hyderabad', lat: 17.4156, lng: 78.4350 },
  { name: 'Anna Nagar', city: 'Chennai', lat: 13.0850, lng: 80.2101 },
  { name: 'Salt Lake', city: 'Kolkata', lat: 22.5804, lng: 88.4172 },
];

export const NeighbourhoodModal: React.FC = () => {
  const {
    location,
    status,
    errorMessage,
    requestLocation,
    setManualLocation,
    isNeighbourhoodModalOpen,
    closeNeighbourhoodModal,
  } = useCurrentLocation();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRequestingGps, setIsRequestingGps] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isNeighbourhoodModalOpen) {
      setQuery('');
      setSearchResults([]);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isNeighbourhoodModalOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNeighbourhoodModalOpen) {
        closeNeighbourhoodModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNeighbourhoodModalOpen, closeNeighbourhoodModal]);

  // Debounced search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('[NeighbourhoodModal] Search failed:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const handleSelectResult = (item: any) => {
    setManualLocation({
      latitude: item.latitude,
      longitude: item.longitude,
      locality: item.locality,
      city: item.city,
      state: item.state,
      country: item.country,
      displayName: item.displayName,
    });
    closeNeighbourhoodModal();
  };

  const handleUseGps = async () => {
    setIsRequestingGps(true);
    try {
      await requestLocation();
      closeNeighbourhoodModal();
    } finally {
      setIsRequestingGps(false);
    }
  };

  if (!isNeighbourhoodModalOpen) return null;

  return (
    <div
      id="neighbourhood-modal-backdrop"
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeNeighbourhoodModal();
      }}
    >
      <div
        id="neighbourhood-modal-card"
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-rose-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-rose-100/70 bg-gradient-to-br from-[#FFF9FA] to-white relative">
          <button
            id="close-neighbourhood-modal-btn"
            type="button"
            onClick={closeNeighbourhoodModal}
            className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-rose-50 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-[#86293D] uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 text-[#C84B68]" />
            <span>Hyperlocal Context</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#4A1525] tracking-tight">
            Your Neighbourhood
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Select your location to discover verified women artisans, home bakers, and custom crafters in your vicinity.
          </p>

          {/* Current location banner if set */}
          {location && (
            <div className="mt-3.5 p-2.5 px-3 bg-rose-50/70 border border-rose-200/70 rounded-2xl flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#C84B68] shrink-0" />
                <span className="font-semibold text-[#4A1525] truncate">
                  Active: {location.locality || location.city || location.displayName}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                location.source === 'gps'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {location.source === 'gps' ? 'GPS Active' : 'Manual'}
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* GPS Quick Action */}
          <button
            id="use-current-gps-location-btn"
            type="button"
            onClick={handleUseGps}
            disabled={isRequestingGps || status === 'detecting'}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border border-rose-200 text-[#86293D] transition-all group shadow-2xs cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-rose-200 flex items-center justify-center text-[#C84B68] shadow-2xs group-hover:scale-105 transition-transform">
                {isRequestingGps ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#C84B68]" />
                ) : (
                  <Navigation className="w-4 h-4 text-[#C84B68]" />
                )}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#4A1525]">
                  Use Current Device Location (GPS)
                </div>
                <div className="text-[11px] text-stone-500">
                  {status === 'detecting' || isRequestingGps
                    ? 'Detecting your device GPS coordinates...'
                    : 'Auto-detect neighbourhood from your device'}
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#C84B68] group-hover:translate-x-0.5 transition-transform">
              Detect &rarr;
            </span>
          </button>

          {errorMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
              <span className="text-amber-600 font-bold">Note:</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Search Box */}
          <div>
            <label
              htmlFor="neighbourhood-search-input"
              className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5"
            >
              Search Any Locality or Colony
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                id="neighbourhood-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Bandra West, Connaught Place, Koramangala..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-stone-200 focus:border-[#C84B68] focus:ring-2 focus:ring-[#C84B68]/20 text-sm outline-hidden transition-all bg-white"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Live Search Results */}
          {isSearching && (
            <div className="flex items-center justify-center py-6 text-stone-400 text-xs gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#C84B68]" />
              <span>Searching neighbourhoods across India...</span>
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Matching Localities
              </div>
              <div className="max-h-48 overflow-y-auto divide-y divide-rose-50 rounded-2xl border border-rose-100 bg-white">
                {searchResults.map((item, idx) => (
                  <button
                    key={`${item.latitude}-${item.longitude}-${idx}`}
                    type="button"
                    onClick={() => handleSelectResult(item)}
                    className="w-full text-left p-3 hover:bg-rose-50/70 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <MapPin className="w-3.5 h-3.5 text-[#C84B68] shrink-0" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-[#4A1525] truncate">
                          {item.locality || item.displayName}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {[item.city, item.state].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#C84B68] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isSearching && query.length >= 2 && searchResults.length === 0 && (
            <div className="p-4 bg-stone-50 rounded-2xl text-center text-xs text-stone-500 border border-stone-100">
              No direct matches for "{query}". You can select from popular neighbourhoods below.
            </div>
          )}

          {/* Popular Neighbourhoods Quick Select */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C84B68]" />
              <span>Popular Indian Neighbourhoods</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_NEIGHBOURHOODS.map((qLoc) => {
                const isCurrent =
                  location &&
                  Math.abs(location.latitude - qLoc.lat) < 0.01 &&
                  Math.abs(location.longitude - qLoc.lng) < 0.01;

                return (
                  <button
                    key={qLoc.name}
                    type="button"
                    onClick={() =>
                      handleSelectResult({
                        latitude: qLoc.lat,
                        longitude: qLoc.lng,
                        locality: qLoc.name,
                        city: qLoc.city,
                        displayName: `${qLoc.name}, ${qLoc.city}`,
                      })
                    }
                    className={`text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col justify-between cursor-pointer ${
                      isCurrent
                        ? 'bg-rose-50 border-rose-300 text-[#86293D] font-bold shadow-2xs'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">{qLoc.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-[#C84B68] shrink-0" />}
                    </div>
                    <span className="text-[10px] text-stone-400 mt-0.5 truncate">{qLoc.city}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-stone-50 border-t border-rose-100 flex items-center justify-between text-xs text-stone-500">
          <span>The selected neighbourhood updates your search radius and map.</span>
          <button
            type="button"
            onClick={closeNeighbourhoodModal}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

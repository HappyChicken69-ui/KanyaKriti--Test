import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  MapPin,
  Filter,
  Star,
  Clock,
  IndianRupee,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Info,
  Layers,
  X,
  CreditCard,
  QrCode,
  Truck,
  Loader2,
  Tag,
  Compass,
} from 'lucide-react';
import {
  Listing,
  MatchScoreResult,
  Order,
  User,
  PaymentMethod,
  SearchSuggestion,
  SearchIntent,
} from '../types.ts';
import { matchNearbyArtisans, createOrder, fetchSearchSuggestions } from '../lib/api.ts';
import { LeafletMap } from './LeafletMap.tsx';
import { useCurrentLocation } from '../context/LocationContext.tsx';

interface BuyerViewProps {
  buyer: User;
  onOrderCreated: (order: Order) => void;
  buyerOrders: Order[];
}

const CATEGORIES = [
  'All',
  'Tailoring',
  'Alterations',
  'Cooking',
  'Handicrafts',
  'Embroidery',
  'Beauty',
];

export const BuyerView: React.FC<BuyerViewProps> = ({
  buyer,
  onOrderCreated,
  buyerOrders,
}) => {
  const {
    location,
    status: locationStatus,
    selectedRadius,
    setSelectedRadius,
    openNeighbourhoodModal,
  } = useCurrentLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [maxBudget, setMaxBudget] = useState<number | undefined>(undefined);
  const [matches, setMatches] = useState<MatchScoreResult[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Shortlisting & Intent metadata
  const [parsedIntent, setParsedIntent] = useState<SearchIntent | null>(null);
  const [shortlistSummary, setShortlistSummary] = useState<string | null>(null);
  const [isAiEnhanced, setIsAiEnhanced] = useState(false);

  // Search Autocomplete & Suggestions
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Active coordinates from unified location context
  const activeLat = location?.latitude ?? buyer.lat;
  const activeLng = location?.longitude ?? buyer.lng;

  // Selected listing for ordering
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [deliveryAddress, setDeliveryAddress] = useState(
    buyer.neighborhood
      ? `${buyer.neighborhood}${buyer.city ? `, ${buyer.city}` : ''}`
      : (location?.displayName || '')
  );

  useEffect(() => {
    if (!buyer.neighborhood && !deliveryAddress && location?.displayName) {
      setDeliveryAddress(location.displayName);
    }
  }, [buyer.neighborhood, deliveryAddress, location?.displayName]);

  const [instructions, setInstructions] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [selectedMatchForInfo, setSelectedMatchForInfo] = useState<MatchScoreResult | null>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions (debounced 150ms)
  useEffect(() => {
    let isCancelled = false;
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const results = await fetchSearchSuggestions(searchQuery);
        if (!isCancelled) {
          setSuggestions(results);
        }
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      } finally {
        if (!isCancelled) setLoadingSuggestions(false);
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const fetchMatches = async (overrideQuery?: string, overrideCategory?: string) => {
    setLoading(true);
    const effectiveQuery = overrideQuery !== undefined ? overrideQuery : searchQuery;
    const effectiveCategory = overrideCategory !== undefined ? overrideCategory : selectedCategory;

    try {
      const data = await matchNearbyArtisans({
        query: effectiveQuery,
        category: effectiveCategory === 'All' ? undefined : effectiveCategory,
        maxBudget,
        buyerLat: activeLat,
        buyerLng: activeLng,
        radiusKm: selectedRadius,
        locality: location?.locality,
        city: location?.city,
      });

      setMatches(data.matches || []);
      setParsedIntent(data.parsedIntent || null);
      setShortlistSummary(data.shortlistSummary || null);
      setIsAiEnhanced(!!data.isAiEnhanced);
    } catch (err) {
      console.error('Failed to query matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMatches();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedRadius, maxBudget, activeLat, activeLng]);

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);

    let nextCat = selectedCategory;
    if (suggestion.type === 'category' && CATEGORIES.includes(suggestion.text)) {
      setSelectedCategory(suggestion.text);
      nextCat = suggestion.text;
    }

    // Immediately trigger search
    fetchMatches(suggestion.text, nextCat);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    setIsSubmittingOrder(true);
    try {
      const newOrder = await createOrder({
        buyerId: buyer.id,
        listingId: selectedListing.id,
        paymentMethod,
        deliveryAddress,
        instructions,
      });
      onOrderCreated(newOrder);
      setSelectedListing(null);
    } catch (err: any) {
      alert(err.message || 'Failed to place order');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. HERO SEARCH & DISCOVERY BAR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xs border border-rose-100 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-[#FFF0F3] text-[#86293D] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200/80">
              <span>Hyperlocal Neighborhood Discovery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#4A1525] font-serif tracking-tight">
              Find verified women artisans near you
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm mt-1">
              Connect directly with neighborhood homemakers, tailors, cooks, and craftswomen.
            </p>
          </div>

          {/* Active Neighbourhood Quick Status */}
          <div
            onClick={openNeighbourhoodModal}
            className="self-start sm:self-center flex items-center gap-2.5 px-3.5 py-2 bg-[#FFF9FA] hover:bg-rose-50 border border-rose-200/80 rounded-2xl cursor-pointer transition-colors shadow-2xs"
            title="Click to change active neighbourhood"
          >
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-[#C84B68]">
              {locationStatus === 'detecting' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <MapPin className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase font-bold text-[#8C7A80] leading-none">
                Active Neighbourhood
              </div>
              <div className="text-xs font-bold text-[#4A1525] flex items-center gap-1 mt-0.5">
                <span>
                  {locationStatus === 'detecting'
                    ? 'Detecting GPS…'
                    : (location?.locality || location?.city || 'Select Area')}
                </span>
                <span className="text-[10px] text-[#C84B68] underline font-semibold ml-1">Change</span>
              </div>
            </div>
          </div>
        </div>

        {/* Natural Language Search Input with Autocomplete & Suggestions */}
        <div ref={searchContainerRef} className="relative z-30">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowSuggestions(false);
              }}
              placeholder="Try searching 'blouse alteration tomorrow', 'home tiffin', 'mehendi near me', 'hand embroidery under ₹500'..."
              className="w-full pl-12 pr-10 py-3.5 bg-[#FAF7F5] border border-rose-200/80 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-[#C84B68] focus:outline-none transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setShowSuggestions(false);
                  fetchMatches('');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </div>

          {/* Autocomplete / Suggestions Dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-rose-100 overflow-hidden z-50 text-left">
              <div className="px-4 py-2 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between text-[11px] font-bold text-[#86293D]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C84B68]" />
                  <span>
                    {searchQuery.trim()
                      ? `Suggestions for "${searchQuery}"`
                      : 'Popular Services in your Area'}
                  </span>
                </span>
                <span className="text-stone-400 font-normal">Click to search</span>
              </div>

              {loadingSuggestions && suggestions.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C84B68]" />
                  <span>Finding nearby artisan services…</span>
                </div>
              ) : suggestions.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-400">
                  No matching services found. Press enter to search all makers.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto divide-y divide-rose-50">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(s)}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-50/70 flex items-center justify-between transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-lg bg-rose-100/60 text-[#C84B68] flex items-center justify-center shrink-0">
                          {s.type === 'category' ? (
                            <Layers className="w-3.5 h-3.5" />
                          ) : s.type === 'skill' ? (
                            <Star className="w-3.5 h-3.5" />
                          ) : (
                            <Search className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-stone-900 group-hover:text-[#4A1525] truncate">
                            {s.text}
                          </div>
                          {s.subtitle && (
                            <div className="text-[10px] text-stone-500 truncate">
                              {s.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-[#C84B68] transition-colors shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* AI Parsed Intent Badge Banner */}
        {parsedIntent && (parsedIntent.rawQuery || parsedIntent.category || parsedIntent.maxBudget) && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FFF5F7] via-rose-50/80 to-[#FFF5F7] border border-rose-200/80 rounded-2xl text-xs">
            <div className="flex items-center gap-2 text-[#86293D]">
              <Sparkles className="w-4 h-4 text-[#C84B68] shrink-0" />
              <span className="font-bold">Understood Intent:</span>
              <span className="font-medium text-stone-800">
                {parsedIntent.intentSummary}
              </span>
            </div>
            {isAiEnhanced && (
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-0.5 rounded-full border border-rose-200 text-[10px] font-bold text-[#C84B68] shadow-2xs">
                <Sparkles className="w-3 h-3" /> AI Shortlist Active
              </span>
            )}
          </div>
        )}

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-rose-100">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setShowSuggestions(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#C84B68] text-white shadow-xs'
                    : 'bg-rose-50/60 text-stone-700 hover:bg-rose-100/60 border border-rose-100/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Distance and Budget Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-[#FAF7F5] px-3 py-1.5 rounded-xl font-medium border border-rose-100">
              <MapPin className="w-3.5 h-3.5 text-[#C84B68]" />
              <span>Radius:</span>
              <select
                value={selectedRadius}
                onChange={(e) => setSelectedRadius(Number(e.target.value))}
                className="bg-transparent font-bold text-stone-900 focus:outline-none cursor-pointer"
              >
                <option value={1}>1 km</option>
                <option value={3}>3 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-[#FAF7F5] px-3 py-1.5 rounded-xl font-medium border border-rose-100">
              <IndianRupee className="w-3.5 h-3.5 text-[#C84B68]" />
              <span>Budget:</span>
              <select
                value={maxBudget || ''}
                onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : undefined)}
                className="bg-transparent font-bold text-stone-900 focus:outline-none cursor-pointer"
              >
                <option value="">Any</option>
                <option value={200}>Under ₹200</option>
                <option value={300}>Under ₹300</option>
                <option value={500}>Under ₹500</option>
                <option value={1000}>Under ₹1,000</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. HYPERLOCAL LEAFLET MAP */}
      <div
        className="bg-white rounded-3xl p-4 shadow-2xs border border-rose-100 relative z-0 isolate"
        style={{ position: 'relative', zIndex: 0, isolation: 'isolate' }}
      >
        <div className="flex flex-wrap items-center justify-between mb-3 px-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C84B68] animate-pulse" />
            <span className="font-bold text-sm text-stone-900">
              Interactive Hyperlocal Map
            </span>
            <span className="text-xs text-stone-500 hidden sm:inline">
              • Showing nearby verified makers within {selectedRadius} km of {location?.locality || location?.city || 'selected area'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openNeighbourhoodModal}
              className="text-xs font-semibold text-[#86293D] hover:text-[#4A1525] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/70 transition-colors"
            >
              Change Area
            </button>
            <div className="text-xs text-[#86293D] font-bold">
              {matches.length} artisans matched
            </div>
          </div>
        </div>

        <LeafletMap
          centerLat={activeLat}
          centerLng={activeLng}
          radiusKm={selectedRadius}
          listings={matches.map((m) => m.listing)}
          onSelectListing={(l) => setSelectedListing(l)}
          className="h-72 sm:h-80 w-full rounded-2xl overflow-hidden shadow-inner border border-rose-100"
        />
      </div>

      {/* 3. MATCHED ARTISANS & TRANSPARENT SCORING GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="text-lg font-bold text-stone-900 font-serif">
              Hyperlocal Matches ({matches.length})
            </h3>
            <p className="text-xs text-stone-500">
              {shortlistSummary || 'Ranked via transparent multi-factor matching: 40% Skill + 35% Distance + 15% Rating + 10% Budget'}
            </p>
          </div>
          {isAiEnhanced && (
            <div className="self-start sm:self-center flex items-center gap-1.5 text-xs text-[#86293D] font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              <Sparkles className="w-3.5 h-3.5 text-[#C84B68]" />
              <span>AI Shortlisted</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="py-14 text-center text-stone-400 text-sm flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#C84B68]" />
            <span>Finding & shortlisting matching verified makers…</span>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-dashed border-rose-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#C84B68] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="font-bold text-stone-900 text-base">No artisans found matching your criteria</h4>
              <p className="text-xs text-stone-500">
                {searchQuery
                  ? `No verified services found for "${searchQuery}" within ${selectedRadius} km of ${location?.locality || 'your area'}.`
                  : `No listings found within ${selectedRadius} km for the selected filters.`}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {selectedRadius < 10 && (
                <button
                  type="button"
                  onClick={() => setSelectedRadius(10)}
                  className="px-4 py-2 bg-[#C84B68] text-white text-xs font-bold rounded-xl hover:bg-[#B33956] transition-colors cursor-pointer shadow-xs"
                >
                  Expand Radius to 10 km
                </button>
              )}
              {(searchQuery || selectedCategory !== 'All' || maxBudget) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setMaxBudget(undefined);
                    fetchMatches('', 'All');
                  }}
                  className="px-4 py-2 bg-rose-50 text-[#86293D] hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matches.map((match) => {
              const { listing, artisan, matchScore, distanceKm, reasons, aiInsight } = match;
              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-3xl border border-rose-100 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative"
                >
                  <div>
                    {/* Header Image & Match Badge */}
                    <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Top Match Score Pill */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                        <button
                          type="button"
                          onClick={() => setSelectedMatchForInfo(match)}
                          className="flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-md text-rose-200 text-xs font-bold px-2.5 py-1 rounded-full border border-rose-400/40 shadow-md cursor-pointer hover:bg-black"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-rose-300" />
                          <span>{matchScore}% Match</span>
                          <Info className="w-3 h-3 text-stone-400" />
                        </button>

                        {/* AI Shortlist Badge Pill */}
                        {aiInsight?.badge && (
                          <div className="bg-[#C84B68]/95 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-rose-300/40 shadow-md flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-200" />
                            <span>{aiInsight.badge}</span>
                          </div>
                        )}
                      </div>

                      {/* Distance pill */}
                      <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-400" />
                        <span>{distanceKm} km</span>
                      </div>

                      {/* Artisan info over image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2.5 text-white">
                        <img
                          src={artisan.avatar}
                          alt={artisan.name}
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-md shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs truncate flex items-center gap-1.5">
                            <span>{artisan.name}</span>
                            <span className="text-amber-300 inline-flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                              <span>{artisan.rating}</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-200 truncate">
                            {listing.neighborhood}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Listing Content */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#86293D] bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded">
                          {listing.customCategory || listing.category}
                        </span>
                        <div className="text-xs text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{listing.turnaroundDisplay}</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-stone-900 text-sm line-clamp-1">
                        {listing.title}
                      </h4>

                      <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                        {listing.description}
                      </p>

                      {/* AI Insight Reason (if shortlisted) */}
                      {aiInsight?.reason && (
                        <div className="bg-gradient-to-r from-[#FFF5F7] to-[#FFF0F3] border border-rose-200/80 rounded-xl p-2 text-[11px] text-[#86293D] flex items-start gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#C84B68] shrink-0 mt-0.5" />
                          <span className="leading-tight">{aiInsight.reason}</span>
                        </div>
                      )}

                      {/* Transparent Match Reasons */}
                      <div className="space-y-1 pt-0.5">
                        {reasons.slice(0, 2).map((r, idx) => (
                          <div
                            key={idx}
                            className="text-[11px] text-[#86293D] flex items-center gap-1 font-medium"
                          >
                            <CheckCircle className="w-3 h-3 text-[#C84B68] shrink-0" />
                            <span className="truncate">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Book Button */}
                  <div className="p-4 pt-2 border-t border-rose-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-semibold">Service Fee</span>
                      <div className="text-xl font-black text-[#4A1525]">₹{listing.price}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedListing(listing)}
                      className="py-2.5 px-4 rounded-xl bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-xs shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Book Service</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. TRANSPARENT MATCH BREAKDOWN MODAL */}
      {selectedMatchForInfo && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          style={{ zIndex: 99999 }}
        >
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C84B68]" />
                <h4 className="font-bold text-base font-serif text-[#4A1525]">Match Score Breakdown</h4>
              </div>
              <button
                onClick={() => setSelectedMatchForInfo(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center py-2.5 bg-[#FFF0F3] border border-rose-200/60 rounded-2xl">
              <div className="text-3xl font-black text-[#4A1525]">
                {selectedMatchForInfo.matchScore}%
              </div>
              <div className="text-xs text-[#86293D] font-bold mt-0.5">
                Total Weighted Match Score
              </div>
            </div>

            {selectedMatchForInfo.aiInsight && (
              <div className="p-3 bg-gradient-to-r from-[#FFF5F7] to-[#FFF0F3] border border-rose-200/80 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#86293D]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C84B68]" />
                  <span>AI Shortlist: {selectedMatchForInfo.aiInsight.badge || 'Recommended Match'}</span>
                </div>
                <p className="text-stone-700 text-[11px] leading-relaxed">
                  {selectedMatchForInfo.aiInsight.reason}
                </p>
              </div>
            )}

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F5] border border-rose-100/60">
                <span>Skill Compatibility (40% Weight)</span>
                <strong className="text-stone-900 font-mono">
                  {selectedMatchForInfo.breakdown.skillCompatibility}%
                </strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F5] border border-rose-100/60">
                <span>Distance Proximity (35% Weight)</span>
                <strong className="text-stone-900 font-mono">
                  {selectedMatchForInfo.breakdown.distanceProximity}% ({selectedMatchForInfo.distanceKm} km)
                </strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F5] border border-rose-100/60">
                <span>Maker Rating (15% Weight)</span>
                <strong className="text-stone-900 font-mono">
                  {selectedMatchForInfo.breakdown.makerRating}% ({selectedMatchForInfo.artisan.rating} / 5.0)
                </strong>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF7F5] border border-rose-100/60">
                <span>Budget Fit (10% Weight)</span>
                <strong className="text-stone-900 font-mono">
                  {selectedMatchForInfo.breakdown.budgetFit}% (₹{selectedMatchForInfo.listing.price})
                </strong>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-stone-500 leading-normal">
              Formula: <code>0.40 * skill + 0.35 * distance + 0.15 * rating + 0.10 * budget</code>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 5. ORDER CONFIRMATION & PAYMENT MODAL */}
      {selectedListing && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          style={{ zIndex: 99999 }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden text-stone-900">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-[#4A1525] via-[#5C1D2E] to-[#86293D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-rose-200" />
                <h4 className="font-bold text-base font-serif">Book Local Artisan Service</h4>
              </div>
              <button
                onClick={() => setSelectedListing(null)}
                className="text-stone-300 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="p-6 space-y-4">
              {/* Service summary */}
              <div className="p-4 bg-[#FAF7F5] rounded-2xl border border-rose-100 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#86293D] bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded uppercase">
                      {selectedListing.customCategory || selectedListing.category}
                    </span>
                    <h5 className="font-bold text-stone-900 text-sm mt-1">{selectedListing.title}</h5>
                    <p className="text-xs text-stone-500">
                      Maker: {selectedListing.artisanName} • {selectedListing.neighborhood}
                    </p>
                  </div>
                  <div className="text-right font-black text-lg text-[#4A1525]">
                    ₹{selectedListing.price}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Delivery / Service Address
                </label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street, Building, Flat No., Neighborhood"
                  className="w-full px-3 py-2 border border-rose-200/80 rounded-xl text-xs focus:ring-2 focus:ring-[#C84B68] focus:outline-none"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Specific Requests or Notes (Optional)
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Please alter 1.5 inches from sides, use red thread"
                  className="w-full px-3 py-2 border border-rose-200/80 rounded-xl text-xs focus:ring-2 focus:ring-[#C84B68] focus:outline-none"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      paymentMethod === 'UPI'
                        ? 'bg-rose-50 border-[#C84B68] ring-1 ring-[#C84B68]'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-stone-900">
                      <QrCode className="w-4 h-4 text-[#86293D]" />
                      <span>Instant UPI</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">
                      GPay, PhonePe, Paytm, QR
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'bg-rose-50 border-[#C84B68] ring-1 ring-[#C84B68]'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs text-stone-900">
                      <IndianRupee className="w-4 h-4 text-[#86293D]" />
                      <span>Cash on Delivery</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">
                      Pay directly to runner
                    </div>
                  </button>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="p-3 bg-[#FAF7F5] rounded-2xl space-y-1.5 text-xs text-stone-600 border border-rose-100">
                <div className="flex justify-between">
                  <span>Artisan Service Fee</span>
                  <span className="font-semibold text-stone-900">₹{selectedListing.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hyperlocal Runner Delivery Fee</span>
                  <span className="font-semibold text-stone-900">₹40</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-400">
                  <span>Platform Fee (5% retained from artisan earnings)</span>
                  <span>₹{Math.round(selectedListing.price * 0.05)}</span>
                </div>
                <div className="pt-2 border-t border-rose-200/60 flex justify-between text-sm font-bold text-stone-900">
                  <span>Total Amount</span>
                  <span className="text-[#4A1525] font-black">
                    ₹{selectedListing.price + 40}
                  </span>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full py-3.5 rounded-2xl bg-[#C84B68] hover:bg-[#B33956] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {isSubmittingOrder ? 'Processing...' : `Confirm & Pay ₹${selectedListing.price + 40}`}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* 6. BUYER'S ORDER HISTORY DRAWER */}
      {buyerOrders.length > 0 && (
        <div className="bg-[#FAF7F5] rounded-3xl p-6 border border-rose-100 space-y-4">
          <h3 className="text-base font-bold text-stone-900 font-serif">Your Active & Past Bookings</h3>
          <div className="space-y-3">
            {buyerOrders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl p-4 border border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#86293D] bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded">
                      Order #{ord.id}
                    </span>
                    <span className="text-xs text-stone-500 font-mono">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h5 className="font-bold text-stone-900 text-sm">{ord.listingTitle}</h5>
                  <p className="text-xs text-stone-600">
                    Artisan: <strong>{ord.artisanName}</strong> • {ord.deliveryAddress}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full uppercase bg-rose-50 text-[#86293D] border border-rose-100">
                      {ord.status}
                    </span>
                    <div className="text-sm font-black text-[#4A1525] mt-1">₹{ord.totalAmount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

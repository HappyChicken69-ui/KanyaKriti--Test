import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Listing, ArtisanProfile } from '../types.ts';

interface LeafletMapProps {
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  radiusKm?: number;
  listings?: Listing[];
  artisans?: ArtisanProfile[];
  runnerLat?: number;
  runnerLng?: number;
  runnerName?: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  onSelectListing?: (listing: Listing) => void;
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  centerLat = 12.9352,
  centerLng = 77.6245,
  zoom = 13,
  radiusKm,
  listings = [],
  runnerLat,
  runnerLng,
  runnerName = 'Delivery Partner',
  pickupLat,
  pickupLng,
  deliveryLat,
  deliveryLng,
  onSelectListing,
  className = 'h-96 w-full rounded-2xl overflow-hidden shadow-inner',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const layers = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      layerGroupRef.current = layers;

      // Handle resizing properly
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        map.remove();
        mapInstanceRef.current = null;
      };
    }
  }, []);

  // Update center if changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLat, centerLng], zoom);
    }
  }, [centerLat, centerLng, zoom]);

  // Redraw markers and shapes
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    // 1. Draw buyer location marker
    const buyerIcon = L.divIcon({
      className: 'custom-buyer-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold ring-4 ring-blue-300/40">
            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          </div>
          <div class="absolute -bottom-5 bg-stone-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow whitespace-nowrap">
            You
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([centerLat, centerLng], { icon: buyerIcon })
      .addTo(layerGroupRef.current)
      .bindPopup(`<b>Your Hyperlocal Center</b><br/>Approximate coordinates`);

    // 2. Draw dynamic radius circle if specified
    if (radiusKm && radiusKm > 0) {
      L.circle([centerLat, centerLng], {
        radius: radiusKm * 1000,
        color: '#C84B68', // KanyaKriti rose
        fillColor: '#C84B68',
        fillOpacity: 0.08,
        weight: 1.5,
        dashArray: '5, 8',
      }).addTo(layerGroupRef.current);
    }

    // 3. Draw Artisan / Listing markers
    listings.forEach((listing) => {
      const artisanIcon = L.divIcon({
        className: 'custom-artisan-marker',
        html: `
          <div class="relative group cursor-pointer transform hover:scale-110 transition-transform">
            <div class="w-9 h-9 rounded-full bg-[#86293D] border-2 border-white shadow-md flex items-center justify-center text-white text-xs font-bold overflow-hidden ring-2 ring-rose-300/70">
              <img src="${listing.artisanAvatar}" alt="${listing.artisanName}" class="w-full h-full object-cover" />
            </div>
            <div class="absolute -top-2 -right-2 bg-[#4A1525] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white shadow-xs">
              ₹${listing.price}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([listing.approximateLat, listing.approximateLng], { icon: artisanIcon })
        .addTo(layerGroupRef.current!);

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-stone-800 text-xs';
      popupContent.innerHTML = `
        <div class="font-bold text-sm text-[#4A1525] mb-0.5 font-serif">${listing.title}</div>
        <div class="text-[#86293D] font-semibold mb-1">${listing.artisanName} • Rating ${listing.artisanRating}/5.0</div>
        <div class="text-stone-600 mb-2">${listing.neighborhood} • ${listing.turnaroundDisplay}</div>
        <div class="flex items-center justify-between pt-1 border-t border-rose-100">
          <span class="text-base font-bold text-[#4A1525]">₹${listing.price}</span>
          <button id="book-btn-${listing.id}" class="bg-[#C84B68] hover:bg-[#B33956] text-white font-medium px-2.5 py-1 rounded text-xs shadow-xs cursor-pointer">
            Select Service
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`book-btn-${listing.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectListing) onSelectListing(listing);
          };
        }
      });
    });

    // 4. Draw Runner Live Location Marker (if tracking delivery)
    if (runnerLat && runnerLng) {
      const runnerIcon = L.divIcon({
        className: 'custom-runner-marker',
        html: `
          <div class="relative flex flex-col items-center justify-center animate-bounce">
            <div class="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-emerald-300/60">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
            </div>
            <div class="bg-emerald-950 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">
              ${runnerName}
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      L.marker([runnerLat, runnerLng], { icon: runnerIcon })
        .addTo(layerGroupRef.current)
        .bindPopup(`<b>${runnerName} (Delivery Partner)</b><br/>En route with your order`);
    }

    // 5. Draw Pickup and Delivery Points with dotted route line
    if (pickupLat && pickupLng && deliveryLat && deliveryLng) {
      const pickupIcon = L.divIcon({
        className: 'pickup-marker',
        html: `<div class="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md border-2 border-white"><svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const dropIcon = L.divIcon({
        className: 'drop-marker',
        html: `<div class="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md border-2 border-white"><svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([pickupLat, pickupLng], { icon: pickupIcon })
        .addTo(layerGroupRef.current)
        .bindPopup('<b>Artisan Pickup Point</b>');

      L.marker([deliveryLat, deliveryLng], { icon: dropIcon })
        .addTo(layerGroupRef.current)
        .bindPopup('<b>Customer Delivery Address</b>');

      // Polyline route
      L.polyline(
        [
          [pickupLat, pickupLng],
          runnerLat && runnerLng ? [runnerLat, runnerLng] : [pickupLat, pickupLng],
          [deliveryLat, deliveryLng],
        ],
        { color: '#059669', weight: 3, opacity: 0.8, dashArray: '6, 8' }
      ).addTo(layerGroupRef.current);
    }
  }, [listings, centerLat, centerLng, radiusKm, runnerLat, runnerLng, pickupLat, pickupLng, deliveryLat, deliveryLng]);

  return (
    <div
      className="relative z-0 isolate w-full"
      style={{ position: 'relative', zIndex: 0, isolation: 'isolate' }}
    >
      <div
        ref={mapContainerRef}
        className={`${className} relative z-0`}
        style={{ position: 'relative', zIndex: 0 }}
      />
    </div>
  );
};

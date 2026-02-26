'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js/Leaflet
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Green Icon for Mandis
export const MandiIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Helper component to explicitly set the map view on prop change
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 11);
    }, [center, map]);
    return null;
}

interface MandiLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    distance: number;
    transport: number;
    offered: number;
}

interface MandiMapProps {
    center: [number, number];
    mandis: MandiLocation[];
}

export default function MandiMap({ center, mandis }: MandiMapProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-full w-full bg-[#0d1a0d] flex items-center justify-center animate-pulse rounded-2xl border border-[#1a2d1a]">Loading Map...</div>;
    }

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-[#1a2d1a] relative shadow-lg shadow-black/20">
            <MapContainer
                center={center}
                zoom={11}
                style={{ height: '100%', width: '100%', background: '#0a160a' }}
                scrollWheelZoom={false}
            >
                {/* Dark theme tile layer for our agriculture app */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <MapUpdater center={center} />

                {/* User Location Marker */}
                <Marker position={center}>
                    <Popup>
                        <div className="text-zinc-900 font-semibold text-sm">Your Location</div>
                    </Popup>
                </Marker>

                {/* Mandi Markers */}
                {mandis.map((m) => (
                    <Marker key={m.id} position={[m.lat, m.lng]} icon={MandiIcon}>
                        <Popup>
                            <div className="p-1">
                                <p className="font-bold text-emerald-800 text-sm mb-1">{m.name}</p>
                                <div className="text-xs text-zinc-600 space-y-0.5">
                                    <p>📍 {m.distance}km away</p>
                                    <p>🚚 Transport: ₹{m.transport}/q</p>
                                    <p className="font-semibold mt-1">💰 Price: ₹{m.offered}/q</p>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 right-4 z-[400] bg-black/80 border border-emerald-900/50 backdrop-blur-sm p-3 rounded-xl shadow-xl">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-zinc-300 font-medium tracking-wide">Your Location</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-zinc-300 font-medium tracking-wide">Matched Mandi</span>
                </div>
            </div>
        </div>
    );
}

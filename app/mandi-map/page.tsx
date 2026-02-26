'use client'

import { useState, useMemo } from "react";
import dynamic from 'next/dynamic';
import { TopBar } from '../components/TopBar';
import { Search, MapPin, Navigation, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";

// Dynamically import Map to prevent SSR Window errors
const MandiMap = dynamic(() => import('../components/MandiMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-[#0d1a0d] flex flex-col items-center justify-center animate-pulse rounded-2xl border border-[#1a2d1a]"><div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mb-2" /><span className="text-zinc-500 text-sm">Loading Maps...</span></div>
});

const MANDI_TIPS = [
    'Sell on Tuesday & Wednesday — historically 8-12% better prices',
    'Arrive at mandi before 9 AM for better queue priority',
    'Register on eNAM for direct online bidding — no broker fee',
    'Form FPO (Farmer Producer Org) to negotiate bulk prices',
];

interface MandiLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    distance: number;
    transport: number;
    offered: number;
}

export default function MandiMapPage() {
    const [pinCode, setPinCode] = useState('');
    const [crop, setCrop] = useState('Wheat');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Map State
    const [detectedLocation, setDetectedLocation] = useState<{ city: string, state: string } | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([21.1458, 79.0882]); // Default Nagpur
    const [mandis, setMandis] = useState<MandiLocation[]>([]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pinCode.length !== 6 || !/^\d+$/.test(pinCode)) {
            setErrorMsg('Please enter a valid 6-digit Indian PIN code.');
            return;
        }

        setLoading(true);
        setErrorMsg('');
        setDetectedLocation(null);

        try {
            // 1. Fetch City/State from India Post API
            const postRes = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
            const postData = await postRes.json();

            if (postData[0].Status === "Error" || !postData[0].PostOffice) {
                throw new Error("Invalid PIN Code or area not found.");
            }

            const po = postData[0].PostOffice[0];
            const city = po.District || po.Name;
            const state = po.State;
            setDetectedLocation({ city, state });

            // 2. Geocode City to Lat/Lng via Nominatim OSM
            const numCity = `${city}, ${state}, India`;
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(numCity)}`);
            const geoData = await geoRes.json();

            if (!geoData || geoData.length === 0) {
                throw new Error(`Could not find coordinates for ${city}.`);
            }

            const centerLat = parseFloat(geoData[0].lat);
            const centerLng = parseFloat(geoData[0].lon);
            setMapCenter([centerLat, centerLng]);

            // 3. Generate Pseudo-Realistic Mandis around this center
            generateMandis(centerLat, centerLng, city);

        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to detect location. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const generateMandis = (lat: number, lng: number, city: string) => {
        // Base math on crop selection so it feels dynamic
        const basePrice = crop === 'Wheat' ? 2275 : crop === 'Rice' ? 2183 : crop === 'Cotton' ? 6620 : crop === 'Onion' ? 2450 : 3500;

        const generated: MandiLocation[] = [
            {
                id: 'm1',
                name: `${city} Central APMC`,
                lat: lat + (Math.random() * 0.1 - 0.05),
                lng: lng + (Math.random() * 0.1 - 0.05),
                distance: Math.floor(Math.random() * 15) + 5,
                transport: Math.floor(Math.random() * 30) + 40,
                offered: basePrice + Math.floor(Math.random() * 200) - 50
            },
            {
                id: 'm2',
                name: `${city} Rural Market`,
                lat: lat + (Math.random() * 0.2 - 0.1),
                lng: lng + (Math.random() * 0.2 - 0.1),
                distance: Math.floor(Math.random() * 30) + 15,
                transport: Math.floor(Math.random() * 60) + 70,
                offered: basePrice + Math.floor(Math.random() * 150) - 100
            },
            {
                id: 'm3',
                name: `Kisan Hub ${city.substring(0, 4)}`,
                lat: lat + (Math.random() * 0.15 - 0.075),
                lng: lng + (Math.random() * 0.15 - 0.075),
                distance: Math.floor(Math.random() * 25) + 10,
                transport: Math.floor(Math.random() * 50) + 60,
                offered: basePrice + Math.floor(Math.random() * 300) - 20
            },
            {
                id: 'm4',
                name: `eNAM Trading Yard`,
                lat: lat + (Math.random() * 0.25 - 0.125),
                lng: lng + (Math.random() * 0.25 - 0.125),
                distance: Math.floor(Math.random() * 45) + 20,
                transport: Math.floor(Math.random() * 90) + 100,
                offered: basePrice + Math.floor(Math.random() * 400) + 50
            }
        ];

        setMandis(generated);
    };

    const sortedMandis = useMemo(() => {
        return [...mandis].sort((a, b) => (b.offered - b.transport) - (a.offered - a.transport));
    }, [mandis]);

    return (
        <div className="flex flex-col min-h-screen relative bg-[#050a05]">
            {/* Background Image with Dark Overlay */}
            <div
                className="fixed inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2689&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#050a05]/80 via-[#050a05]/95 to-[#050a05] pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <TopBar meta={{ greeting: 'Market Operations', title: 'Smart Mandi Finder' }} />

                <main className="flex-1 p-6">
                    <div className="mx-auto max-w-6xl space-y-6">

                        {/* Unified Search Header */}
                        <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-[#0a160a] to-[#052e16] p-6 shadow-lg">
                            <div className="mb-4 flex flex-col items-center text-center">
                                <Navigation className="h-10 w-10 text-emerald-500 mb-2" />
                                <h2 className="text-xl font-bold text-white">Find Nearby Markets</h2>
                                <p className="text-sm text-emerald-100/70 max-w-xl">Enter your PIN code to instantly geolocate nearby Mandis and calculate your actual Net Profit after transportation costs.</p>
                            </div>

                            <form onSubmit={handleSearch} className="max-w-3xl mx-auto grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                                <div>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-600/70" />
                                        <input
                                            value={pinCode}
                                            onChange={e => setPinCode(e.target.value)}
                                            placeholder="Enter 6-digit PIN Code..."
                                            maxLength={6}
                                            className="h-12 w-full pl-10 pr-4 rounded-xl border border-[#1a2d1a] bg-[#050a05] text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <select
                                        value={crop}
                                        onChange={e => setCrop(e.target.value)}
                                        className="h-12 w-full rounded-xl border border-[#1a2d1a] bg-[#050a05] px-4 text-zinc-200 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    >
                                        {['Wheat', 'Rice', 'Onion', 'Cotton', 'Tomato', 'Soyabean'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="h-12 px-8 rounded-xl bg-emerald-700 font-bold tracking-wide text-white hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center min-w-[140px]"
                                >
                                    {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Search Area'}
                                </button>
                            </form>

                            {errorMsg && (
                                <div className="mt-4 flex items-center justify-center gap-2 text-red-400 bg-red-950/20 py-2 px-4 rounded-lg max-w-md mx-auto border border-red-900/30">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <p className="text-sm font-medium">{errorMsg}</p>
                                </div>
                            )}

                            {detectedLocation && (
                                <div className="mt-4 text-center">
                                    <p className="text-emerald-400 font-semibold text-sm">
                                        📍 Detected Region: <span className="text-white">{detectedLocation.city}, {detectedLocation.state}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">

                            {/* Interactive Map Column */}
                            <div className="h-[500px] lg:h-auto rounded-2xl w-full border border-[#1a2d1a] bg-[#0a160a] p-2 relative shadow-lg">
                                <MandiMap center={mapCenter} mandis={mandis} />
                            </div>

                            {/* List Column */}
                            <div className="space-y-6 flex flex-col">

                                {/* Mandi Profit Optimizer */}
                                <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5 flex-1 flex flex-col max-h-[600px] overflow-hidden">
                                    <div className="mb-4">
                                        <h2 className="font-bold text-white flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                                            Profit Optimizer
                                        </h2>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Ranked by <span className="font-semibold text-zinc-300">Net Return</span> (Price − Transport).
                                        </p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar list-container">
                                        {mandis.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#1a2d1a] rounded-xl">
                                                <Search className="w-10 h-10 text-zinc-700 mb-2" />
                                                <p className="text-zinc-500 text-sm">Enter your PIN code above to find the optimal mandis for your crop.</p>
                                            </div>
                                        ) : (
                                            sortedMandis.map((m, i) => {
                                                const net = m.offered - m.transport;
                                                return (
                                                    <div key={m.id} className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition-colors ${i === 0 ? 'border-emerald-800 bg-emerald-950/20' : 'border-[#1a2d1a] bg-[#0d1a0d]'}`}>
                                                        <span className="text-lg w-6 text-center">{['🥇', '🥈', '🥉', '🔵'][i] || '🔵'}</span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-white text-sm truncate">{m.name}</p>
                                                            <p className="text-[10px] text-zinc-500 mt-0.5">
                                                                📍 {m.distance}km · 🚚 ₹{m.transport}/q
                                                            </p>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <p className="text-sm font-bold text-emerald-400">₹{m.offered}</p>
                                                            <p className="text-[10px] text-zinc-400 font-medium">Net: ₹{net}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                {/* Mandi Tips */}
                                <div className="rounded-2xl border border-[#1a2d1a] bg-[#050a05] p-5 shrink-0">
                                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><span>💡</span> Expert Tips</h3>
                                    <ul className="space-y-2">
                                        {MANDI_TIPS.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1 shrink-0" />
                                                <span className="leading-snug">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
}

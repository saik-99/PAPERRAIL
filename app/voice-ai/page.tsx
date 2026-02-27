'use client'

import { TopBar } from '../components/TopBar';
import { Mic } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const QUICK_PROMPTS = ['When to harvest?', 'Best sell time?', 'Storage tips?', 'Gov schemes?'];

interface Message { role: 'user' | 'ai'; text: string; time: string; }

export default function VoiceAIPage() {
    const [listening, setListening] = useState(false);
    const [pulse, setPulse] = useState(false);
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Initialize Speech Recognition on Mount, safely checking for 'window' to avoid SSR crashes
        if (typeof window !== 'undefined') {
            // @ts-expect-error Types for webkitSpeechRecognition are not strictly defined
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.interimResults = false;
                // Native Android/Chrome 'hi-IN' automatically detects both Hindi and English accurately
                recognition.lang = 'hi-IN';

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                recognition.onresult = (event: any) => {
                    const transcript = event.results[0][0].transcript;
                    setQuery(prev => prev ? `${prev} ${transcript}` : transcript);
                };

                recognition.onerror = () => {
                    setListening(false);
                    setPulse(false);
                };

                recognition.onend = () => {
                    setListening(false);
                    setPulse(false);
                };

                recognitionRef.current = recognition;
            }
        }

        let interval: NodeJS.Timeout;
        if (listening) {
            interval = setInterval(() => setPulse(p => !p), 700);
        } else {
            setPulse(false);
        }
        return () => clearInterval(interval);
    }, [listening]);

    const sendQuery = async (text: string) => {
        if (!text.trim()) return;
        const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setHistory(h => [...h, { role: 'user', text, time: now }]);
        setQuery('');
        setLoading(true);
        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, context: {} }),
            });
            const data = await res.json();
            setHistory(h => [...h, { role: 'ai', text: data.reply ?? 'Could not get response.', time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
        } catch {
            setHistory(h => [...h, { role: 'ai', text: 'Error: Check API connection.', time: now }]);
        } finally {
            setLoading(false);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert('Speech recognition not supported in this browser. Try Google Chrome or use the native Android App.');
            return;
        }

        if (listening) {
            recognitionRef.current.stop();
            setListening(false);
        } else {
            // Attempt to start recognition
            try {
                recognitionRef.current.start();
                setListening(true);
            } catch (e) {
                console.error("Recognition already started or error:", e);
                setListening(false);
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen relative bg-[#f4f7f4]">
            {/* Background Image with Light Overlay */}
            <div
                className="fixed inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2689&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            />
            <div className="fixed inset-0 z-0 bg-white/90 pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <TopBar meta={{ greeting: 'Good afternoon', title: 'Voice AI Assistant' }} />
                <main className="flex-1 p-6">
                    <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-2">

                        {/* Voice input panel */}
                        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-8 flex flex-col items-center justify-center text-center min-h-[360px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none" />
                            <p className="text-sm font-bold text-zinc-900 mb-1 relative z-10">🎙️ Voice AI Assistant</p>
                            <p className="text-xs text-zinc-500 mb-8 relative z-10">Ask in Hindi or English</p>

                            <button
                                onClick={toggleListening}
                                className={`relative z-10 flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ${listening
                                    ? 'bg-emerald-600 shadow-[0_0_40px_10px_rgba(5,150,105,0.2)]'
                                    : 'bg-zinc-50 border border-zinc-200 hover:bg-emerald-50 hover:border-emerald-200'
                                    }`}
                            >
                                {pulse && listening && (
                                    <span className="absolute inset-0 rounded-full animate-ping bg-emerald-500 opacity-40" />
                                )}
                                {listening
                                    ? <Mic className="h-8 w-8 text-white animate-pulse" />
                                    : <Mic className="h-8 w-8 text-emerald-600" />
                                }
                            </button>

                            <p className="mt-4 text-xs font-semibold text-zinc-500 relative z-10">{listening ? 'Listening... Speak now' : 'Tap mic to speak'}</p>

                            <div className="mt-6 flex flex-wrap justify-center gap-2 relative z-10">
                                {QUICK_PROMPTS.map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => sendQuery(p)}
                                        className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 font-medium hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 w-full flex gap-2 relative z-10">
                                <input
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') sendQuery(query); }}
                                    placeholder="Or type your question..."
                                    className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner"
                                />
                                <button
                                    onClick={() => sendQuery(query)}
                                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                >Send</button>
                            </div>
                        </div>

                        {/* Conversation History */}
                        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-6 min-h-[360px] flex flex-col">
                            <p className="text-sm font-bold text-zinc-900 mb-4">💬 Conversation History</p>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                                {history.length === 0 && (
                                    <p className="text-xs font-medium text-zinc-500 text-center mt-8">Your conversation will appear here.</p>
                                )}
                                {history.map((msg, i) => (
                                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed font-medium ${msg.role === 'ai'
                                            ? 'bg-zinc-100 text-zinc-800 rounded-tl-none border border-zinc-200'
                                            : 'bg-emerald-600 text-white rounded-tr-none shadow-sm'
                                            }`}>
                                            <p>{msg.text}</p>
                                            <p className="mt-1 text-[9px] opacity-70 font-semibold">{msg.time}</p>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex gap-2">
                                        <div className="rounded-2xl rounded-tl-none bg-zinc-100 border border-zinc-200 px-3 py-2">
                                            <div className="flex gap-1">
                                                {[0, 150, 300].map(d => (
                                                    <div key={d} style={{ animationDelay: `${d}ms` }}
                                                        className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

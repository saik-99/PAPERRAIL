'use client'

import { TopBar } from '../components/TopBar';
import { Mic, MicOff } from 'lucide-react';
import { useState, useEffect } from 'react';

const QUICK_PROMPTS = ['When to harvest?', 'Best sell time?', 'Storage tips?', 'Gov schemes?'];

interface Message { role: 'user' | 'ai'; text: string; time: string; }

export default function VoiceAIPage() {
    const [listening, setListening] = useState(false);
    const [pulse, setPulse] = useState(false);
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
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
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Speech recognition not supported in this browser. Try Chrome.');
            return;
        }
        setListening(l => !l);
    };

    return (
        <div className="flex flex-col min-h-screen">
            <TopBar meta={{ greeting: 'Good afternoon', title: 'Voice AI Assistant' }} />
            <main className="flex-1 p-6">
                <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-2">

                    {/* Voice input panel */}
                    <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-8 flex flex-col items-center justify-center text-center min-h-[360px]">
                        <p className="text-sm font-semibold text-white mb-1">🎙️ Voice AI Assistant</p>
                        <p className="text-xs text-zinc-500 mb-8">Ask in Hindi or English</p>

                        <button
                            onClick={toggleListening}
                            className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-300 ${listening
                                ? 'bg-emerald-700 shadow-[0_0_40px_10px_rgba(5,150,105,0.3)]'
                                : 'bg-[#1a2d1a] hover:bg-[#1e3a1e]'
                                }`}
                        >
                            {pulse && listening && (
                                <span className="absolute inset-0 rounded-full animate-ping bg-emerald-600 opacity-30" />
                            )}
                            {listening
                                ? <Mic className="h-8 w-8 text-white animate-pulse" />
                                : <Mic className="h-8 w-8 text-emerald-500" />
                            }
                        </button>

                        <p className="mt-4 text-xs text-zinc-500">{listening ? 'Listening... Speak now' : 'Tap mic to speak'}</p>

                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            {QUICK_PROMPTS.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => sendQuery(p)}
                                    className="rounded-full border border-[#2a3d2a] px-3 py-1.5 text-xs text-zinc-400 hover:border-emerald-600 hover:text-emerald-400 transition-colors"
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 w-full flex gap-2">
                            <input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') sendQuery(query); }}
                                placeholder="Or type your question..."
                                className="flex-1 rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                            />
                            <button
                                onClick={() => sendQuery(query)}
                                className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                            >Send</button>
                        </div>
                    </div>

                    {/* Conversation History */}
                    <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-6 min-h-[360px] flex flex-col">
                        <p className="text-sm font-semibold text-white mb-4">💬 Conversation History</p>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {history.length === 0 && (
                                <p className="text-xs text-zinc-600 text-center mt-8">Your conversation will appear here.</p>
                            )}
                            {history.map((msg, i) => (
                                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${msg.role === 'ai'
                                        ? 'bg-[#0d1a0d] text-zinc-300 rounded-tl-none'
                                        : 'bg-emerald-800 text-white rounded-tr-none'
                                        }`}>
                                        <p>{msg.text}</p>
                                        <p className="mt-1 text-[9px] opacity-50">{msg.time}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-2">
                                    <div className="rounded-2xl rounded-tl-none bg-[#0d1a0d] px-3 py-2">
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
    );
}

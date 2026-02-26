'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User } from 'lucide-react';

interface Message {
    role: 'user' | 'ai';
    text: string;
}

interface FarmerContext {
    state?: string;
    city?: string;
    landSize?: string;
    crop?: string;
    wpiIndex?: string;
    season?: string;
}

interface GeminiAdvisorProps {
    context?: FarmerContext;
}

function getCurrentSeason(): string {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 6 && month <= 10) return 'Kharif (Monsoon)';
    if (month >= 11 || month <= 2) return 'Rabi (Winter)';
    return 'Zaid (Summer)';
}

export function GeminiAdvisor({ context = {} }: GeminiAdvisorProps) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            text: `Namaste! Main KhetiWala AI hun. ${context.crop ? `Aapki ${context.crop} crop ke baare mein kuch bhi poochh sakte hain!` : 'Apni fasal, mandi price, ya mausam ke baare mein poochhen!'}`,
        },
    ]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');
        setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    context: { ...context, season: getCurrentSeason() },
                }),
            });
            const data = await res.json();
            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    text: data.reply ?? data.error ?? 'Please add your Gemini API key in .env.local first.',
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                { role: 'ai', text: 'Connection error. Please check if the server is running.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const QUICK_PROMPTS = [
        'Kya mujhe abhi bechna chahiye?',
        'Meri fasal ke liye sarkari yojana batao',
        'Mausam kaisa rahega?',
        'Price trend kya hai?',
    ];

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setOpen(true)}
                className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg transition-all hover:bg-emerald-800 hover:scale-105 ${open ? 'hidden' : 'flex'}`}
                aria-label="Open AI Advisor"
            >
                <Bot className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-zinc-900">AI</span>
            </button>

            {/* Chat drawer */}
            {open && (
                <div className="fixed bottom-6 right-6 z-50 w-[340px] sm:w-[380px] flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden" style={{ height: '520px' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between bg-emerald-700 px-4 py-3">
                        <div className="flex items-center gap-2">
                            <Bot className="h-5 w-5 text-white" />
                            <div>
                                <p className="text-sm font-semibold text-white">KhetiWala AI</p>
                                <p className="text-[10px] text-emerald-200">Powered by Gemini</p>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="rounded-full p-1 text-emerald-200 hover:bg-emerald-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-3 p-4">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${msg.role === 'ai' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-600'}`}>
                                    {msg.role === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                </div>
                                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${msg.role === 'ai'
                                    ? 'rounded-tl-none bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'
                                    : 'rounded-tr-none bg-emerald-700 text-white'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="rounded-2xl rounded-tl-none bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Quick prompts */}
                    <div className="shrink-0 flex gap-1 overflow-x-auto px-3 pb-2 pt-1">
                        {QUICK_PROMPTS.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => { setInput(p); }}
                                className="shrink-0 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-[10px] text-zinc-700 hover:border-emerald-400 hover:text-emerald-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 transition-colors"
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="shrink-0 flex gap-2 border-t border-zinc-100 p-3 dark:border-zinc-800">
                        <input
                            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                            placeholder="Apna sawaal likhen..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading || !input.trim()}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-50 transition-colors"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

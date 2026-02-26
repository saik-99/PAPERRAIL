'use client';

import { useState, useEffect } from 'react';
import { Clock, Leaf } from 'lucide-react';

function getCurrentSeason() {
    const m = new Date().getMonth() + 1;
    if (m >= 6 && m <= 10) return { label: 'Kharif', emoji: '🌧️', color: 'text-sky-600 bg-sky-50 dark:bg-sky-900/20' };
    if (m >= 11 || m <= 2) return { label: 'Rabi', emoji: '❄️', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' };
    return { label: 'Zaid', emoji: '☀️', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' };
}

export function LiveClock() {
    const [time, setTime] = useState('');
    const [date, setDate] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            setDate(now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }));
        };
        update();
        const id = setInterval(update, 1000);
        return () => clearInterval(id);
    }, []);

    const season = getCurrentSeason();

    return (
        <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                <Clock className="h-3.5 w-3.5" />
                <span className="font-mono font-medium">{time}</span>
                <span className="text-zinc-400">{date}</span>
            </div>
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${season.color}`}>
                <Leaf className="h-3 w-3" />
                {season.emoji} {season.label} Season
            </span>
        </div>
    );
}

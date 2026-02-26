'use client';

import { TopBar } from '../components/TopBar';
import { useState, useCallback } from 'react';
import { Loader2, RefreshCw, ChevronDown, ChevronUp, Shield, Zap } from 'lucide-react';
import { COMMON_CROPS, INDIAN_STATES } from '@/lib/soilData';

// ── Types ────────────────────────────────────────────────────────────────────

interface PreservationAction {
  action: string;
  method: string;
  cost: 'Free' | 'Low' | 'Medium' | 'High';
  costAmount: string;
  effectiveness: 'High' | 'Medium' | 'Low';
  timeToAct: string;
  steps: string[];
  whyItWorks: string;
}

interface QualityPoint {
  day: number;
  quality: number;
  label: string;
}

interface SpoilageAssessment {
  riskScore: number;
  riskLabel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskColor: string;
  plainRisk: string;
  keyRiskFactors: string[];
  estimatedLossPercent: number;
  preservationActions: PreservationAction[];
  immediateActions: string[];
  weatherWarning: string;
  cropSpecificTips: string[];
  safeStorageDays: number;
  qualityImpactTimeline: QualityPoint[];
}

// ── Cost badge color ─────────────────────────────────────────────────────────

const COST_CONFIG: Record<string, { bg: string; text: string }> = {
  Free: { bg: 'bg-emerald-900/50', text: 'text-emerald-400' },
  Low: { bg: 'bg-blue-900/50', text: 'text-blue-400' },
  Medium: { bg: 'bg-amber-900/50', text: 'text-amber-400' },
  High: { bg: 'bg-red-900/50', text: 'text-red-400' },
};

const EFFECTIVENESS_CONFIG: Record<string, { dot: string; text: string }> = {
  High: { dot: 'bg-emerald-400', text: 'text-emerald-400' },
  Medium: { dot: 'bg-amber-400', text: 'text-amber-400' },
  Low: { dot: 'bg-red-400', text: 'text-red-400' },
};

const STORAGE_TYPES = [
  'Open warehouse',
  'Covered godown',
  'Airtight poly bags',
  'Cold storage (4°C)',
  'Farm silo',
  'Open field / kutcha storage',
];

// ── Expandable Action Card ───────────────────────────────────────────────────

function ActionCard({ action, rank }: { action: PreservationAction; rank: number }) {
  const [open, setOpen] = useState(rank === 0); // First one open by default
  const costCfg = COST_CONFIG[action.cost] ?? COST_CONFIG.Low;
  const effCfg = EFFECTIVENESS_CONFIG[action.effectiveness] ?? EFFECTIVENESS_CONFIG.Medium;

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${open ? 'border-emerald-800/50' : 'border-[#1a2d1a]'} bg-[#0d1a0d]`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#121e12] transition-colors"
      >
        {/* Rank badge */}
        <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-900 text-xs font-bold text-emerald-400">
          {rank + 1}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{action.action}</p>
          <p className="text-[10px] text-zinc-500">{action.timeToAct}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Cost badge */}
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${costCfg.bg} ${costCfg.text}`}>
            {action.cost}
          </span>
          {/* Effectiveness dot */}
          <span className={`flex items-center gap-1 text-[10px] font-semibold ${effCfg.text}`}>
            <span className={`h-2 w-2 rounded-full ${effCfg.dot}`} />
            {action.effectiveness}
          </span>
          {open ? <ChevronUp className="h-3.5 w-3.5 text-zinc-600" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-[#1a2d1a] pt-3 space-y-3">
          {/* Cost amount */}
          <p className="text-xs text-zinc-400">
            💰 <strong className="text-zinc-200">Cost:</strong> {action.costAmount}
          </p>

          {/* Steps */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1.5">How to do it:</p>
            <ol className="space-y-1.5">
              {action.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                  <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#1a2d1a] text-[9px] font-bold text-emerald-400 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Why it works */}
          <div className="rounded-lg bg-black/30 border border-[#1a2d1a] p-2.5">
            <p className="text-[10px] text-zinc-600 mb-0.5">🔬 Why it works:</p>
            <p className="text-xs text-zinc-400 leading-relaxed">{action.whyItWorks}</p>
          </div>

          {/* Recommended Products Link */}
          <div className="pt-2">
            <a
              href={`https://www.amazon.in/s?k=${encodeURIComponent(action.action + " agriculture farming")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-[11px] font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors border border-amber-900/30 w-full justify-center sm:w-auto"
            >
              🛒 Find Equipment on Amazon
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quality Timeline minibar chart ───────────────────────────────────────────

function QualityTimeline({ timeline, safeStorageDays }: { timeline: QualityPoint[]; safeStorageDays: number }) {
  return (
    <div>
      <div className="flex items-end gap-1.5 h-16 mb-1">
        {timeline.map((point, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm"
              style={{
                height: `${point.quality * 0.6}px`,
                backgroundColor: point.quality >= 90 ? '#22c55e' : point.quality >= 75 ? '#f59e0b' : '#ef4444',
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        {timeline.map((point, i) => (
          <div key={i} className="flex-1 text-center">
            <p className="text-[8px] text-zinc-600">Day {point.day}</p>
            <p className="text-[8px] font-bold text-zinc-400">{point.quality}%</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-emerald-400 mt-2">
        ✅ Safe storage window: <strong>{safeStorageDays} days</strong>
      </p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SpoilagePage() {
  const [crop, setCrop] = useState('Wheat');
  const [state, setState] = useState('Punjab');
  const [humidity, setHumidity] = useState(65);
  const [temp, setTemp] = useState(28);
  const [transitDays, setTransitDays] = useState(3);
  const [storageType, setStorageType] = useState('Open warehouse');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<SpoilageAssessment | null>(null);
  const [error, setError] = useState('');

  const analyze = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/spoilage-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, state, humidity, temp, transitDays, storageType }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
      setAssessment(data.assessment);
    } catch (e) {
      setError('Analysis failed. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [crop, state, humidity, temp, transitDays, storageType]);

  // Risk gauge calculation
  const riskScore = assessment?.riskScore ?? Math.round(
    (humidity / 100) * 40 + (transitDays / 10) * 35 + (temp / 45) * 25
  );
  const riskLabel = assessment?.riskLabel ?? (riskScore < 35 ? 'LOW' : riskScore < 65 ? 'MEDIUM' : 'HIGH');
  const riskColor = assessment?.riskColor ?? (riskScore < 35 ? '#22c55e' : riskScore < 65 ? '#f59e0b' : '#ef4444');

  // SVG donut
  const r = 40, c = 2 * Math.PI * r;
  const offset = c - (riskScore / 100) * c;

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
        <TopBar meta={{ greeting: '', title: 'Spoilage & Storage Risk' }} />

        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-5">

            {/* ── Controls Row ─────────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xl">🍅</span>
                <div>
                  <h2 className="font-bold text-white text-base">Post-Harvest Risk Analyzer</h2>
                  <p className="text-xs text-zinc-500">AI assesses spoilage risk and ranks preservation actions by cost</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <div>
                  <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">Crop</p>
                  <select
                    value={crop}
                    onChange={e => setCrop(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {COMMON_CROPS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">State / Region</p>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">Storage Type</p>
                  <select
                    value={storageType}
                    onChange={e => setStorageType(e.target.value)}
                    className="h-10 w-full rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] px-3 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    {STORAGE_TYPES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={analyze}
                    disabled={loading}
                    className="h-10 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-60 transition-colors"
                  >
                    {loading
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
                      : <><Shield className="h-4 w-4" /> AI Risk Assessment</>}
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                {[
                  { label: 'Humidity', value: humidity, setter: setHumidity, min: 20, max: 100, unit: '%', emoji: '💧' },
                  { label: 'Temperature', value: temp, setter: setTemp, min: 10, max: 45, unit: '°C', emoji: '🌡️' },
                  { label: 'Transit Days', value: transitDays, setter: setTransitDays, min: 1, max: 14, unit: ' days', emoji: '🚚' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="mb-1 flex justify-between text-xs text-zinc-400">
                      <span>{s.emoji} {s.label}</span>
                      <span className="font-semibold text-white">{s.value}{s.unit}</span>
                    </div>
                    <input
                      type="range" min={s.min} max={s.max} value={s.value}
                      onChange={e => s.setter(Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#1a2d1a] accent-emerald-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-300">
                ⚠️ {error}
              </div>
            )}

            {/* ── Risk Meter + Immediate Actions Row ──────────────────────────── */}
            <div className="grid gap-5 md:grid-cols-2">

              {/* Risk Meter */}
              <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <h2 className="font-bold text-white text-sm">Spoilage Risk Meter</h2>
                </div>

                <div className="flex gap-5 items-center mb-5">
                  {/* Donut */}
                  <div className="relative shrink-0">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r={r} fill="none" stroke="#1a2d1a" strokeWidth="12" />
                      <circle
                        cx="50" cy="50" r={r} fill="none"
                        stroke={riskColor} strokeWidth="12"
                        strokeDasharray={c} strokeDashoffset={offset}
                        strokeLinecap="round" transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-white">{riskScore}%</span>
                      <span className="text-[9px] text-zinc-500 uppercase">Risk</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-1 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">💧 Humidity</span>
                      <span className="text-white font-medium">{humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">🌡️ Temperature</span>
                      <span className="text-white font-medium">{temp}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">🚚 Transit</span>
                      <span className="text-white font-medium">{transitDays} days</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#1a2d1a]">
                      <span className="text-zinc-500">⚠️ Risk Level</span>
                      <span className="font-bold" style={{ color: riskColor }}>{riskLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Plain language risk */}
                {assessment && (
                  <div className="rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] p-3">
                    <p className="text-xs text-zinc-300 leading-relaxed">{assessment.plainRisk}</p>
                    {assessment.estimatedLossPercent > 0 && (
                      <p className="mt-1 text-xs text-red-400 font-semibold">
                        📉 Estimated crop loss without action: ~{assessment.estimatedLossPercent}%
                      </p>
                    )}
                  </div>
                )}

                {/* Key risk factors */}
                {assessment?.keyRiskFactors && (
                  <div className="mt-3 space-y-1.5">
                    {assessment.keyRiskFactors.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: riskColor }} />
                        {f}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Immediate Actions + Weather Warning */}
              <div className="space-y-4">
                {/* Immediate actions */}
                <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <h3 className="font-bold text-white text-sm">Immediate Actions</h3>
                  </div>
                  {assessment?.immediateActions ? (
                    <ul className="space-y-2">
                      {assessment.immediateActions.map((a, i) => (
                        <li key={i} className={`rounded-lg p-3 text-xs leading-relaxed ${i === 0 ? 'border border-red-900/50 bg-red-950/20 text-red-200' : 'border border-amber-900/30 bg-amber-950/10 text-amber-200'}`}>
                          {a}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-500">Run AI assessment to get immediate action guidance for your crop.</p>
                  )}
                </div>

                {/* Weather warning */}
                {assessment?.weatherWarning && (
                  <div className="rounded-2xl border border-amber-900/40 bg-amber-950/10 p-4">
                    <p className="text-xs font-semibold text-amber-300 mb-1">🌦️ Weather Storage Warning</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{assessment.weatherWarning}</p>
                  </div>
                )}

                {/* Crop specific tips */}
                {assessment?.cropSpecificTips && assessment.cropSpecificTips.length > 0 && (
                  <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">💡 Tips for {crop}</p>
                    <ul className="space-y-1.5">
                      {assessment.cropSpecificTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                          <span className="text-amber-400 shrink-0 mt-0.5">→</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* ── Quality Timeline ─────────────────────────────────────────────── */}
            {assessment?.qualityImpactTimeline && (
              <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span>📉</span>
                  <h3 className="font-bold text-white text-sm">Quality Over Time (Without Action)</h3>
                </div>
                <QualityTimeline
                  timeline={assessment.qualityImpactTimeline}
                  safeStorageDays={assessment.safeStorageDays}
                />
              </div>
            )}

            {/* ── Preservation Actions (AI-ranked) ─────────────────────────────── */}
            <div className="rounded-2xl border border-[#1a2d1a] bg-[#0a160a] p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <div>
                    <h2 className="font-bold text-white text-sm">Preservation Actions</h2>
                    <p className="text-xs text-zinc-500">Ranked by cost (cheapest first) · AI-powered</p>
                  </div>
                </div>
                {assessment && (
                  <button
                    onClick={analyze}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-lg border border-[#1a2d1a] bg-[#0d1a0d] px-3 py-1.5 text-xs text-zinc-400 hover:border-emerald-700 hover:text-emerald-400 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Refresh
                  </button>
                )}
              </div>

              {assessment?.preservationActions && assessment.preservationActions.length > 0 ? (
                <div className="space-y-2">
                  {assessment.preservationActions.map((action, i) => (
                    <ActionCard key={i} action={action} rank={i} />
                  ))}
                </div>
              ) : !loading ? (
                <div className="rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] p-8 text-center">
                  <p className="text-3xl mb-2">📦</p>
                  <p className="text-sm text-zinc-400">Set your storage conditions and click <strong className="text-zinc-200">AI Risk Assessment</strong> to get preservation actions ranked by cost.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-[#1a2d1a] bg-[#0d1a0d] p-8 flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
                  <p className="text-sm text-zinc-400">AI is analyzing your storage conditions...</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

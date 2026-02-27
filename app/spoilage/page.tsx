'use client';

import { TopBar } from '../components/TopBar';
import { useState, useCallback } from 'react';
import { Loader2, RefreshCw, ChevronDown, ChevronUp, Shield, Zap } from 'lucide-react';
import { COMMON_CROPS, INDIAN_STATES } from '@/lib/soilData';
import { useLanguage } from '../components/LanguageContext';

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
  amazonLabel?: string;
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
  High: { dot: 'bg-emerald-500', text: 'text-emerald-600' },
  Medium: { dot: 'bg-amber-500', text: 'text-amber-600' },
  Low: { dot: 'bg-red-500', text: 'text-red-600' },
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
        <div className="px-4 pb-4 border-t border-zinc-200 pt-3 space-y-3">
          {/* Cost amount */}
          <p className="text-xs text-zinc-500">
            💰 <strong className="text-zinc-900">Cost:</strong> {action.costAmount}
          </p>

          {/* Steps */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">How to do it:</p>
            <ol className="space-y-1.5">
              {action.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                  <span className="shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Why it works */}
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2.5">
            <p className="text-[10px] text-emerald-700 mb-0.5">🔬 Why it works:</p>
            <p className="text-xs text-emerald-800 leading-relaxed">{action.whyItWorks}</p>
          </div>

          {/* Recommended Products Link */}
          <div className="pt-2">
            <a
              href={`https://www.amazon.in/s?k=${encodeURIComponent(action.action + " agriculture farming")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors border border-amber-200 w-full justify-center sm:w-auto"
            >
              {action.amazonLabel || '🛒 Find Equipment on Amazon'}
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
            <p className="text-[8px] text-zinc-500">Day {point.day}</p>
            <p className="text-[8px] font-bold text-zinc-700">{point.quality}%</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-emerald-700 mt-2">
        ✅ Safe storage window: <strong>{safeStorageDays} days</strong>
      </p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SpoilagePage() {
  const { t } = useLanguage();
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
        <TopBar meta={{ greeting: '', title: t('spoilage_risk') }} />

        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-5">

            {/* ── Controls Row ─────────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xl">🍅</span>
                <div>
                  <h2 className="font-bold text-zinc-900 text-base">{t('post_harvest_analyzer')}</h2>
                  <p className="text-xs text-zinc-500">{t('ai_assesses_spoilage')}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 mb-4">
                <div>
                  <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">{t('crop')}</p>
                  <select
                    value={crop}
                    onChange={e => setCrop(e.target.value)}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {COMMON_CROPS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">{t('state_region')}</p>
                  <select
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] uppercase tracking-widest text-zinc-500">{t('storage_type')}</p>
                  <select
                    value={storageType}
                    onChange={e => setStorageType(e.target.value)}
                    className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                      ? <><Loader2 className="h-4 w-4 animate-spin" /> {t('analyzing')}</>
                      : <><Shield className="h-4 w-4" /> {t('ai_risk_assessment')}</>}
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                {[
                  { label: t('humidity'), value: humidity, setter: setHumidity, min: 20, max: 100, unit: '%', emoji: '💧' },
                  { label: t('temperature'), value: temp, setter: setTemp, min: 10, max: 45, unit: '°C', emoji: '🌡️' },
                  { label: t('transit_days'), value: transitDays, setter: setTransitDays, min: 1, max: 14, unit: '', emoji: '🚚' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="mb-1 flex justify-between text-xs text-zinc-600">
                      <span>{s.emoji} {s.label}</span>
                      <span className="font-bold text-zinc-900">{s.value}{s.unit}</span>
                    </div>
                    <input
                      type="range" min={s.min} max={s.max} value={s.value}
                      onChange={e => s.setter(Number(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-emerald-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                ⚠️ {error}
              </div>
            )}

            {/* ── Risk Meter + Immediate Actions Row ──────────────────────────── */}
            <div className="grid gap-5 md:grid-cols-2">

              {/* Risk Meter */}
              <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 hover:shadow-md hover:border-emerald-200 transition-all">
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <h2 className="font-bold text-zinc-900 text-sm">{t('spoilage_risk_meter')}</h2>
                </div>

                <div className="flex gap-5 items-center mb-5">
                  {/* Donut */}
                  <div className="relative shrink-0">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r={r} fill="none" stroke="#f4f4f5" strokeWidth="12" />
                      <circle
                        cx="50" cy="50" r={r} fill="none"
                        stroke={riskColor} strokeWidth="12"
                        strokeDasharray={c} strokeDashoffset={offset}
                        strokeLinecap="round" transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-zinc-900">{riskScore}%</span>
                      <span className="text-[9px] text-zinc-500 uppercase">{t('risk')}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-1 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-600">💧 {t('humidity')}</span>
                      <span className="text-zinc-900 font-medium">{humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">🌡️ {t('temperature')}</span>
                      <span className="text-zinc-900 font-medium">{temp}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-600">🚚 {t('transit')}</span>
                      <span className="text-zinc-900 font-medium">{transitDays} {t('transit_days')}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-zinc-100">
                      <span className="text-zinc-600">⚠️ {t('risk_level')}</span>
                      <span className="font-bold" style={{ color: riskColor }}>{riskLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Plain language risk */}
                {assessment && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    <p className="text-xs text-zinc-700 leading-relaxed">{assessment.plainRisk}</p>
                    {assessment.estimatedLossPercent > 0 && (
                      <p className="mt-1 text-xs text-red-600 font-bold">
                        {t('estimated_loss')} ~{assessment.estimatedLossPercent}%
                      </p>
                    )}
                  </div>
                )}

                {/* Key risk factors */}
                {assessment?.keyRiskFactors && (
                  <div className="mt-3 space-y-1.5">
                    {assessment.keyRiskFactors.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-600">
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
                <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 hover:shadow-md hover:border-emerald-200 transition-all">
                  <div className="mb-3 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <h3 className="font-bold text-zinc-900 text-sm">{t('immediate_actions')}</h3>
                  </div>
                  {assessment?.immediateActions ? (
                    <ul className="space-y-2">
                      {assessment.immediateActions.map((a, i) => (
                        <li key={i} className={`rounded-lg p-3 text-xs leading-relaxed ${i === 0 ? 'border border-red-200 bg-red-50 text-red-800' : 'border border-amber-200 bg-amber-50 text-amber-800'}`}>
                          {a}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-zinc-500">{t('run_ai_guidance')}</p>
                  )}
                </div>

                {/* Weather warning */}
                {assessment?.weatherWarning && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                    <p className="text-xs font-bold text-amber-700 mb-1">🌦️ {t('weather_impact')}</p>
                    <p className="text-xs text-amber-900/80 leading-relaxed">{assessment.weatherWarning}</p>
                  </div>
                )}

                {/* Crop specific tips */}
                {assessment?.cropSpecificTips && assessment.cropSpecificTips.length > 0 && (
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">💡 Tips for {crop}</p>
                    <ul className="space-y-1.5">
                      {assessment.cropSpecificTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-700">
                          <span className="text-emerald-500 shrink-0 mt-0.5">→</span>
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
              <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 hover:shadow-md hover:border-emerald-200 transition-all">
                <div className="mb-4 flex items-center gap-2">
                  <span>📉</span>
                  <h3 className="font-bold text-zinc-900 text-sm">{t('quality_degradation')}</h3>
                </div>
                <QualityTimeline
                  timeline={assessment.qualityImpactTimeline}
                  safeStorageDays={assessment.safeStorageDays}
                />
              </div>
            )}

            {/* ── Preservation Actions (AI-ranked) ─────────────────────────────── */}
            <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-5 hover:shadow-md hover:border-emerald-200 transition-all">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <div>
                    <h2 className="font-bold text-zinc-900 text-sm">{t('preservation_actions')}</h2>
                    <p className="text-xs text-zinc-500">{t('ai_ranked_cost')}</p>
                  </div>
                </div>
                {assessment && (
                  <button
                    onClick={analyze}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
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
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 text-center">
                  <p className="text-3xl mb-2">📦</p>
                  <p className="text-sm text-zinc-500">Set your storage conditions and click <strong className="text-zinc-900">AI Risk Assessment</strong> to get preservation actions ranked by cost.</p>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-8 flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
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

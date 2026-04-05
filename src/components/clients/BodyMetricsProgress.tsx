'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { BodyMetricService, BodyMetric, BodyMetricCreate } from '@/services/bodyMetrics';
import { Plus, Trash2, TrendingUp, TrendingDown, Minus, Scale, Edit2, X, Check } from 'lucide-react';

interface Props {
  clientId: number;
  isTrainerView?: boolean;
}

type MetricKey = 'weight' | 'body_fat_percentage' | 'muscle_mass' | 'waist' | 'chest' | 'hips' | 'arms' | 'thighs';

const METRIC_CONFIG: Record<MetricKey, { label: string; unit: string; color: string }> = {
  weight:               { label: 'Weight',       unit: 'kg', color: '#3b82f6' },
  body_fat_percentage:  { label: 'Body Fat',     unit: '%',  color: '#f97316' },
  muscle_mass:          { label: 'Muscle Mass',  unit: 'kg', color: '#22c55e' },
  waist:                { label: 'Waist',        unit: 'cm', color: '#a855f7' },
  chest:                { label: 'Chest',        unit: 'cm', color: '#ec4899' },
  hips:                 { label: 'Hips',         unit: 'cm', color: '#14b8a6' },
  arms:                 { label: 'Arms',         unit: 'cm', color: '#f59e0b' },
  thighs:               { label: 'Thighs',       unit: 'cm', color: '#6366f1' },
};

const CHART_METRICS: MetricKey[] = ['weight', 'body_fat_percentage', 'muscle_mass'];
const MEASUREMENT_METRICS: MetricKey[] = ['waist', 'chest', 'hips', 'arms', 'thighs'];

const EMPTY_FORM: BodyMetricCreate = {
  measured_at: new Date().toISOString().slice(0, 10),
  weight: undefined, body_fat_percentage: undefined, muscle_mass: undefined,
  waist: undefined, chest: undefined, hips: undefined, arms: undefined, thighs: undefined,
  notes: '',
};

export default function BodyMetricsProgress({ clientId, isTrainerView = true }: Props) {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BodyMetricCreate>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [activeChartMetrics, setActiveChartMetrics] = useState<MetricKey[]>(['weight']);
  const [activeTab, setActiveTab] = useState<'charts' | 'history'>('charts');

  useEffect(() => {
    load();
  }, [clientId]);

  const load = async () => {
    try {
      setLoading(true);
      const data = isTrainerView
        ? await BodyMetricService.getMetrics(clientId)
        : await BodyMetricService.getMyMetrics();
      setMetrics(data);
    } catch (e) {
      console.error('Failed to load metrics', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form };
      // Strip empty string notes
      if (!payload.notes) delete payload.notes;
      if (editingId) {
        await BodyMetricService.updateMetric(clientId, editingId, payload);
      } else {
        await BodyMetricService.createMetric(clientId, payload);
      }
      await load();
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      console.error('Failed to save metric', e);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (m: BodyMetric) => {
    setForm({
      measured_at: m.measured_at,
      weight: m.weight ?? undefined,
      body_fat_percentage: m.body_fat_percentage ?? undefined,
      muscle_mass: m.muscle_mass ?? undefined,
      waist: m.waist ?? undefined,
      chest: m.chest ?? undefined,
      hips: m.hips ?? undefined,
      arms: m.arms ?? undefined,
      thighs: m.thighs ?? undefined,
      notes: m.notes ?? '',
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this measurement?')) return;
    await BodyMetricService.deleteMetric(clientId, id);
    await load();
  };

  const toggleChartMetric = (key: MetricKey) => {
    setActiveChartMetrics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  // ── Derived data ─────────────────────────────────────────────────────────────

  const chartData = metrics.map(m => ({
    date: new Date(m.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: m.weight,
    body_fat_percentage: m.body_fat_percentage,
    muscle_mass: m.muscle_mass,
    waist: m.waist,
    chest: m.chest,
    hips: m.hips,
    arms: m.arms,
    thighs: m.thighs,
  }));

  const latest = metrics[metrics.length - 1];
  const previous = metrics[metrics.length - 2];

  const getDelta = (key: MetricKey) => {
    if (!latest || !previous) return null;
    const l = latest[key];
    const p = previous[key];
    if (l == null || p == null) return null;
    return +(l - p).toFixed(1);
  };

  const DeltaBadge = ({ delta, lowerIsBetter = false }: { delta: number | null; lowerIsBetter?: boolean }) => {
    if (delta === null) return null;
    const good = lowerIsBetter ? delta < 0 : delta > 0;
    const color = delta === 0 ? 'text-gray-500' : good ? 'text-green-600' : 'text-red-500';
    const Icon = delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
    return (
      <span className={`flex items-center gap-0.5 text-xs font-medium ${color}`}>
        <Icon className="w-3 h-3" />
        {delta > 0 ? '+' : ''}{delta}
      </span>
    );
  };

  // ── Loading ───────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="animate-pulse space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-600" /> Body Metrics
        </h3>
        {isTrainerView && (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" /> Log Measurement
          </button>
        )}
      </div>


      {/* Summary cards — latest values */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['weight', 'body_fat_percentage', 'muscle_mass'] as MetricKey[]).map(key => {
            const val = latest[key];
            if (val == null) return null;
            const cfg = METRIC_CONFIG[key];
            const delta = getDelta(key);
            return (
              <div key={key} className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs text-gray-500 mb-1">{cfg.label}</p>
                <p className="text-2xl font-bold text-gray-900">{val}<span className="text-sm font-normal text-gray-400 ml-1">{cfg.unit}</span></p>
                <DeltaBadge delta={delta} lowerIsBetter={key === 'body_fat_percentage'} />
              </div>
            );
          })}
          {/* BMI card */}
          {latest.weight && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Latest entry</p>
              <p className="text-sm font-semibold text-gray-700">{new Date(latest.measured_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-xs text-gray-400 mt-1">{metrics.length} total entries</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {metrics.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Scale className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No measurements recorded yet</p>
          <p className="text-gray-400 text-sm mb-5">
            {isTrainerView ? 'Log the first measurement to start tracking progress.' : 'Your trainer will log measurements here.'}
          </p>
          {isTrainerView && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Log First Measurement
            </button>
          )}
        </div>
      )}


      {/* Tabs: Charts / History */}
      {metrics.length > 0 && (
        <>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            {(['charts', 'history'] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${activeTab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t}
              </button>
            ))}
          </div>

          {/* ── CHARTS TAB ── */}
          {activeTab === 'charts' && (
            <div className="space-y-6">
              {/* Metric toggles */}
              <div className="flex flex-wrap gap-2">
                {([...CHART_METRICS, ...MEASUREMENT_METRICS] as MetricKey[]).map(key => {
                  const cfg = METRIC_CONFIG[key];
                  const active = activeChartMetrics.includes(key);
                  const hasData = metrics.some(m => m[key] != null);
                  if (!hasData) return null;
                  return (
                    <button key={key} onClick={() => toggleChartMetric(key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${active ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                      style={active ? { backgroundColor: cfg.color, borderColor: cfg.color } : {}}>
                      {cfg.label} ({cfg.unit})
                    </button>
                  );
                })}
              </div>

              {/* Line chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                    <Legend />
                    {activeChartMetrics.map(key => (
                      <Line key={key} type="monotone" dataKey={key}
                        name={`${METRIC_CONFIG[key].label} (${METRIC_CONFIG[key].unit})`}
                        stroke={METRIC_CONFIG[key].color}
                        strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }}
                        connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}


      {/* ── HISTORY TAB ── */}
      {metrics.length > 0 && activeTab === 'history' && (
        <div className="space-y-3">
          {[...metrics].reverse().map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-2">
                    {new Date(m.measured_at).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(METRIC_CONFIG) as MetricKey[]).map(key => {
                      const val = m[key];
                      if (val == null) return null;
                      return (
                        <span key={key} className="text-sm text-gray-600">
                          <span className="text-gray-400">{METRIC_CONFIG[key].label}:</span>{' '}
                          <span className="font-medium text-gray-900">{val} {METRIC_CONFIG[key].unit}</span>
                        </span>
                      );
                    })}
                  </div>
                  {m.notes && <p className="mt-2 text-sm text-gray-500 italic">{m.notes}</p>}
                </div>
                {isTrainerView && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => handleEdit(m)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* ── LOG FORM MODAL ── */}
      {showForm && isTrainerView && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Measurement' : 'Log Measurement'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={form.measured_at}
                  onChange={e => setForm(f => ({ ...f, measured_at: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              {/* Core metrics */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Core Metrics</p>
                <div className="grid grid-cols-3 gap-3">
                  {(['weight', 'body_fat_percentage', 'muscle_mass'] as MetricKey[]).map(key => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1">{METRIC_CONFIG[key].label} ({METRIC_CONFIG[key].unit})</label>
                      <input type="number" step="0.1" min="0"
                        value={form[key] ?? ''}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value ? +e.target.value : undefined }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Body measurements */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Body Measurements (cm)</p>
                <div className="grid grid-cols-3 gap-3">
                  {MEASUREMENT_METRICS.map(key => (
                    <div key={key}>
                      <label className="block text-xs text-gray-500 mb-1">{METRIC_CONFIG[key].label}</label>
                      <input type="number" step="0.1" min="0"
                        value={form[key] ?? ''}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value ? +e.target.value : undefined }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} value={form.notes ?? ''}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional notes about this measurement..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.measured_at}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                {saving ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Saving...</> : <><Check className="w-4 h-4" />{editingId ? 'Update' : 'Save'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div> // end root div
  );
}

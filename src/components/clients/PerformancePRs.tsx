'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  PerformanceRecordService, PerformanceRecord,
  PerformanceRecordCreate, RECORD_TYPES, UNITS,
} from '@/services/performanceRecords';
import { Trophy, Plus, Trash2, Edit2, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface Props { clientId: number; isTrainerView?: boolean; }

const EMPTY_FORM: PerformanceRecordCreate = {
  exercise_name: '', value: 0, unit: 'kg',
  record_type: '1RM', recorded_at: new Date().toISOString().slice(0, 10), notes: '',
};

// Group records by exercise name
function groupByExercise(records: PerformanceRecord[]): Record<string, PerformanceRecord[]> {
  return records.reduce((acc, r) => {
    if (!acc[r.exercise_name]) acc[r.exercise_name] = [];
    acc[r.exercise_name].push(r);
    return acc;
  }, {} as Record<string, PerformanceRecord[]>);
}

export default function PerformancePRs({ clientId, isTrainerView = true }: Props) {
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PerformanceRecordCreate>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => { load(); }, [clientId]);

  const load = async () => {
    try {
      setLoading(true);
      const data = isTrainerView
        ? await PerformanceRecordService.getRecords(clientId)
        : await PerformanceRecordService.getMyRecords();
      setRecords(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.exercise_name || !form.value) return;
    setSaving(true);
    try {
      const payload = { ...form, notes: form.notes || undefined };
      if (editingId) {
        await PerformanceRecordService.updateRecord(clientId, editingId, payload);
      } else {
        await PerformanceRecordService.createRecord(clientId, payload);
      }
      await load();
      setShowForm(false); setEditingId(null); setForm(EMPTY_FORM);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleEdit = (r: PerformanceRecord) => {
    setForm({
      exercise_name: r.exercise_name, value: r.value, unit: r.unit,
      record_type: r.record_type, recorded_at: r.recorded_at, notes: r.notes ?? '',
    });
    setEditingId(r.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this record?')) return;
    await PerformanceRecordService.deleteRecord(clientId, id);
    await load();
  };

  const toggleExpand = (name: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  if (loading) return (
    <div className="animate-pulse space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl"/>)}
    </div>
  );

  const grouped = groupByExercise(records);
  const exerciseNames = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" /> Performance PRs
        </h3>
        {isTrainerView && (
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Log PR
          </button>
        )}
      </div>

      {/* Empty state */}
      {records.length === 0 && (
        <div className="text-center py-14 bg-white rounded-xl border border-gray-100">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No performance records yet</p>
          <p className="text-gray-400 text-sm mb-5">
            {isTrainerView ? 'Log the first PR to start tracking strength progress.' : 'Your trainer will log your PRs here.'}
          </p>
          {isTrainerView && (
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Plus className="w-4 h-4" /> Log First PR
            </button>
          )}
        </div>
      )}

      {/* Exercise groups */}
      {exerciseNames.map(name => {
        const recs = [...grouped[name]].sort(
          (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
        );
        const best = recs.reduce((max, r) => r.value > max.value ? r : max, recs[0]);
        const isOpen = expanded.has(name);
        const chartData = recs.map(r => ({
          date: new Date(r.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: r.value,
        }));

        return (
          <div key={name} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Exercise header row */}
            <button onClick={() => toggleExpand(name)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 bg-yellow-50 rounded-lg flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-400">{recs[0].record_type} · {recs.length} {recs.length === 1 ? 'entry' : 'entries'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Best</p>
                  <p className="text-lg font-bold text-yellow-600">{best.value} <span className="text-sm font-normal text-gray-400">{best.unit}</span></p>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {/* Expanded: chart + history */}
            {isOpen && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                {/* Mini line chart */}
                {recs.length > 1 && (
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                        formatter={(v: number) => [`${v} ${recs[0].unit}`, 'Value']} />
                      <Line type="monotone" dataKey="value" stroke="#f59e0b"
                        strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                {/* Entry list */}
                <div className="space-y-2">
                  {[...recs].reverse().map(r => (
                    <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50">
                      <div>
                        <span className="text-sm font-medium text-gray-900">{r.value} {r.unit}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(r.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {r.notes && <span className="text-xs text-gray-400 ml-2 italic">— {r.notes}</span>}
                      </div>
                      {isTrainerView && (
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}


      {/* Log Form Modal */}
      {showForm && isTrainerView && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Record' : 'Log PR'}
              </h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Exercise name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exercise *</label>
                <input type="text" value={form.exercise_name} placeholder="e.g. Bench Press"
                  onChange={e => setForm(f => ({ ...f, exercise_name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              {/* Record type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                <select value={form.record_type}
                  onChange={e => setForm(f => ({ ...f, record_type: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Value + Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value *</label>
                  <input type="number" step="0.5" min="0" value={form.value || ''}
                    onChange={e => setForm(f => ({ ...f, value: +e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={form.unit}
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={form.recorded_at}
                  onChange={e => setForm(f => ({ ...f, recorded_at: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <input type="text" value={form.notes ?? ''} placeholder="Optional context..."
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave}
                disabled={saving || !form.exercise_name || !form.value}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                {saving
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Saving...</>
                  : <><Check className="w-4 h-4" />{editingId ? 'Update' : 'Save PR'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

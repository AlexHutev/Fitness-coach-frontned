'use client';

import { useState, useEffect } from 'react';
import {
  GoalMilestoneService, GoalMilestone, GoalCreate,
  GOAL_TYPES, METRICS,
} from '@/services/goalMilestones';
import { Target, Plus, Trash2, Edit2, X, Check, CheckCircle } from 'lucide-react';

interface Props { clientId: number; isTrainerView?: boolean; }

const EMPTY_FORM: GoalCreate = {
  title: '', goal_type: 'weight_loss', metric: 'weight',
  unit: 'kg', start_value: 0, target_value: 0,
  current_value: undefined, start_date: new Date().toISOString().slice(0, 10),
  target_date: '', notes: '',
};

const GOAL_TYPE_COLORS: Record<string, string> = {
  weight_loss:     'bg-orange-50 text-orange-700 border-orange-200',
  weight_gain:     'bg-blue-50 text-blue-700 border-blue-200',
  muscle_gain:     'bg-green-50 text-green-700 border-green-200',
  endurance:       'bg-purple-50 text-purple-700 border-purple-200',
  strength:        'bg-red-50 text-red-700 border-red-200',
  general_fitness: 'bg-teal-50 text-teal-700 border-teal-200',
  rehabilitation:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  custom:          'bg-gray-50 text-gray-700 border-gray-200',
};

function progressBarColor(pct: number, completed: boolean) {
  if (completed) return 'bg-green-500';
  if (pct >= 75) return 'bg-blue-500';
  if (pct >= 40) return 'bg-yellow-400';
  return 'bg-orange-400';
}

function daysLeft(target?: string) {
  if (!target) return null;
  const diff = Math.ceil((new Date(target).getTime() - Date.now()) / 86400000);
  return diff;
}

export default function GoalMilestones({ clientId, isTrainerView = true }: Props) {
  const [goals, setGoals] = useState<GoalMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<GoalCreate>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [progressInput, setProgressInput] = useState<Record<number, string>>({});

  useEffect(() => { load(); }, [clientId]);

  const load = async () => {
    try {
      setLoading(true);
      const data = isTrainerView
        ? await GoalMilestoneService.getGoals(clientId)
        : await GoalMilestoneService.getMyGoals();
      setGoals(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.title || !form.start_value || !form.target_value) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        target_date: form.target_date || undefined,
        notes: form.notes || undefined,
        current_value: form.current_value ?? form.start_value,
      };
      if (editingId) {
        await GoalMilestoneService.updateGoal(clientId, editingId, payload);
      } else {
        await GoalMilestoneService.createGoal(clientId, payload);
      }
      await load();
      setShowForm(false); setEditingId(null); setForm(EMPTY_FORM);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleEdit = (g: GoalMilestone) => {
    setForm({
      title: g.title, goal_type: g.goal_type, metric: g.metric,
      unit: g.unit ?? 'kg', start_value: g.start_value, target_value: g.target_value,
      current_value: g.current_value, start_date: g.start_date,
      target_date: g.target_date ?? '', notes: g.notes ?? '',
    });
    setEditingId(g.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this goal?')) return;
    await GoalMilestoneService.deleteGoal(clientId, id);
    await load();
  };

  const handleMarkComplete = async (g: GoalMilestone) => {
    await GoalMilestoneService.updateGoal(clientId, g.id, {
      is_completed: true,
      current_value: g.target_value,
      completed_date: new Date().toISOString().slice(0, 10),
    } as any);
    await load();
  };

  const handleUpdateProgress = async (g: GoalMilestone) => {
    const val = parseFloat(progressInput[g.id] ?? '');
    if (isNaN(val)) return;
    setUpdatingId(g.id);
    try {
      await GoalMilestoneService.updateGoal(clientId, g.id, { current_value: val });
      await load();
      setProgressInput(prev => { const n = { ...prev }; delete n[g.id]; return n; });
    } finally { setUpdatingId(null); }
  };

  if (loading) return (
    <div className="animate-pulse space-y-3">
      {[1,2].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl"/>)}
    </div>
  );

  const active = goals.filter(g => !g.is_completed);
  const completed = goals.filter(g => g.is_completed);


  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" /> Goal Milestones
        </h3>
        {isTrainerView && (
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        )}
      </div>

      {/* Empty */}
      {goals.length === 0 && (
        <div className="text-center py-14 bg-white rounded-xl border border-gray-100">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No goals set yet</p>
          <p className="text-gray-400 text-sm mb-5">
            {isTrainerView ? 'Create a goal to start tracking milestones.' : 'Your trainer will set goals for you here.'}
          </p>
          {isTrainerView && (
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Plus className="w-4 h-4" /> Add First Goal
            </button>
          )}
        </div>
      )}

      {/* Active goals */}
      {active.length > 0 && (
        <div className="space-y-4">
          {active.map(g => {
            const days = daysLeft(g.target_date);
            const typeLabel = GOAL_TYPES.find(t => t.value === g.goal_type)?.label ?? g.goal_type;
            const barColor = progressBarColor(g.progress_pct, false);
            return (
              <div key={g.id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-semibold text-gray-900">{g.title}</h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${GOAL_TYPE_COLORS[g.goal_type] ?? GOAL_TYPE_COLORS.custom}`}>
                        {typeLabel}
                      </span>
                      {days !== null && (
                        <span className={`text-xs font-medium ${days < 0 ? 'text-red-500' : days <= 7 ? 'text-orange-500' : 'text-gray-400'}`}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      {g.start_value} → {g.target_value} {g.unit}
                      {g.current_value != null && ` · Current: ${g.current_value} ${g.unit}`}
                    </p>
                  </div>
                  {isTrainerView && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleMarkComplete(g)} title="Mark complete"
                        className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-green-50 transition-colors">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(g)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(g.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{g.progress_pct}% complete</span>
                    <span>{g.current_value ?? g.start_value} / {g.target_value} {g.unit}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${g.progress_pct}%` }} />
                  </div>
                </div>

                {/* Update current value (trainer only) */}
                {isTrainerView && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
                    <input type="number" step="0.1" placeholder={`Update current (${g.unit})`}
                      value={progressInput[g.id] ?? ''}
                      onChange={e => setProgressInput(prev => ({ ...prev, [g.id]: e.target.value }))}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <button onClick={() => handleUpdateProgress(g)}
                      disabled={updatingId === g.id || !progressInput[g.id]}
                      className="sm:shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors">
                      {updatingId === g.id ? '…' : 'Update'}
                    </button>
                  </div>
                )}

                {g.notes && <p className="mt-2 text-xs text-gray-400 italic">{g.notes}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Completed goals */}
      {completed.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" /> Completed Goals ({completed.length})
          </p>
          <div className="space-y-2">
            {completed.map(g => (
              <div key={g.id} className="bg-green-50 rounded-xl border border-green-100 px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" /> {g.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {g.start_value} → {g.target_value} {g.unit}
                    {g.completed_date && ` · Completed ${new Date(g.completed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                  </p>
                </div>
                {isTrainerView && (
                  <button onClick={() => handleDelete(g.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Create / Edit Modal */}
      {showForm && isTrainerView && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Goal' : 'Add Goal'}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={form.title} placeholder="e.g. Lose 10kg by summer"
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>

              {/* Type + Metric */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                  <select value={form.goal_type}
                    onChange={e => setForm(f => ({ ...f, goal_type: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {GOAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metric</label>
                  <select value={form.metric}
                    onChange={e => setForm(f => ({ ...f, metric: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                    {METRICS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start *</label>
                  <input type="number" step="0.1" value={form.start_value || ''}
                    onChange={e => setForm(f => ({ ...f, start_value: +e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target *</label>
                  <input type="number" step="0.1" value={form.target_value || ''}
                    onChange={e => setForm(f => ({ ...f, target_value: +e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input type="text" value={form.unit} placeholder="kg / % / reps"
                    onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input type="date" value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                  <input type="date" value={form.target_date ?? ''}
                    onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} value={form.notes ?? ''} placeholder="Optional context or strategy..."
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave}
                disabled={saving || !form.title || !form.start_value || !form.target_value}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                {saving
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>Saving...</>
                  : <><Check className="w-4 h-4"/>{editingId ? 'Update' : 'Save Goal'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

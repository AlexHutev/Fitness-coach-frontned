'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { WorkoutCompletionService, CompletionStats } from '@/services/workoutCompletion';
import { CheckCircle, XCircle, Flame, TrendingUp, Activity } from 'lucide-react';

interface Props {
  clientId: number;
  isTrainerView?: boolean;
}

export default function WorkoutCompletionRate({ clientId, isTrainerView = true }: Props) {
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState(8);

  useEffect(() => {
    load();
  }, [clientId, weeks]);

  const load = async () => {
    try {
      setLoading(true);
      const data = isTrainerView
        ? await WorkoutCompletionService.getClientCompletion(clientId, weeks)
        : await WorkoutCompletionService.getMyCompletion(weeks);
      setStats(data);
    } catch (e) {
      console.error('Failed to load completion stats', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
    </div>
  );

  if (!stats) return null;

  const rateColor = (rate: number) =>
    rate >= 80 ? '#22c55e' : rate >= 50 ? '#f59e0b' : '#ef4444';

  const chartData = stats.weekly_breakdown.map(w => ({
    week: w.week_label,
    Completed: w.completed,
    Skipped: w.skipped,
    Pending: w.total - w.completed - w.skipped,
    rate: w.completion_rate,
  }));


  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-600" /> Workout Completion Rate
        </h3>
        {/* Week range selector */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[4, 8, 12].map(w => (
            <button key={w} onClick={() => setWeeks(w)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${weeks === w ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {w}w
            </button>
          ))}
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Overall Rate</p>
          <p className="text-2xl font-bold" style={{ color: rateColor(stats.overall_rate) }}>
            {stats.overall_rate}%
          </p>
          <p className="text-xs text-gray-400 mt-1">all time</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.total_completed}</p>
          <p className="text-xs text-gray-400 mt-1">of {stats.total_assigned} exercises</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Skipped</p>
          <p className="text-2xl font-bold text-red-500">{stats.total_skipped}</p>
          <p className="text-xs text-gray-400 mt-1">exercises</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col justify-between">
          <p className="text-xs text-gray-500 mb-1">Current Streak</p>
          <div className="flex items-center gap-1">
            <Flame className={`w-5 h-5 ${stats.current_streak > 0 ? 'text-orange-500' : 'text-gray-300'}`} />
            <p className="text-2xl font-bold text-gray-900">{stats.current_streak}</p>
          </div>
          <p className="text-xs text-gray-400">consecutive days</p>
        </div>
      </div>

      {/* Bar chart */}
      {stats.weekly_breakdown.length > 0 && stats.total_assigned > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-700 mb-4">Weekly Breakdown</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(value: number, name: string) => [value, name]}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Completed" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Skipped" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Pending" stackId="a" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="text-center py-14 bg-white rounded-xl border border-gray-100">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No workout data yet</p>
          <p className="text-gray-400 text-sm">
            {isTrainerView
              ? 'Assign a program with weekly exercises to start tracking completion.'
              : 'Complete your assigned exercises to see your progress here.'}
          </p>
        </div>
      )}

      {/* Per-week rate list */}
      {stats.total_assigned > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">Week-by-week breakdown</p>
          </div>
          {stats.weekly_breakdown.filter(w => w.total > 0).reverse().map(w => (
            <div key={w.week_start} className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-500 w-16 shrink-0">{w.week_label}</span>
              {/* Progress bar */}
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${w.completion_rate}%`, backgroundColor: rateColor(w.completion_rate) }} />
              </div>
              <span className="text-sm font-semibold w-10 text-right"
                style={{ color: rateColor(w.completion_rate) }}>
                {w.completion_rate}%
              </span>
              <span className="text-xs text-gray-400 w-20 text-right shrink-0">
                {w.completed}/{w.total} done
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

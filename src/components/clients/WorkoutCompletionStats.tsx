'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from 'recharts';
import { WorkoutStatsService, WorkoutStats } from '@/services/workoutStats';
import { Flame, CheckCircle, XCircle, TrendingUp, Dumbbell } from 'lucide-react';

interface Props {
  clientId: number;
  isTrainerView?: boolean;
}

export default function WorkoutCompletionStats({ clientId, isTrainerView = true }: Props) {
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = isTrainerView
          ? await WorkoutStatsService.getClientStats(clientId)
          : await WorkoutStatsService.getMyStats();
        setStats(data);
      } catch (e) {
        console.error('Failed to load workout stats', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId, isTrainerView]);

  if (loading) return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
    </div>
  );

  if (!stats) return (
    <div className="text-center py-12 text-gray-400">Failed to load workout stats.</div>
  );

  const hasData = stats.total_assigned > 0;


  return (
    <div className="space-y-6">

      {/* Header */}
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Dumbbell className="w-5 h-5 text-blue-600" /> Workout Completion
      </h3>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Overall rate */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats.overall_rate}<span className="text-sm font-normal text-gray-400 ml-0.5">%</span>
          </p>
          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${stats.overall_rate}%` }}
            />
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.total_completed}</p>
          <p className="text-xs text-gray-400 mt-1">of {stats.total_assigned} assigned</p>
        </div>

        {/* Current streak */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Current Streak</p>
          <p className="text-2xl font-bold text-orange-500 flex items-center gap-1">
            <Flame className="w-5 h-5" />{stats.current_streak}
            <span className="text-sm font-normal text-gray-400 ml-0.5">days</span>
          </p>
        </div>

        {/* Longest streak */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Longest Streak</p>
          <p className="text-2xl font-bold text-purple-600">{stats.longest_streak}
            <span className="text-sm font-normal text-gray-400 ml-1">days</span>
          </p>
        </div>
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No workout data yet</p>
          <p className="text-gray-400 text-sm">
            {isTrainerView
              ? 'Assign weekly exercises to start tracking completion.'
              : 'Complete your assigned exercises to see stats here.'}
          </p>
        </div>
      )}

      {/* Weekly bar chart */}
      {hasData && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Weekly Breakdown (last 8 weeks)</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={stats.weekly_breakdown}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              barSize={18}
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="week_label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(value: number, name: string) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="completed" name="completed" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="skipped" name="skipped" fill="#f97316" radius={[3, 3, 0, 0]} />
              <Bar dataKey="pending" name="pending" fill="#e5e7eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Week-by-week rate list */}
      {hasData && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Week-by-Week Rate</p>
          <div className="space-y-2">
            {[...stats.weekly_breakdown].reverse().filter(w => w.total > 0).slice(0, 6).map(w => (
              <div key={w.week_start} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16 shrink-0">{w.week_label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${w.completion_rate}%`,
                      backgroundColor: w.completion_rate >= 80 ? '#22c55e' : w.completion_rate >= 50 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700 w-10 text-right">
                  {w.completion_rate}%
                </span>
                <span className="text-xs text-gray-400 w-16 shrink-0">
                  {w.completed}/{w.total} done
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { appointmentService, Appointment } from '@/services/appointment';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  confirmed:  'bg-green-100 text-green-800',
  scheduled:  'bg-blue-100 text-blue-800',
  pending:    'bg-yellow-100 text-yellow-800',
  completed:  'bg-gray-100 text-gray-800',
  cancelled:  'bg-red-100 text-red-800',
  no_show:    'bg-red-100 text-red-800',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function isPast(iso: string) {
  return new Date(iso) < new Date();
}

interface Props {
  clientId: number;
  clientName?: string;
}

export default function ClientAppointments({ clientId, clientName }: Props) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await appointmentService.getAppointments({ limit: 100 });
        // Filter to only this client's appointments
        const clientAppts = result.appointments.filter(a => a.client_id === clientId);
        setAppointments(clientAppts);
      } catch (err) {
        console.error('Failed to load appointments:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId]);

  const filtered = appointments.filter(a => {
    if (filter === 'upcoming') return !isPast(a.end_time) && a.status !== 'cancelled';
    if (filter === 'past') return isPast(a.end_time) || a.status === 'completed' || a.status === 'cancelled';
    return true;
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {(['upcoming', 'past', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <Link
          href={`/appointments/create`}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Appointment
        </Link>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">
            {filter === 'upcoming' ? 'No upcoming appointments' : 'No appointments found'}
          </p>
          <p className="text-gray-400 text-sm mb-5">
            {filter === 'upcoming' && clientName
              ? `Schedule a session with ${clientName}`
              : 'No records match this filter'}
          </p>
          {filter === 'upcoming' && (
            <Link
              href="/appointments/create"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              <Plus className="w-4 h-4" /> Schedule Now
            </Link>
          )}
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map(appt => (
          <div
            key={appt.id}
            className={`bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow ${
              isPast(appt.end_time) ? 'border-gray-100 opacity-75' : 'border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Title + badges */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h3 className="font-semibold text-gray-900">{appt.title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[appt.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {appt.status}
                  </span>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {appt.appointment_type}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(appt.start_time)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(appt.start_time)} — {formatTime(appt.end_time)}
                    <span className="text-gray-400">({appt.duration_minutes} min)</span>
                  </span>
                  {appt.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {appt.location}
                    </span>
                  )}
                </div>

                {appt.notes && (
                  <p className="mt-2 text-sm text-gray-500 italic line-clamp-1">{appt.notes}</p>
                )}
              </div>

              <Link
                href={`/appointments/${appt.id}`}
                className="shrink-0 text-sm text-blue-600 hover:underline font-medium"
              >
                View →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

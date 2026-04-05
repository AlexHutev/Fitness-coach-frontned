'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { withTrainerAuth } from '@/context/AuthContext';
import { appointmentService, Appointment } from '@/services/appointment';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, Clock, MapPin, User,
  FileText, Edit, Trash2, CheckCircle, XCircle,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  confirmed:  'bg-green-100 text-green-800 border-green-200',
  scheduled:  'bg-blue-100 text-blue-800 border-blue-200',
  pending:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed:  'bg-gray-100 text-gray-800 border-gray-200',
  cancelled:  'bg-red-100 text-red-800 border-red-200',
  no_show:    'bg-red-100 text-red-800 border-red-200',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await appointmentService.getAppointment(id);
        setAppointment(data);
      } catch {
        setError('Appointment not found');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!appointment) return;
    try {
      setStatusLoading(true);
      const updated = await appointmentService.updateAppointmentStatus(appointment.id, status);
      setAppointment(updated);
    } catch {
      alert('Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!appointment || !confirm('Are you sure you want to delete this appointment?')) return;
    try {
      await appointmentService.deleteAppointment(appointment.id);
      router.push('/appointments');
    } catch {
      alert('Failed to delete appointment');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">{error ?? 'Appointment not found'}</p>
        <Link href="/appointments" className="text-blue-600 hover:underline">← Back to Appointments</Link>
      </div>
    );
  }

  const clientName = appointment.client
    ? `${appointment.client.first_name} ${appointment.client.last_name}`
    : 'Unknown Client';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back */}
        <Link href="/appointments" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Appointments
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{appointment.title}</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border capitalize ${STATUS_COLORS[appointment.status] ?? STATUS_COLORS.scheduled}`}>
                  {appointment.status}
                </span>
                <span className="text-sm text-blue-600 font-medium">{appointment.appointment_type}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {appointment.status !== 'confirmed' && appointment.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange('confirmed')}
                  disabled={statusLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-green-50 hover:bg-green-100 text-green-700 rounded-lg border border-green-200 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> Confirm
                </button>
              )}
              {appointment.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  disabled={statusLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-gray-200 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> Complete
                </button>
              )}
              {appointment.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={statusLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
              )}
              <Link
                href={`/appointments/${appointment.id}/edit`}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" /> Edit
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white hover:bg-red-50 text-red-600 rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Client</p>
                <p className="font-medium text-gray-900">{clientName}</p>
                {appointment.client?.email && (
                  <p className="text-sm text-gray-500">{appointment.client.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Date</p>
                <p className="font-medium text-gray-900">{formatDate(appointment.start_time)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Time</p>
                <p className="font-medium text-gray-900">
                  {formatTime(appointment.start_time)} – {formatTime(appointment.end_time)}
                </p>
                <p className="text-sm text-gray-500">{appointment.duration_minutes} minutes</p>
              </div>
            </div>

            {appointment.location && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Location</p>
                  <p className="font-medium text-gray-900">{appointment.location}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description / Notes */}
        {(appointment.description || appointment.notes) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" /> Notes & Description
            </h2>
            {appointment.description && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Description</p>
                <p className="text-gray-700">{appointment.description}</p>
              </div>
            )}
            {appointment.notes && (
              <div>
                <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">Notes</p>
                <p className="text-gray-700">{appointment.notes}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default withTrainerAuth(AppointmentDetailPage);

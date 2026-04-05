'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { withTrainerAuth } from '@/context/AuthContext';
import { appointmentService } from '@/services/appointment';
import { ClientService } from '@/services/clients';
import { Client } from '@/types/api';
import Link from 'next/link';
import { Calendar, ArrowLeft, Clock, MapPin, User, FileText } from 'lucide-react';

function toLocalDateTimeString(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addMinutesToLocalString(localStr: string, minutes: number): string {
  if (!localStr) return '';
  const [datePart, timePart] = localStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, mins] = timePart.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  const extraDays = Math.floor(totalMinutes / (60 * 24));
  const newDate = new Date(year, month - 1, day + extraDays);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${newDate.getFullYear()}-${pad(newDate.getMonth() + 1)}-${pad(newDate.getDate())}T${pad(newHours)}:${pad(newMins)}`;
}

const APPOINTMENT_TYPES = [
  'Personal Training', 'Program Review', 'Initial Assessment',
  'Consultation', 'Group Session', 'Follow-up',
];

function EditAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    client_id: 0,
    title: '',
    description: '',
    appointment_type: 'Personal Training',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    location: '',
    notes: '',
    status: 'scheduled',
  });

  // Load appointment + clients on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [appt, clientData] = await Promise.all([
          appointmentService.getAppointment(id),
          ClientService.getClients(),
        ]);

        setFormData({
          client_id: appt.client_id,
          title: appt.title,
          description: appt.description ?? '',
          appointment_type: appt.appointment_type,
          start_time: toLocalDateTimeString(appt.start_time),
          end_time: toLocalDateTimeString(appt.end_time),
          duration_minutes: appt.duration_minutes,
          location: appt.location ?? '',
          notes: appt.notes ?? '',
          status: appt.status,
        });

        setClients(Array.isArray(clientData) ? clientData : []);
      } catch {
        setErrors({ load: 'Failed to load appointment' });
      } finally {
        setPageLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDateTimeChange = (field: 'start_time' | 'end_time', value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'start_time' && value && prev.duration_minutes) {
        updated.end_time = addMinutesToLocalString(value, prev.duration_minutes);
      }
      return updated;
    });
  };

  const handleDurationChange = (minutes: number) => {
    setFormData(prev => {
      const updated = { ...prev, duration_minutes: minutes };
      if (prev.start_time) {
        updated.end_time = addMinutesToLocalString(prev.start_time, minutes);
      }
      return updated;
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.client_id) newErrors.client_id = 'Please select a client';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    if (formData.start_time && formData.end_time) {
      if (new Date(formData.end_time) <= new Date(formData.start_time)) {
        newErrors.end_time = 'End time must be after start time';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const toBackendISO = (s: string) => s.length === 16 ? s + ':00' : s;
      await appointmentService.updateAppointment(id, {
        client_id: Number(formData.client_id),
        title: formData.title,
        description: formData.description || undefined,
        appointment_type: formData.appointment_type,
        start_time: toBackendISO(formData.start_time),
        end_time: toBackendISO(formData.end_time),
        duration_minutes: formData.duration_minutes,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        status: formData.status,
      });
      router.push(`/appointments/${id}`);
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      setErrors({ submit: detail || 'Failed to save changes. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
      </div>
    );
  }

  if (errors.load) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-red-500 mb-4">{errors.load}</p>
        <Link href="/appointments" className="text-blue-600 hover:underline">← Back to Appointments</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/appointments/${id}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Appointment
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Calendar className="w-8 h-8 mr-3 text-blue-600" />
          Edit Appointment
        </h1>
        <p className="text-gray-600 mb-8">Update the appointment details below</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />Client *
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.client_id ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Select a client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                ))}
              </select>
              {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Type + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                <select
                  name="appointment_type"
                  value={formData.appointment_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {APPOINTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={(e) => handleDateTimeChange('start_time', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.start_time ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time *</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={(e) => handleDateTimeChange('end_time', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.end_time ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Duration (minutes)</label>
              <div className="flex flex-wrap gap-2">
                {[30, 45, 60, 90, 120].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleDurationChange(d)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.duration_minutes === d
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Main Gym Floor, Consultation Room"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
              <Link href={`/appointments/${id}`} className="btn-secondary">Cancel</Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2"
              >
                {loading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /><span>Saving...</span></>
                ) : (
                  <><Calendar className="w-4 h-4" /><span>Save Changes</span></>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withTrainerAuth(EditAppointmentPage);

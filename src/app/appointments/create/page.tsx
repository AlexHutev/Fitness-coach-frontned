'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, withTrainerAuth } from '@/context/AuthContext';
import { ClientService } from '@/services/clients';
import { appointmentService } from '@/services/appointment';
import { Client } from '@/types/api';
import Link from 'next/link';
import { Calendar, ArrowLeft, Clock, MapPin, User, FileText } from 'lucide-react';

// Simple interface for appointment creation (not using the service for now)
interface CreateAppointmentData {
  client_id: number;
  title: string;
  description?: string;
  appointment_type: string;
  start_time: string;
  end_time: string;
  duration_minutes?: number;
  location?: string;
  notes?: string;
  status?: string;
}

function CreateAppointmentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentData>({
    client_id: 0,
    title: '',
    description: '',
    appointment_type: 'Personal Training',
    start_time: '',
    end_time: '',
    duration_minutes: 60,
    location: '',
    notes: '',
    status: 'scheduled'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientData = await ClientService.getClients();
        setClients(Array.isArray(clientData) ? clientData : []);
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        setClients([]); // Set empty array on error
      }
    };

    fetchClients();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Add duration minutes to a datetime-local string (format: "YYYY-MM-DDTHH:mm")
  // We work purely with the string to avoid timezone offset bugs
  const addMinutesToLocalString = (localStr: string, minutes: number): string => {
    if (!localStr) return '';
    // Parse the local string directly as numbers — no timezone conversion
    const [datePart, timePart] = localStr.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, mins] = timePart.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    // Handle day overflow (if duration pushes past midnight)
    const extraDays = Math.floor(totalMinutes / (60 * 24));
    let newDate = new Date(year, month - 1, day + extraDays);
    const pad = (n: number) => String(n).padStart(2, '0');
    const newDateStr = `${newDate.getFullYear()}-${pad(newDate.getMonth() + 1)}-${pad(newDate.getDate())}`;
    return `${newDateStr}T${pad(newHours)}:${pad(newMins)}`;
  };

  const handleDateTimeChange = (field: 'start_time' | 'end_time', value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-calculate end time whenever start time changes
      if (field === 'start_time' && value && prev.duration_minutes) {
        updated.end_time = addMinutesToLocalString(value, prev.duration_minutes);
      }
      return updated;
    });
  };

  const handleDurationChange = (minutes: number) => {
    setFormData(prev => {
      const updated = { ...prev, duration_minutes: minutes };
      // Recalculate end time if start time is already set
      if (prev.start_time) {
        updated.end_time = addMinutesToLocalString(prev.start_time, minutes);
      }
      return updated;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.client_id) newErrors.client_id = 'Please select a client';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.start_time) newErrors.start_time = 'Start time is required';
    if (!formData.end_time) newErrors.end_time = 'End time is required';
    
    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);
      if (end <= start) {
        newErrors.end_time = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert datetime-local strings to ISO without timezone shifting.
      // datetime-local gives "YYYY-MM-DDTHH:mm" in local time.
      // Appending ":00" makes it a valid ISO-like string the backend accepts.
      const toBackendISO = (localStr: string) => localStr.length === 16 ? localStr + ':00' : localStr;

      await appointmentService.createAppointment({
        client_id: Number(formData.client_id),
        title: formData.title,
        description: formData.description || undefined,
        appointment_type: formData.appointment_type as any,
        start_time: toBackendISO(formData.start_time),
        end_time: toBackendISO(formData.end_time),
        duration_minutes: formData.duration_minutes,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
        status: formData.status as any,
      });
      router.push('/appointments');
    } catch (error: any) {
      console.error('Failed to create appointment:', error);
      const detail = error?.response?.data?.detail;
      setErrors({ submit: detail || 'Failed to create appointment. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const appointmentTypes = [
    'Personal Training',
    'Program Review', 
    'Initial Assessment',
    'Consultation',
    'Group Session',
    'Follow-up'
  ];

  const commonDurations = [30, 45, 60, 90, 120];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
            <Calendar className="w-10 h-10 mr-4 text-blue-600" />
            Schedule New Appointment
          </h1>
          <p className="text-gray-600 text-lg">
            Create a new appointment with your client
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Client Selection */}
            <div>
              <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Client *
              </label>
              <select
                id="client_id"
                name="client_id"
                value={formData.client_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.client_id ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Select a client</option>
                {Array.isArray(clients) && clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
              {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
            </div>

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Personal Training Session"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Appointment Type */}
            <div>
              <label htmlFor="appointment_type" className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Type
              </label>
              <select
                id="appointment_type"
                name="appointment_type"
                value={formData.appointment_type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {appointmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={(e) => handleDateTimeChange('start_time', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.start_time ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={(e) => handleDateTimeChange('end_time', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.end_time ? 'border-red-300' : 'border-gray-300'}`}
                />
                {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
              </div>
            </div>

            {/* Duration Quick Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Duration (minutes)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonDurations.map(duration => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => handleDurationChange(duration)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.duration_minutes === duration
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {duration} min
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Main Gym Floor, Consultation Room"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description of the appointment"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional notes or instructions"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Submit Button */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
              <Link
                href="/dashboard"
                className="btn-secondary"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary inline-flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>Create Appointment</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default withTrainerAuth(CreateAppointmentPage);
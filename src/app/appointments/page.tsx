'use client';

import { useState, useEffect } from 'react';
import { useAuth, withTrainerAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight 
} from 'lucide-react';
import { appointmentService, Appointment } from '@/services/appointment';

interface AppointmentFilters {
  page?: number;
  size?: number;
}

function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<AppointmentFilters>({
    page: 1,
    size: 10
  });

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const result = await appointmentService.getAppointments({ page: currentPage, size: 10 });
      setAppointments(result.appointments);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [currentPage]);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getStatusColor = (status: Appointment['status']) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      no_show: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || colors.scheduled;
  };

  const totalPages = Math.ceil(total / (filters.size || 10));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Calendar className="w-10 h-10 mr-4 text-blue-600" />
                Appointments
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your client appointments and schedule
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="btn-secondary inline-flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filter</span>
              </button>
              <Link
                href="/appointments/create"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>New Appointment</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              All Appointments ({total})
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No appointments found
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by scheduling your first appointment
                </p>
                <Link
                  href="/appointments/create"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Schedule Appointment</span>
                </Link>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * (filters.size || 10)) + 1} to{' '}
                  {Math.min(currentPage * (filters.size || 10), total)} of {total} appointments
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium">
                    {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}// Appointment Card Component
function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      no_show: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const { date, time } = formatDateTime(appointment.start_time);
  const endTime = formatDateTime(appointment.end_time).time;
  const clientName = appointment.client 
    ? `${appointment.client.first_name} ${appointment.client.last_name}`
    : 'Unknown Client';

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-3">
            <div className="text-sm text-gray-500 font-medium">
              {date}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-1" />
              {time} - {endTime}
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {appointment.title}
          </h3>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              {clientName}
            </div>
            <div className="text-blue-600 font-medium">
              {appointment.appointment_type}
            </div>
            {appointment.location && (
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {appointment.location}
              </div>
            )}
          </div>
          
          {appointment.description && (
            <p className="text-gray-600 text-sm mb-3">
              {appointment.description}
            </p>
          )}
          
          {appointment.notes && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600 font-medium mb-1">Notes:</p>
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2 ml-6">
          <Link
            href={`/appointments/${appointment.id}`}
            className="btn-secondary text-sm"
          >
            View Details
          </Link>
          <Link
            href={`/appointments/${appointment.id}/edit`}
            className="btn-primary text-sm"
          >
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
}

export default withTrainerAuth(AppointmentsPage);
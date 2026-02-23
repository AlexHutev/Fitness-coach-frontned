'use client';

import { useAuth, withTrainerAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import AssignmentDashboardCard from '@/components/programs/AssignmentDashboardCard';
import { appointmentService, Appointment } from '@/services/appointment';
import { NotificationService, Notification } from '@/services/notifications';
import {
  Users,
  Calendar,
  TrendingUp,
  Target,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  ArrowRight,
  Dumbbell,
  AlertCircle,
  Bell,
  UserCheck,
} from 'lucide-react';

function DashboardPage() {
  const { user } = useAuth();
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's appointments (static for now)
  useEffect(() => {
    const fetchTodaysAppointments = async () => {
      if (!user) { setLoading(false); return; }
      try {
        setLoading(true);
        setError(null);
        const staticAppointments = [
          { id: 1, title: "Personal Training - John Smith", appointment_type: "Personal Training", status: "confirmed", start_time: "2025-06-19T09:00:00", end_time: "2025-06-19T10:00:00", location: "Main Gym Floor", duration_minutes: 60, client_id: 1, trainer_id: 2, description: "", notes: "", created_at: "", updated_at: "", client: { id: 1, first_name: "John", last_name: "Smith", email: "john.smith@email.com" } },
          { id: 2, title: "Program Review - Maria Petrova", appointment_type: "Program Review", status: "confirmed", start_time: "2025-06-19T11:00:00", end_time: "2025-06-19T11:30:00", location: "Consultation Room", duration_minutes: 30, client_id: 2, trainer_id: 2, description: "", notes: "", created_at: "", updated_at: "", client: { id: 2, first_name: "Maria", last_name: "Petrova", email: "maria.petrova@email.com" } },
          { id: 3, title: "Initial Assessment - Adi Hadzhiev", appointment_type: "Initial Assessment", status: "pending", start_time: "2025-06-19T14:00:00", end_time: "2025-06-19T15:00:00", location: "Assessment Room", duration_minutes: 60, client_id: 3, trainer_id: 2, description: "", notes: "", created_at: "", updated_at: "", client: { id: 3, first_name: "Adi", last_name: "Hadzhiev", email: "adi.hadzhiev@email.com" } },
          { id: 4, title: "Personal Training - TestClient WithPassword", appointment_type: "Personal Training", status: "confirmed", start_time: "2025-06-19T16:00:00", end_time: "2025-06-19T17:00:00", location: "Main Gym Floor", duration_minutes: 60, client_id: 4, trainer_id: 2, description: "", notes: "", created_at: "", updated_at: "", client: { id: 4, first_name: "TestClient", last_name: "WithPassword", email: "test.client@email.com" } },
        ];
        setTodaysAppointments(staticAppointments as Appointment[]);
      } catch {
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    fetchTodaysAppointments();
  }, [user]);

  // Fetch real recent activity from notifications
  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user) return;
      try {
        setActivityLoading(true);
        const data = await NotificationService.getNotifications(8, 0, false);
        setRecentNotifications(data.notifications);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setActivityLoading(false);
      }
    };
    fetchRecentActivity();
  }, [user]);

  const quickStats = [
    { title: 'Active Clients', value: '12', change: '+2 this month', icon: Users, color: 'blue', trend: 'up' },
    { title: 'Programs Created', value: '8', change: '+3 this week', icon: Target, color: 'green', trend: 'up' },
    { title: 'Sessions This Week', value: '24', change: '6 remaining', icon: Calendar, color: 'purple', trend: 'stable' },
    { title: 'Client Progress', value: '94%', change: '+5% improvement', icon: TrendingUp, color: 'orange', trend: 'up' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back, {user?.first_name}! 👋</h1>
              <p className="text-gray-600 text-lg">Here&apos;s your fitness coaching dashboard. Manage your clients, programs, and grow your business.</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/clients/create" className="btn-secondary inline-flex items-center space-x-2">
                <Plus className="w-5 h-5" /><span>Add Client</span>
              </Link>
              <Link href="/programs/create" className="btn-primary inline-flex items-center space-x-2">
                <Plus className="w-5 h-5" /><span>Create Program</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => <StatCard key={index} stat={stat} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-blue-600" />Today&apos;s Schedule
                </h2>
                <Link href="/appointments" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                  View all<ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">{error}</div>
                    <button onClick={() => window.location.reload()} className="text-blue-600 hover:text-blue-700 text-sm">Try again</button>
                  </div>
                ) : todaysAppointments.length > 0 ? (
                  todaysAppointments.map((appointment) => <ScheduleItem key={appointment.id} appointment={appointment} />)
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No sessions scheduled for today</p>
                    <Link href="/appointments/create" className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Plus className="w-4 h-4 mr-1" />Schedule an appointment
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity - powered by real notifications */}
          <div>
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-green-600" />Recent Activity
                </h2>
              </div>
              <div className="space-y-1">
                {activityLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : recentNotifications.length > 0 ? (
                  recentNotifications.map((notification) => (
                    <NotificationActivityItem key={notification.id} notification={notification} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No recent activity yet.</p>
                    <p className="text-gray-400 text-xs mt-1">Activity will appear as clients complete workouts.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Program Assignments Section */}
        <div className="mt-8"><AssignmentDashboardCard /></div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard title="Manage Clients" description="View and organize your client base" icon={Users} href="/clients" color="blue" />
              <QuickActionCard title="Create Program" description="Design new training programs" icon={Target} href="/programs/create" color="green" />
              <QuickActionCard title="Schedule Appointment" description="Book sessions with clients" icon={Calendar} href="/appointments/create" color="purple" />
              <QuickActionCard title="Exercise Library" description="Browse and add exercises" icon={Dumbbell} href="/exercises" color="orange" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper: format relative time ───────────────────────────────────────────
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Helper: icon + color per notification type ──────────────────────────────
function getNotificationStyle(type: Notification['notification_type']): {
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  iconColor: string;
} {
  switch (type) {
    case 'workout_completed':
      return { icon: CheckCircle, bg: 'bg-green-100', iconColor: 'text-green-600' };
    case 'day_completed':
      return { icon: CheckCircle, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' };
    case 'exercise_not_completed':
      return { icon: AlertCircle, bg: 'bg-red-100', iconColor: 'text-red-500' };
    case 'appointment_upcoming':
    case 'appointment_reminder':
      return { icon: Calendar, bg: 'bg-blue-100', iconColor: 'text-blue-600' };
    case 'new_assignment':
      return { icon: UserCheck, bg: 'bg-purple-100', iconColor: 'text-purple-600' };
    case 'weekly_exercise_update':
      return { icon: Dumbbell, bg: 'bg-orange-100', iconColor: 'text-orange-600' };
    default:
      return { icon: Bell, bg: 'bg-gray-100', iconColor: 'text-gray-500' };
  }
}

// ─── Notification Activity Item ──────────────────────────────────────────────
function NotificationActivityItem({ notification }: { notification: Notification }) {
  const { icon: Icon, bg, iconColor } = getNotificationStyle(notification.notification_type);

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${notification.is_read ? 'hover:bg-gray-50' : 'bg-green-50 hover:bg-green-100'}`}>
      <div className={`w-8 h-8 ${bg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900 leading-snug">
          <span className="font-medium">{notification.title}:</span>{' '}
          <span className="text-gray-600">{notification.message}</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(notification.created_at)}</p>
      </div>
      {!notification.is_read && (
        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ stat }: { stat: { title: string; value: string; change: string; icon: React.ComponentType<{ className?: string }>; color: string; trend: string; } }) {
  const Icon = stat.icon;
  const colorClasses = { blue: 'bg-blue-50 text-blue-600', green: 'bg-green-50 text-green-600', purple: 'bg-purple-50 text-purple-600', orange: 'bg-orange-50 text-orange-600' };
  return (
    <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>{stat.change}</div>
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
      <div className="text-sm text-gray-600">{stat.title}</div>
    </div>
  );
}

// ─── Schedule Item ───────────────────────────────────────────────────────────
function ScheduleItem({ appointment }: { appointment: Appointment }) {
  const statusColors: Record<string, string> = { confirmed: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', cancelled: 'bg-red-100 text-red-800', scheduled: 'bg-blue-100 text-blue-800', completed: 'bg-gray-100 text-gray-800', no_show: 'bg-red-100 text-red-800' };
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const clientName = appointment.client ? `${appointment.client.first_name} ${appointment.client.last_name}` : 'Unknown Client';
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium text-gray-900 min-w-[70px]">{formatTime(appointment.start_time)}</div>
        <div>
          <div className="text-sm font-medium text-gray-900">{clientName}</div>
          <div className="text-xs text-gray-500">{appointment.appointment_type}</div>
          {appointment.location && <div className="text-xs text-gray-400">{appointment.location}</div>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status] ?? 'bg-gray-100 text-gray-800'}`}>{appointment.status}</span>
        <Link href={`/appointments/${appointment.id}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium">View</Link>
      </div>
    </div>
  );
}

// ─── Quick Action Card ───────────────────────────────────────────────────────
function QuickActionCard({ title, description, icon: Icon, href, color }: { title: string; description: string; icon: React.ComponentType<{ className?: string }>; href: string; color: string; }) {
  const colorClasses = { blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100', green: 'bg-green-50 text-green-600 group-hover:bg-green-100', purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100', orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100' };
  return (
    <Link href={href} className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}

export default withTrainerAuth(DashboardPage);

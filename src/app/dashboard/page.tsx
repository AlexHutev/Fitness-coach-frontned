'use client';

import { useAuth } from '@/context/AuthContext';
import { withAuth } from '@/context/AuthContext';
import Link from 'next/link';
import AssignmentDashboardCard from '@/components/programs/AssignmentDashboardCard';
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
  BarChart3,
  Dumbbell
} from 'lucide-react';

function DashboardPage() {
  const { user } = useAuth();

  const quickStats = [
    { 
      title: 'Active Clients', 
      value: '12', 
      change: '+2 this month',
      icon: Users,
      color: 'blue',
      trend: 'up'
    },
    { 
      title: 'Programs Created', 
      value: '8', 
      change: '+3 this week',
      icon: Target,
      color: 'green',
      trend: 'up'
    },
    { 
      title: 'Sessions This Week', 
      value: '24', 
      change: '6 remaining',
      icon: Calendar,
      color: 'purple',
      trend: 'stable'
    },
    { 
      title: 'Client Progress', 
      value: '94%', 
      change: '+5% improvement',
      icon: TrendingUp,
      color: 'orange',
      trend: 'up'
    }
  ];

  const todaysSchedule = [
    {
      time: '9:00 AM',
      client: 'Sarah Johnson',
      type: 'Personal Training',
      status: 'confirmed'
    },
    {
      time: '11:00 AM',
      client: 'Mike Chen',
      type: 'Program Review',
      status: 'confirmed'
    },
    {
      time: '2:00 PM',
      client: 'Emma Davis',
      type: 'Initial Assessment',
      status: 'pending'
    },
    {
      time: '4:00 PM',
      client: 'James Wilson',
      type: 'Personal Training',
      status: 'confirmed'
    }
  ];

  const recentActivity = [
    {
      action: 'Created new program',
      subject: 'Beginner Strength Training',
      time: '2 hours ago',
      icon: Target
    },
    {
      action: 'Client completed workout',
      subject: 'Sarah Johnson - Upper Body',
      time: '4 hours ago',
      icon: CheckCircle
    },
    {
      action: 'New client registered',
      subject: 'Alex Thompson',
      time: '1 day ago',
      icon: Users
    },
    {
      action: 'Program milestone reached',
      subject: 'Mike Chen - Week 4 Complete',
      time: '2 days ago',
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Welcome back, {user?.first_name}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Here&apos;s your fitness coaching dashboard. Manage your clients, programs, and grow your business.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/clients/create"
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Client</span>
              </Link>
              <Link
                href="/programs/create"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Create Program</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                  Today&apos;s Schedule
                </h2>
                <Link
                  href="/schedule"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
              
              <div className="space-y-4">
                {todaysSchedule.map((session, index) => (
                  <ScheduleItem key={index} session={session} />
                ))}
              </div>
              
              {todaysSchedule.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No sessions scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Activity className="w-6 h-6 mr-3 text-green-600" />
                  Recent Activity
                </h2>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <ActivityItem key={index} activity={activity} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Program Assignments Section */}
        <div className="mt-8">
          <AssignmentDashboardCard />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard
                title="Manage Clients"
                description="View and organize your client base"
                icon={Users}
                href="/clients"
                color="blue"
              />
              <QuickActionCard
                title="Create Program"
                description="Design new training programs"
                icon={Target}
                href="/programs/create"
                color="green"
              />
              <QuickActionCard
                title="Program Assignments"
                description="Assign programs to clients"
                icon={Calendar}
                href="/programs/assignments"
                color="purple"
              />
              <QuickActionCard
                title="Exercise Library"
                description="Browse and add exercises"
                icon={Dumbbell}
                href="/exercises"
                color="orange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ stat }: { stat: {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: string;
} }) {
  const Icon = stat.icon;
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`text-sm font-medium ${
          stat.trend === 'up' ? 'text-green-600' : 
          stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
        }`}>
          {stat.change}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
        <div className="text-sm text-gray-600">{stat.title}</div>
      </div>
    </div>
  );
}

// Schedule Item Component
function ScheduleItem({ session }: { session: {
  time: string;
  client: string;
  type: string;
  status: string;
} }) {
  const statusColors = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium text-gray-900 min-w-[70px]">
          {session.time}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900">{session.client}</div>
          <div className="text-xs text-gray-500">{session.type}</div>
        </div>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[session.status as keyof typeof statusColors]}`}>
        {session.status}
      </span>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ activity }: { activity: {
  action: string;
  subject: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
} }) {
  const Icon = activity.icon;
  
  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-900">
          <span className="font-medium">{activity.action}</span>
          <span className="ml-1">{activity.subject}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  color 
}: { 
  title: string; 
  description: string; 
  icon: React.ComponentType<{ className?: string }>; 
  href: string; 
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 group-hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100',
  };

  return (
    <Link
      href={href}
      className="group p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}

export default withAuth(DashboardPage);
'use client';

import { useState, useEffect } from 'react';
import { withClientAuth } from '@/context/AuthContext';
import { ClientDashboardService, ClientProfile, ClientDashboardStats } from '@/services/clientDashboard';
import WeeklyExerciseView from '@/components/clients/WeeklyExerciseView';

function ClientDashboard() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [stats, setStats] = useState<ClientDashboardStats | null>(null);
  const [programs, setPrograms] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'exercises'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, statsRes, programsRes] = await Promise.all([
          ClientDashboardService.getClientProfile(),
          ClientDashboardService.getDashboardStats(),
          ClientDashboardService.getClientPrograms()
        ]);

        if (profileRes.success) setProfile(profileRes.data);
        if (statsRes.success) setStats(statsRes.data);
        if (programsRes.success) setPrograms(programsRes.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.user_info.first_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Your personal fitness dashboard
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'exercises'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Weekly Exercises
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <>
            {/* Quick Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Profile Complete</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.profile_completion.percentage}%
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      👤
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Programs</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.program_stats.active_programs}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      🏋️
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Workouts Done</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.program_stats.completed_workouts}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      ✅
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Streak</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.program_stats.current_streak} days
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      🔥
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Programs Section */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">My Programs</h2>
                      <button
                        onClick={() => setActiveTab('exercises')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View Weekly Exercises →
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    {programs?.assigned_programs.length > 0 ? (
                      <div className="space-y-4">
                        {programs.assigned_programs.map((program: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h3 className="font-medium text-gray-900">{program.name}</h3>
                            <p className="text-gray-600 text-sm">{program.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-4">📋</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No programs assigned yet</h3>
                        <p className="text-gray-600">{programs?.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Health Metrics */}
                {stats?.health_metrics && (
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Health Metrics</h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {stats.health_metrics.weight && (
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-gray-900">
                              {stats.health_metrics.weight} kg
                            </p>
                            <p className="text-sm text-gray-600">Weight</p>
                          </div>
                        )}
                        {stats.health_metrics.bmi && (
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-gray-900">
                              {stats.health_metrics.bmi}
                            </p>
                            <p className="text-sm text-gray-600">BMI</p>
                          </div>
                        )}
                        {stats.health_metrics.body_fat_percentage && (
                          <div className="text-center">
                            <p className="text-2xl font-semibold text-gray-900">
                              {stats.health_metrics.body_fat_percentage}%
                            </p>
                            <p className="text-sm text-gray-600">Body Fat</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Trainer Info */}
                {profile?.trainer_info && (
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Your Trainer</h2>
                    </div>
                    <div className="p-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl">👨‍⚕️</span>
                        </div>
                        <h3 className="font-medium text-gray-900">{profile.trainer_info.name}</h3>
                        <p className="text-gray-600 text-sm">{profile.trainer_info.email}</p>
                        {profile.trainer_info.specialization && (
                          <p className="text-gray-500 text-sm mt-1">
                            Specialization: {profile.trainer_info.specialization}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Profile Completion */}
                {stats?.profile_completion && stats.profile_completion.percentage < 100 && (
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Complete Your Profile</h2>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{stats.profile_completion.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${stats.profile_completion.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Complete these fields for better program recommendations:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {stats.profile_completion.missing_fields.map((field, index) => (
                          <li key={index} className="flex items-center">
                            <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                            {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Weekly Exercises Tab */
          <div className="max-w-6xl mx-auto">
            <WeeklyExerciseView clientId={profile?.client_info.id || 0} />
          </div>
        )}
      </div>
    </div>
  );
}

export default withClientAuth(ClientDashboard);

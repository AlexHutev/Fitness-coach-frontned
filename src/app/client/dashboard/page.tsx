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
        console.log('🚀 Starting client dashboard data fetch...');
        
        // Fetch profile data
        try {
          console.log('📱 Fetching profile...');
          const profileRes = await ClientDashboardService.getClientProfile();
          console.log('📱 Profile response:', profileRes);
          if (profileRes.data) {
            setProfile(profileRes.data);
            console.log('✅ Profile set successfully:', profileRes.data);
          } else {
            console.log('❌ Profile response has no data:', profileRes);
          }
        } catch (err) {
          console.error('❌ Profile fetch error:', err);
        }
        
        // Fetch programs data  
        try {
          console.log('📚 Fetching programs...');
          const programsRes = await ClientDashboardService.getClientPrograms();
          console.log('📚 Programs response:', programsRes);
          if (programsRes.data) {
            setPrograms(programsRes.data);
            console.log('✅ Programs set successfully:', programsRes.data);
            console.log('📊 Programs.assigned_programs:', programsRes.data.assigned_programs);
            console.log('📊 Programs.assigned_programs.length:', programsRes.data.assigned_programs?.length);
          } else {
            console.log('❌ Programs response has no data:', programsRes);
          }
        } catch (err) {
          console.error('❌ Programs fetch error:', err);
        }
        
        // Fetch stats data (optional - don't fail if this doesn't work)
        try {
          console.log('📈 Fetching stats...');
          const statsRes = await ClientDashboardService.getDashboardStats();
          console.log('📈 Stats response:', statsRes);
          if (statsRes.data) {
            setStats(statsRes.data);
            console.log('✅ Stats set successfully:', statsRes.data);
          } else {
            console.log('⚠️ Stats response has no data, using defaults');
            // Set default stats so the page still works
            setStats({
              profile_completion: { percentage: 50, missing_fields: [] },
              health_metrics: {},
              program_stats: { active_programs: 0, completed_workouts: 0, current_streak: 0 }
            });
          }
        } catch (err) {
          console.error('⚠️ Stats fetch error (non-critical):', err);
          // Set default stats so the page still works
          setStats({
            profile_completion: { percentage: 50, missing_fields: [] },
            health_metrics: {},
            program_stats: { active_programs: 0, completed_workouts: 0, current_streak: 0 }
          });
        }
        
        console.log('🏁 Data fetch complete');
        
      } catch (err) {
        console.error('💥 General dashboard error:', err);
        setError('Failed to load some dashboard data');
      } finally {
        setLoading(false);
        console.log('🔄 Loading set to false');
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

                    
                    {programs?.assigned_programs && programs.assigned_programs.length > 0 ? (
                      <div className="space-y-4">
                        {programs.assigned_programs.map((program: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium text-gray-900">{program.program_name}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                program.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {program.status}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{program.program_description}</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Type:</span> {program.program_type}
                              </div>
                              <div>
                                <span className="text-gray-500">Difficulty:</span> {program.difficulty_level}
                              </div>
                              <div>
                                <span className="text-gray-500">Duration:</span> {program.duration_weeks} weeks
                              </div>
                              <div>
                                <span className="text-gray-500">Progress:</span> {program.completion_percentage}%
                              </div>
                            </div>
                            {program.workout_structure && program.workout_structure.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-sm text-gray-600">
                                  {program.workout_structure.length} workout days scheduled
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-gray-400 text-4xl mb-4">📋</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No programs assigned yet</h3>
                        <p className="text-gray-600">Your trainer hasn't assigned any programs to you yet.</p>
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


              </div>
            </div>
          </>
        ) : (
          /* Weekly Exercises Tab */
          <div className="max-w-6xl mx-auto">
            <WeeklyExerciseView 
              clientId={profile?.client_info.id || 0} 
              assignedPrograms={programs?.assigned_programs || []}
              refreshData={async () => {
                const programsRes = await ClientDashboardService.getClientPrograms();
                if (programsRes.success) setPrograms(programsRes.data);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default withClientAuth(ClientDashboard);

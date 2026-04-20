'use client';

import { useState, useEffect } from 'react';
import { withClientAuth } from '@/context/AuthContext';
import { ClientDashboardService, ClientProfile, ClientDashboardStats } from '@/services/clientDashboard';
import WeeklyExerciseView from '@/components/clients/WeeklyExerciseView';
import BodyMetricsProgress from '@/components/clients/BodyMetricsProgress';
import WorkoutCompletionStats from '@/components/clients/WorkoutCompletionStats';
import PerformancePRs from '@/components/clients/PerformancePRs';
import GoalMilestones from '@/components/clients/GoalMilestones';
import SessionNotes from '@/components/clients/SessionNotes';

import { Calendar, Clock, MapPin } from 'lucide-react';

function ClientDashboard() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [stats, setStats] = useState<ClientDashboardStats | null>(null);
  const [programs, setPrograms] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'progress' | 'exercises'>('overview');

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
        
        // Fetch appointments
        try {
          const apptRes = await ClientDashboardService.getMyAppointments();
          if (apptRes.data) {
            setAppointments(apptRes.data);
          }
        } catch (err) {
          console.error('⚠️ Appointments fetch error (non-critical):', err);
        }
        
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
              onClick={() => setActiveTab('schedule')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'schedule'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Schedule
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Progress
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
        ) : activeTab === 'schedule' ? (
          /* Schedule Tab */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                My Appointments
              </h2>

              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No appointments scheduled</p>
                  <p className="text-gray-400 text-sm mt-1">Your trainer will schedule sessions with you.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments
                    .sort((a: any, b: any) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .map((appt: any) => {
                      const isPast = new Date(appt.end_time) < new Date();
                      const statusColors: Record<string, string> = {
                        confirmed: 'bg-green-100 text-green-800',
                        scheduled: 'bg-blue-100 text-blue-800',
                        pending:   'bg-yellow-100 text-yellow-800',
                        completed: 'bg-gray-100 text-gray-700',
                        cancelled: 'bg-red-100 text-red-700',
                      };
                      return (
                        <div
                          key={appt.id}
                          className={`rounded-xl border p-5 transition-opacity ${isPast ? 'opacity-60 border-gray-100' : 'border-gray-200 hover:shadow-sm'}`}
                        >
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                <h3 className="font-semibold text-gray-900">{appt.title}</h3>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[appt.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                  {appt.status}
                                </span>
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                  {appt.appointment_type}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(appt.start_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {new Date(appt.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                  {' — '}
                                  {new Date(appt.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
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
                                <p className="mt-2 text-sm text-gray-500 italic">{appt.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'progress' ? (
          /* Progress Tab */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <GoalMilestones clientId={profile?.client_info.id || 0} isTrainerView={false} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <WorkoutCompletionStats clientId={profile?.client_info.id || 0} isTrainerView={false} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <BodyMetricsProgress clientId={profile?.client_info.id || 0} isTrainerView={false} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <PerformancePRs clientId={profile?.client_info.id || 0} isTrainerView={false} />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <SessionNotes clientId={profile?.client_info.id || 0} isTrainerView={false} />
            </div>
          </div>
        ) : (
          /* Weekly Exercises Tab */
          <div className="max-w-6xl mx-auto">
            <WeeklyExerciseView 
              clientId={profile?.client_info.id || 0} 
              assignedPrograms={programs?.assigned_programs || []}
              isTrainerView={false}
              refreshData={async () => {
                const programsRes = await ClientDashboardService.getClientPrograms();
                if (programsRes.data) setPrograms(programsRes.data);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default withClientAuth(ClientDashboard);

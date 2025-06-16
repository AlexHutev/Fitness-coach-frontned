'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { withAuth } from '@/context/AuthContext';
import { ClientService } from '@/services/clients';
import type { Client } from '@/types/api';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone,
  Calendar,
  Ruler,
  Scale,
  Target,
  Activity,
  Heart,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  MessageSquare,
  Plus
} from 'lucide-react';

function ClientDetailPage() {
  const params = useParams();
  const clientId = parseInt(params.id as string);
  
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadClient = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ClientService.getClientById(clientId);
        
        if (response.error) {
          setError(response.error);
        } else if (response.data) {
          setClient(response.data);
        }
      } catch (err) {
        setError('Failed to load client details. Please try again.');
        console.error('Error loading client:', err);
      } finally {
        setLoading(false);
      }
    };

    if (clientId) {
      loadClient();
    }
  }, [clientId]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatGoal = (goal: string | undefined) => {
    if (!goal) return 'Not specified';
    return goal.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatActivityLevel = (level: string | undefined) => {
    if (!level) return 'Not specified';
    return level.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = (height: number | undefined, weight: number | undefined) => {
    if (!height || !weight) return null;
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Error Loading Client</h2>
          <p className="text-gray-600 mb-6">{error || 'Client not found'}</p>
          <Link href="/clients" className="btn-primary">
            Back to Clients
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'programs', label: 'Programs', icon: Target },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'notes', label: 'Notes', icon: MessageSquare }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/clients"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Clients
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
            <div className="flex items-start space-x-6 mb-6 lg:mb-0">
              {/* Avatar */}
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                {client.first_name.charAt(0)}{client.last_name.charAt(0)}
              </div>
              
              {/* Basic Info */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {client.first_name} {client.last_name}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    client.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {client.is_active ? 'Active Client' : 'Inactive Client'}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Client since {formatDate(client.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3">
              <button className="btn-secondary inline-flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Assign Program</span>
              </button>
              <Link
                href={`/clients/${client.id}/edit`}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Client</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Contact Information
              </h3>
              <div className="space-y-3">
                {client.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-900">{client.email}</span>
                  </div>
                )}
                {client.phone_number && (
                  <div className="flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-900">{client.phone_number}</span>
                  </div>
                )}
                {client.date_of_birth && (
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-900">
                      {formatDate(client.date_of_birth)} 
                      {calculateAge(client.date_of_birth) && (
                        <span className="text-gray-500 ml-1">
                          (Age {calculateAge(client.date_of_birth)})
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {client.gender && (
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-900 capitalize">{client.gender}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Physical Stats */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Scale className="w-5 h-5 mr-2 text-green-600" />
                Physical Statistics
              </h3>
              <div className="space-y-4">
                {client.height && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Height</span>
                    <span className="font-semibold text-gray-900">{client.height} cm</span>
                  </div>
                )}
                {client.weight && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Weight</span>
                    <span className="font-semibold text-gray-900">{client.weight} kg</span>
                  </div>
                )}
                {client.height && client.weight && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">BMI</span>
                    <span className="font-semibold text-gray-900">
                      {calculateBMI(client.height, client.weight)}
                    </span>
                  </div>
                )}
                {client.body_fat_percentage && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Body Fat</span>
                    <span className="font-semibold text-gray-900">{client.body_fat_percentage}%</span>
                  </div>
                )}
                {client.activity_level && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Activity Level</span>
                    <span className="font-semibold text-gray-900 text-xs">
                      {formatActivityLevel(client.activity_level)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* Goals & Health */}
            <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-purple-600" />
                Goals & Health
              </h3>
              <div className="space-y-4">
                {client.primary_goal && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Primary Goal</span>
                    <span className="font-semibold text-gray-900">{formatGoal(client.primary_goal)}</span>
                  </div>
                )}
                {client.secondary_goals && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Secondary Goals</span>
                    <p className="text-sm text-gray-900">{client.secondary_goals}</p>
                  </div>
                )}
                {client.medical_conditions && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Medical Conditions</span>
                    <p className="text-sm text-gray-900">{client.medical_conditions}</p>
                  </div>
                )}
                {client.injuries && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">Injuries/Limitations</span>
                    <p className="text-sm text-gray-900">{client.injuries}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            {(client.emergency_contact_name || client.emergency_contact_phone) && (
              <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 lg:col-span-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-600" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.emergency_contact_name && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Contact Name</span>
                      <span className="font-semibold text-gray-900">{client.emergency_contact_name}</span>
                    </div>
                  )}
                  {client.emergency_contact_phone && (
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Contact Phone</span>
                      <span className="font-semibold text-gray-900">{client.emergency_contact_phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {client.notes && (
              <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 lg:col-span-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                  Additional Notes
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Programs Assigned</h3>
              <p className="text-gray-600 mb-6">
                This client doesn't have any training programs assigned yet.
              </p>
              <button className="btn-primary inline-flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Assign Program</span>
              </button>
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Progress Data</h3>
              <p className="text-gray-600 mb-6">
                Start tracking this client's progress by recording measurements and workout data.
              </p>
              <button className="btn-primary inline-flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Progress Entry</span>
              </button>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-xl shadow-card p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Session Notes</h3>
              <button className="btn-primary inline-flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Add Note</span>
              </button>
            </div>
            
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Session Notes</h3>
              <p className="text-gray-600">
                Keep track of session notes, observations, and important reminders.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ClientDetailPage);
'use client';

import { useState } from 'react';
import { ClientService } from '@/services/clients';
import type { CreateClientRequest } from '@/types/api';
import { User, Mail, Lock, CheckCircle, AlertCircle, Copy } from 'lucide-react';

interface CreateClientAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (clientData: any) => void;
}

export default function CreateClientAccountModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateClientAccountModalProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountInfo, setAccountInfo] = useState<{
    email: string;
    password: string;
    clientName: string;
  } | null>(null);
  
  const [formData, setFormData] = useState<CreateClientRequest>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    height: undefined,
    weight: undefined,
    activity_level: undefined,
    primary_goal: undefined,
  });

  const [passwordOption, setPasswordOption] = useState<'generate' | 'custom'>('generate');
  const [customPassword, setCustomPassword] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const requestData = {
        ...formData,
        custom_password: passwordOption === 'custom' ? customPassword : undefined
      };
      
      const response = await ClientService.createClientWithAccount(requestData);
      
      if (response.success) {
        setAccountInfo({
          email: response.data.user_account.email,
          password: response.data.user_account.temporary_password,
          clientName: `${formData.first_name} ${formData.last_name}`
        });
        setStep('success');
        onSuccess(response.data);
      } else {
        setError('Failed to create client account');
      }
    } catch (err: any) {
      console.error('Error creating client account:', err);
      
      // Handle specific error cases
      let errorMessage = 'Failed to create client account';
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        
        if (detail.includes('UNIQUE constraint failed: users.email')) {
          errorMessage = `The email address "${formData.email}" is already registered. Please use a different email address.`;
        } else if (detail.includes('IntegrityError')) {
          errorMessage = 'This email address is already in use. Please choose a different one.';
        } else {
          errorMessage = detail;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      height: undefined,
      weight: undefined,
      activity_level: undefined,
      primary_goal: undefined,
    });
    setPasswordOption('generate');
    setCustomPassword('');
    setAccountInfo(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {step === 'form' ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Create Client Account
              </h2>
              <p className="text-gray-600 mt-1">
                Create a new client profile with login credentials
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Password Setup
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="passwordOption"
                        value="generate"
                        checked={passwordOption === 'generate'}
                        onChange={(e) => setPasswordOption(e.target.value as 'generate')}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Generate temporary password automatically</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="passwordOption"
                        value="custom"
                        checked={passwordOption === 'custom'}
                        onChange={(e) => setPasswordOption(e.target.value as 'custom')}
                        className="mr-3"
                      />
                      <span className="text-sm text-gray-700">Set custom password</span>
                    </label>
                  </div>
                </div>

                {passwordOption === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Password *
                    </label>
                    <input
                      type="password"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      placeholder="Enter password for client"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                )}
              </div>

              {/* Physical Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height || ''}
                    onChange={handleInputChange}
                    min="50"
                    max="300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight || ''}
                    onChange={handleInputChange}
                    min="20"
                    max="500"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Fitness Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Level
                  </label>
                  <select
                    name="activity_level"
                    value={formData.activity_level || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select activity level</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly_active">Lightly Active</option>
                    <option value="moderately_active">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                    <option value="extremely_active">Extremely Active</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Goal
                  </label>
                  <select
                    name="primary_goal"
                    value={formData.primary_goal || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select primary goal</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="weight_gain">Weight Gain</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="endurance">Endurance</option>
                    <option value="strength">Strength</option>
                    <option value="general_fitness">General Fitness</option>
                    <option value="rehabilitation">Rehabilitation</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.first_name || !formData.last_name || !formData.email || (passwordOption === 'custom' && (!customPassword || customPassword.length < 6))}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <User className="w-4 h-4 mr-2" />
                  )}
                  Create Account
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Success Screen */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-green-600 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Account Created Successfully!
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-700">
                  Account created for <strong>{accountInfo?.clientName}</strong>
                </p>
              </div>

              {/* Login Credentials */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-medium text-gray-900 mb-3">Login Credentials</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">Email:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{accountInfo?.email}</span>
                      <button
                        onClick={() => copyToClipboard(accountInfo?.email || '')}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center">
                      <Lock className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">
                        {passwordOption === 'custom' ? 'Custom Password:' : 'Temporary Password:'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm bg-yellow-100 px-2 py-1 rounded">
                        {accountInfo?.password}
                      </span>
                      <button
                        onClick={() => copyToClipboard(accountInfo?.password || '')}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> Share these credentials with your client. 
                    {passwordOption === 'custom' 
                      ? ' They can log in immediately with this password.'
                      : ' They should change their password on first login.'
                    }
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

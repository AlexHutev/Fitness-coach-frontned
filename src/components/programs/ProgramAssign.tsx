'use client';

import React, { useState, useEffect } from 'react';
import { ProgramService } from '@/services/programs';
import { ClientService } from '@/services/clients';
import { ProgramAssignmentService } from '@/services/program-assignments';
import { ProgramList, ClientSummary } from '@/types/api';

interface ProgramAssignProps {
  onAssignmentComplete?: () => void;
  preselectedProgramId?: number;
  preselectedClientIds?: number[];
}

export default function ProgramAssign({ 
  onAssignmentComplete,
  preselectedProgramId,
  preselectedClientIds = []
}: ProgramAssignProps) {
  const [programs, setPrograms] = useState<ProgramList[]>([]);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(preselectedProgramId || null);
  const [selectedClientIds, setSelectedClientIds] = useState<number[]>(preselectedClientIds);
  const [startDate, setStartDate] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Load programs and clients on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Initialize pre-selected clients when component mounts or preselected changes
  useEffect(() => {
    if (preselectedClientIds.length > 0) {
      setSelectedClientIds(preselectedClientIds);
    }
  }, [preselectedClientIds]);

  const loadData = async () => {
    setIsLoading(true);
    setError(''); // Clear any previous errors
    try {
      const [programsData, clientsData] = await Promise.all([
        ProgramService.getPrograms({ is_template: true }),
        ClientService.getClients()
      ]);
      
      // Handle programs response  
      setPrograms(Array.isArray(programsData) ? programsData : []);
      
      // Handle clients response
      if (Array.isArray(clientsData)) {
        const activeClients = clientsData.filter(client => client.is_active);
        setClients(activeClients);
      } else {
        console.error('Unexpected clients response format:', clientsData);
        setClients([]);
      }
      
    } catch (err) {
      // Ensure error is properly converted to string
      const errorMessage = err instanceof Error ? err.message : 
                          typeof err === 'string' ? err : 
                          'Failed to load data';
      setError(errorMessage);
      setPrograms([]);
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClientToggle = (clientId: number) => {
    setSelectedClientIds(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleAssign = async () => {
    if (!selectedProgramId || selectedClientIds.length === 0) {
      setError('Please select a program and at least one client');
      return;
    }

    setIsAssigning(true);
    setError(''); // Clear any previous errors

    try {
      const assignments = await ProgramAssignmentService.assignProgram(
        selectedProgramId,
        selectedClientIds,
        startDate || undefined,
        customNotes || undefined
      );

      // Check if any assignments were actually created
      if (!assignments || assignments.length === 0) {
        setError('No assignments were created. The selected clients may already have active program assignments.');
        setIsAssigning(false);
        return;
      }

      // Show success message
      const clientNames = selectedClientIds.map(id => {
        const client = clients.find(c => c.id === id);
        return client ? `${client.first_name} ${client.last_name}` : `Client ${id}`;
      }).join(', ');
      
      alert(`Successfully assigned program to: ${clientNames}`);

      // Reset form
      setSelectedProgramId(preselectedProgramId || null);
      setSelectedClientIds(preselectedClientIds);
      setStartDate('');
      setCustomNotes('');

      if (onAssignmentComplete) {
        onAssignmentComplete();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
                          typeof err === 'string' ? err : 
                          'Failed to assign program. Please try again.';
      setError(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Program to Clients</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Program Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Program
          </label>
          <select
            value={selectedProgramId || ''}
            onChange={(e) => setSelectedProgramId(Number(e.target.value) || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!!preselectedProgramId}
          >
            <option value="">Choose a program...</option>
            {programs.map(program => (
              <option key={program.id} value={program.id}>
                {program.name} ({program.program_type} - {program.difficulty_level})
              </option>
            ))}
          </select>
        </div>

        {/* Client Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Clients
            {preselectedClientIds.length > 0 && (
              <span className="ml-2 text-sm text-blue-600 font-normal">
                (Client pre-selected from client page)
              </span>
            )}
          </label>
          <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
            {clients.length === 0 ? (
              <p className="p-4 text-gray-500">No active clients found</p>
            ) : (
              clients.map(client => (
                <div key={client.id} className="flex items-center p-3 border-b border-gray-100">
                  <input
                    type="checkbox"
                    id={`client-${client.id}`}
                    checked={selectedClientIds.includes(client.id)}
                    onChange={() => handleClientToggle(client.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`client-${client.id}`}
                    className="ml-3 flex-1 cursor-pointer"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {client.first_name} {client.last_name}
                    </div>
                    {client.email && (
                      <div className="text-xs text-gray-500">{client.email}</div>
                    )}
                  </label>
                </div>
              ))
            )}
          </div>
          {selectedClientIds.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {selectedClientIds.length} client(s) selected
            </p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date (Optional)
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Custom Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Notes (Optional)
          </label>
          <textarea
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any specific instructions or modifications for this assignment..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => {
              setSelectedProgramId(preselectedProgramId || null);
              setSelectedClientIds(preselectedClientIds);
              setStartDate('');
              setCustomNotes('');
              setError('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedProgramId || selectedClientIds.length === 0 || isAssigning}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAssigning ? 'Assigning...' : 'Assign Program'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { withTrainerAuth } from '@/context/AuthContext';
import { ClientService } from '@/services/clients';
import type { ClientSummary } from '@/types/api';
import CreateClientAccountModal from '@/components/clients/CreateClientAccountModal';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  MoreHorizontal,
  UserPlus,
  Activity,
  AlertCircle,
  ChevronDown,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';
import { ClientFilters } from '@/components/clients/ClientFilters';
import { ClientCard } from '@/components/clients/ClientCard';

function ClientsPage() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    activeOnly: true,
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 20,
    total: 0
  });

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const clientData = await ClientService.getClients({
        skip: pagination.skip,
        limit: pagination.limit,
        active_only: filters.activeOnly,
        search: searchTerm || undefined
      });

      setClients(Array.isArray(clientData) ? clientData : []);
    } catch (err) {
      setError('Failed to load clients. Please try again.');
      console.error('Error loading clients:', err);
      setClients([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [searchTerm, filters, pagination.skip]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, skip: 0 }));
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, skip: 0 }));
  };

  const filteredAndSortedClients = [...clients].sort((a, b) => {
    const aValue = a[filters.sortBy as keyof ClientSummary] || '';
    const bValue = b[filters.sortBy as keyof ClientSummary] || '';
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <Users className="w-10 h-10 mr-4 text-blue-600" />
                Clients
              </h1>
              <p className="text-gray-600 text-lg">
                Manage your client roster and track their fitness journeys.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Create Client Account</span>
              </button>
              <Link
                href="/clients/create"
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Add Client Info Only</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-card p-6 border border-gray-100 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary inline-flex items-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <ClientFilters 
                filters={filters} 
                onFiltersChange={handleFilterChange}
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
            <button
              onClick={loadClients}
              className="ml-auto text-red-600 hover:text-red-700 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Clients List */}
        {filteredAndSortedClients.length === 0 ? (
          <EmptyState searchTerm={searchTerm} />
        ) : (
          <>
            {/* Stats Bar */}
            <div className="mb-6 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredAndSortedClients.length} client{filteredAndSortedClients.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center space-x-4">
                <span>Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-1"
                >
                  <option value="created_at">Date Added</option>
                  <option value="first_name">Name</option>
                  <option value="primary_goal">Goal</option>
                </select>
                <button
                  onClick={() => handleFilterChange({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {filters.sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedClients.map((client) => (
                <ClientCard 
                  key={client.id} 
                  client={client} 
                  onUpdate={loadClients}
                />
              ))}
            </div>

            {/* Load More */}
            {clients.length >= pagination.limit && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, skip: prev.skip + prev.limit }))}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? 'Loading...' : 'Load More Clients'}
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Client Account Modal */}
        <CreateClientAccountModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(clientData) => {
            setShowCreateModal(false);
            loadClients(); // Refresh the client list
          }}
        />
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ searchTerm }: { searchTerm: string }) {
  if (searchTerm) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients found</h3>
        <p className="text-gray-600 mb-6">
          No clients match your search criteria "{searchTerm}"
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients yet</h3>
      <p className="text-gray-600 mb-6">
        Get started by adding your first client to begin tracking their fitness journey.
      </p>
      <Link href="/clients/create" className="btn-primary inline-flex items-center space-x-2">
        <UserPlus className="w-5 h-5" />
        <span>Add Your First Client</span>
      </Link>
    </div>
  );
}

export default withTrainerAuth(ClientsPage);
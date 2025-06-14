// Client management service for API calls

import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  Client,
  ClientSummary,
  CreateClientRequest,
} from '@/types/api';

export interface GetClientsParams {
  skip?: number;
  limit?: number;
  active_only?: boolean;
  search?: string;
}

export class ClientService {
  /**
   * Get all clients for current trainer
   */
  static async getClients(params: GetClientsParams = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.active_only !== undefined) queryParams.append('active_only', params.active_only.toString());
    if (params.search) queryParams.append('search', params.search);

    const endpoint = `${API_ENDPOINTS.CLIENTS}?${queryParams.toString()}`;
    const response = await apiClient.get<ClientSummary[]>(endpoint);
    return response;
  }

  /**
   * Get client by ID
   */
  static async getClientById(clientId: number) {
    const response = await apiClient.get<Client>(
      API_ENDPOINTS.CLIENT_BY_ID(clientId)
    );
    return response;
  }

  /**
   * Create new client
   */
  static async createClient(clientData: CreateClientRequest) {
    const response = await apiClient.post<Client>(
      API_ENDPOINTS.CLIENTS,
      clientData
    );
    return response;
  }

  /**
   * Update client
   */
  static async updateClient(clientId: number, clientData: Partial<CreateClientRequest>) {
    const response = await apiClient.put<Client>(
      API_ENDPOINTS.CLIENT_BY_ID(clientId),
      clientData
    );
    return response;
  }

  /**
   * Delete client (soft delete)
   */
  static async deleteClient(clientId: number) {
    const response = await apiClient.delete(
      API_ENDPOINTS.CLIENT_BY_ID(clientId)
    );
    return response;
  }

  /**
   * Get client count
   */
  static async getClientCount(activeOnly: boolean = true) {
    const queryParams = new URLSearchParams();
    queryParams.append('active_only', activeOnly.toString());

    const endpoint = `${API_ENDPOINTS.CLIENT_COUNT}?${queryParams.toString()}`;
    const response = await apiClient.get<{ count: number }>(endpoint);
    return response;
  }
}

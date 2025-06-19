// Client management service for API calls

import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type {
  Client,
  ClientSummary,
  CreateClientRequest,
  CreateClientAccountRequest,
  ClientAccountCreationResponse,
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
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || [];
  }

  /**
   * Get client by ID
   */
  static async getClientById(clientId: number) {
    const response = await apiClient.get<Client>(
      API_ENDPOINTS.CLIENT_BY_ID(clientId)
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Create new client with login account
   */
  static async createClientWithAccount(clientData: CreateClientRequest) {
    const response = await apiClient.post<ClientAccountCreationResponse>(
      `${API_ENDPOINTS.CLIENTS}/with-account`,
      clientData
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Create login account for existing client
   */
  static async createAccountForClient(clientId: number, accountData: CreateClientAccountRequest) {
    const response = await apiClient.post<{
      user_account: {
        id: number;
        email: string;
        temporary_password: string;
      };
      message: string;
    }>(
      `${API_ENDPOINTS.CLIENTS}/${clientId}/create-account`,
      accountData
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Create new client
   */
  static async createClient(clientData: CreateClientRequest) {
    const response = await apiClient.post<Client>(
      API_ENDPOINTS.CLIENTS,
      clientData
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Update client
   */
  static async updateClient(clientId: number, clientData: Partial<CreateClientRequest>) {
    const response = await apiClient.put<Client>(
      API_ENDPOINTS.CLIENT_BY_ID(clientId),
      clientData
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Delete client (soft delete)
   */
  static async deleteClient(clientId: number) {
    const response = await apiClient.delete(
      API_ENDPOINTS.CLIENT_BY_ID(clientId)
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }

  /**
   * Get client count
   */
  static async getClientCount(activeOnly: boolean = true) {
    const queryParams = new URLSearchParams();
    queryParams.append('active_only', activeOnly.toString());

    const endpoint = `${API_ENDPOINTS.CLIENT_COUNT}?${queryParams.toString()}`;
    const response = await apiClient.get<{ count: number }>(endpoint);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data;
  }
}

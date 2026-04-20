import { apiClient } from '@/lib/api';

export interface SessionNote {
  id: number;
  client_id: number;
  trainer_id: number;
  appointment_id?: number;
  note_date: string;
  title?: string;
  content: string;
  is_private: boolean;
}

export interface NoteCreate {
  note_date: string;
  title?: string;
  content: string;
  is_private: boolean;
  appointment_id?: number;
}

function unwrap<T>(res: { data?: T; error?: string; status: number }): T {
  if (res.error || res.data === undefined) throw new Error(res.error || 'Request failed');
  return res.data;
}

export class SessionNoteService {
  static async getNotes(clientId: number): Promise<SessionNote[]> {
    const res = await apiClient.get<SessionNote[]>(`/api/v1/progress/clients/${clientId}/notes`);
    return unwrap(res);
  }

  static async createNote(clientId: number, data: NoteCreate): Promise<SessionNote> {
    const res = await apiClient.post<SessionNote>(`/api/v1/progress/clients/${clientId}/notes`, data);
    return unwrap(res);
  }

  static async updateNote(clientId: number, noteId: number, data: Partial<NoteCreate>): Promise<SessionNote> {
    const res = await apiClient.put<SessionNote>(`/api/v1/progress/clients/${clientId}/notes/${noteId}`, data);
    return unwrap(res);
  }

  static async deleteNote(clientId: number, noteId: number): Promise<void> {
    await apiClient.delete(`/api/v1/progress/clients/${clientId}/notes/${noteId}`);
  }

  static async getMyNotes(): Promise<SessionNote[]> {
    const res = await apiClient.get<SessionNote[]>('/api/v1/progress/my/notes');
    return unwrap(res);
  }
}

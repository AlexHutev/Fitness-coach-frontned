'use client';

import { useState, useEffect } from 'react';
import { SessionNoteService, SessionNote, NoteCreate } from '@/services/sessionNotes';
import { MessageSquare, Plus, Trash2, Edit2, X, Check, Lock, Unlock } from 'lucide-react';

interface Props { clientId: number; isTrainerView?: boolean; }

const EMPTY_FORM: NoteCreate = {
  note_date: new Date().toISOString().slice(0, 10),
  title: '', content: '', is_private: false,
};

export default function SessionNotes({ clientId, isTrainerView = true }: Props) {
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<NoteCreate>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => { load(); }, [clientId]);

  const load = async () => {
    try {
      setLoading(true);
      const data = isTrainerView
        ? await SessionNoteService.getNotes(clientId)
        : await SessionNoteService.getMyNotes();
      setNotes(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.content.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, title: form.title || undefined };
      if (editingId) {
        await SessionNoteService.updateNote(clientId, editingId, payload);
      } else {
        await SessionNoteService.createNote(clientId, payload);
      }
      await load();
      setShowForm(false); setEditingId(null); setForm(EMPTY_FORM);
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleEdit = (n: SessionNote) => {
    setForm({ note_date: n.note_date, title: n.title ?? '', content: n.content, is_private: n.is_private });
    setEditingId(n.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this note?')) return;
    await SessionNoteService.deleteNote(clientId, id);
    await load();
  };

  if (loading) return (
    <div className="animate-pulse space-y-3">
      {[1,2].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl"/>)}
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" /> Session Notes
          {!isTrainerView && <span className="text-xs font-normal text-gray-400">(shared notes only)</span>}
        </h3>
        {isTrainerView && (
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Note
          </button>
        )}
      </div>

      {/* Empty */}
      {notes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-1">No session notes yet</p>
          <p className="text-gray-400 text-sm mb-5">
            {isTrainerView ? 'Add notes to track observations between sessions.' : 'Your trainer will add shared notes here.'}
          </p>
          {isTrainerView && (
            <button onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              <Plus className="w-4 h-4" /> Add First Note
            </button>
          )}
        </div>
      )}

      {/* Note list — chronological timeline */}
      <div className="space-y-3">
        {notes.map(n => {
          const isExpanded = expandedId === n.id;
          const preview = n.content.length > 120 ? n.content.slice(0, 120) + '…' : n.content;
          return (
            <div key={n.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button onClick={() => setExpandedId(isExpanded ? null : n.id)}
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-medium text-gray-400">
                        {new Date(n.note_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {n.is_private && isTrainerView && (
                        <span className="inline-flex items-center gap-1 text-xs text-orange-500 font-medium">
                          <Lock className="w-3 h-3" /> Private
                        </span>
                      )}
                    </div>
                    {n.title && <p className="font-semibold text-gray-900 text-sm">{n.title}</p>}
                    <p className="text-sm text-gray-600 mt-0.5">{isExpanded ? n.content : preview}</p>
                  </div>
                  {isTrainerView && (
                    <div className="flex gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleEdit(n)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(n.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Create/Edit modal */}
      {showForm && isTrainerView && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{editingId ? 'Edit Note' : 'Add Note'}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={form.note_date}
                    onChange={e => setForm(f => ({ ...f, note_date: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={form.title ?? ''} placeholder="Optional title..."
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note *</label>
                <textarea rows={5} value={form.content} placeholder="Session observations, progress notes, plans..."
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.is_private}
                  onChange={e => setForm(f => ({ ...f, is_private: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-gray-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-orange-400" /> Private (only visible to you, not the client)
                </span>
              </label>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={() => { setShowForm(false); setEditingId(null); }}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.content.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                {saving
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />Saving...</>
                  : <><Check className="w-4 h-4" />{editingId ? 'Update' : 'Save Note'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

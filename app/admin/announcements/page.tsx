'use client';

import { useEffect, useState } from 'react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);

  const fetchItems = () => {
    fetch('/api/announcements').then(r => r.json()).then(setItems);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setShowModal(false);
    setForm({ title: '', content: '' });
    fetchItems();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    await fetch('/api/announcements', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchItems();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">Pengumuman</h1>
          <p className="text-slate-500 mt-1">Kelola pengumuman untuk siswa</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <span>+</span> Buat Pengumuman
        </button>
      </div>

      <div className="grid gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-lg font-display">{item.title}</h3>
                <p className="text-slate-500 text-sm mt-1">
                  Oleh {item.author} · {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="text-slate-600 mt-3 leading-relaxed">{item.content}</p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="ml-4 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0"
              >
                🗑️ Hapus
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">
            Belum ada pengumuman.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-slate-800 font-display mb-5">Buat Pengumuman</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Judul pengumuman..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Isi Pengumuman</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm({ ...form, content: e.target.value })}
                  required
                  rows={5}
                  placeholder="Tulis isi pengumuman di sini..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 font-medium text-sm hover:bg-slate-50 transition">
                  Batal
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 font-medium text-sm transition disabled:opacity-60">
                  {loading ? 'Menyimpan...' : 'Publikasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

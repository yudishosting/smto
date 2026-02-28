'use client';

import { useEffect, useState } from 'react';

interface Activity {
  id: number;
  title: string;
  description: string;
  date: string;
  author: string;
  created_at: string;
}

export default function AdminActivities() {
  const [items, setItems] = useState<Activity[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', date: '' });
  const [loading, setLoading] = useState(false);

  const fetchItems = () => {
    fetch('/api/activities').then(r => r.json()).then(setItems);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setShowModal(false);
    setForm({ title: '', description: '', date: '' });
    fetchItems();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus kegiatan ini?')) return;
    await fetch('/api/activities', {
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
          <h1 className="text-2xl font-bold text-slate-800 font-display">Kegiatan</h1>
          <p className="text-slate-500 mt-1">Kelola jadwal kegiatan kelas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <span>+</span> Tambah Kegiatan
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block mb-2">
                  📅 {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <h3 className="font-semibold text-slate-800 font-display">{item.title}</h3>
                {item.description && (
                  <p className="text-slate-500 text-sm mt-2">{item.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="ml-3 bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex-shrink-0"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-2 bg-white rounded-2xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">
            Belum ada kegiatan.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-slate-800 font-display mb-5">Tambah Kegiatan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kegiatan</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="Nama kegiatan..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Deskripsi kegiatan..."
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
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

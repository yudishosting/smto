'use client';

import { useEffect, useState } from 'react';

interface Student {
  id: number;
  name: string;
  nis: string;
  position: string;
  photo_url: string | null;
  username: string;
}

const positions = ['Ketua', 'Sekretaris', 'Bendahara', 'Anggota'];

const positionBadge = (pos: string) => {
  const colors: Record<string, string> = {
    Ketua: 'bg-blue-100 text-blue-700',
    Sekretaris: 'bg-purple-100 text-purple-700',
    Bendahara: 'bg-amber-100 text-amber-700',
    Anggota: 'bg-emerald-100 text-emerald-700',
  };
  return colors[pos] || 'bg-gray-100 text-gray-700';
};

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: '', nis: '', position: 'Anggota', photo_url: '', username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStudents = () => {
    fetch('/api/students').then(r => r.json()).then(setStudents);
  };

  useEffect(() => { fetchStudents(); }, []);

  const openCreate = () => {
    setEditStudent(null);
    setForm({ name: '', nis: '', position: 'Anggota', photo_url: '', username: '', password: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setForm({ name: s.name, nis: s.nis, position: s.position, photo_url: s.photo_url || '', username: s.username, password: '' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editStudent) {
        const res = await fetch(`/api/students/${editStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const d = await res.json();
          setError(d.error);
          setLoading(false);
          return;
        }
      } else {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const d = await res.json();
          setError(d.error);
          setLoading(false);
          return;
        }
      }
      fetchStudents();
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus siswa ini? Akun loginnya juga akan dihapus.')) return;
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    fetchStudents();
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-display">Students Management</h1>
          <p className="text-slate-500 mt-1">Kelola data dan akun siswa</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <span>+</span> Tambah Siswa
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full data-table">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-6 py-4">ID</th>
              <th className="text-left px-6 py-4">Nama</th>
              <th className="text-left px-6 py-4">NIS</th>
              <th className="text-left px-6 py-4">Username</th>
              <th className="text-left px-6 py-4">Jabatan</th>
              <th className="text-left px-6 py-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map((s, i) => (
              <tr key={s.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                <td className="px-6 py-4 text-slate-600 font-mono text-sm">{s.nis}</td>
                <td className="px-6 py-4 text-slate-600">{s.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${positionBadge(s.position)}`}>
                    {s.position}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-400">
                  Belum ada data siswa. Klik "Tambah Siswa" untuk memulai.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-slate-800 font-display mb-5">
              {editStudent ? 'Edit Siswa' : 'Tambah Siswa Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Nama siswa..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NIS</label>
                <input
                  value={form.nis}
                  onChange={e => setForm({ ...form, nis: e.target.value })}
                  required
                  placeholder="Nomor Induk Siswa..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jabatan</label>
                <select
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Foto (opsional)</label>
                <input
                  value={form.photo_url}
                  onChange={e => setForm({ ...form, photo_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              {!editStudent && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Username Login</label>
                    <input
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      required
                      placeholder="Username untuk login siswa..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password Login</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      required
                      placeholder="Password untuk login siswa..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-slate-200 text-slate-600 rounded-xl py-2.5 font-medium text-sm hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 font-medium text-sm transition disabled:opacity-60"
                >
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

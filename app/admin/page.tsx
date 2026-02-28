'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const earningsData = [
  { month: 'Jan', value: 12000 },
  { month: 'Feb', value: 15000 },
  { month: 'Mar', value: 13500 },
  { month: 'Apr', value: 18000 },
  { month: 'May', value: 16000 },
  { month: 'Jun', value: 22000 },
  { month: 'Jul', value: 19000 },
  { month: 'Aug', value: 25000 },
  { month: 'Sep', value: 23000 },
  { month: 'Oct', value: 28000 },
  { month: 'Nov', value: 35000 },
];

interface Stats {
  students: number;
  subjects: number;
  announcements: number;
  activities: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats);
  }, []);

  const cards = [
    { label: 'Total Siswa', value: stats?.students ?? '...', icon: '👥', color: 'from-blue-500 to-blue-600' },
    { label: 'Mata Pelajaran', value: stats?.subjects ?? '...', icon: '📚', color: 'from-purple-500 to-purple-600' },
    { label: 'Pengumuman', value: stats?.announcements ?? '...', icon: '📢', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Kegiatan', value: stats?.activities ?? '...', icon: '🎯', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 font-display">Dashboard</h1>
        <p className="text-slate-500 mt-1">Selamat datang di panel administrasi!</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white shadow-lg`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white/80">{c.label}</p>
              <span className="text-2xl">{c.icon}</span>
            </div>
            <p className="text-3xl font-bold font-display">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-700 mb-4 font-display">Aktivitas Bulanan</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-base font-semibold text-slate-700 mb-4 font-display">Komposisi Jabatan</h2>
          <div className="space-y-3 mt-6">
            {[
              { label: 'Ketua', color: '#3b82f6', pct: 17 },
              { label: 'Sekretaris', color: '#8b5cf6', pct: 17 },
              { label: 'Bendahara', color: '#f59e0b', pct: 17 },
              { label: 'Anggota', color: '#10b981', pct: 49 },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-800">{item.pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${item.pct}%`, background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

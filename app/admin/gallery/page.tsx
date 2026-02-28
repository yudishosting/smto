'use client';

import { useEffect, useState } from 'react';

interface GalleryItem {
  id: number;
  title: string;
  description: string | null;
  photo_url: string;
  event_date: string | null;
  created_at: string;
}

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', photo_url: '', event_date: '' });

  const fetchData = () => {
    fetch('/api/gallery').then(r => r.json()).then(d => Array.isArray(d) ? setItems(d) : null);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setShowModal(false);
    setForm({ title: '', description: '', photo_url: '', event_date: '' });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus foto ini?')) return;
    await fetch('/api/gallery', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchData();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '12px',
    padding: '10px 12px', fontSize: '13px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', background: '#f8faff',
  };

  return (
    <div style={{ padding: '16px', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', fontFamily: "'Sora',sans-serif" }}>📸 Galeri Kegiatan</div>
          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Dokumentasi kegiatan kelas XI TSM 2</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 16px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
          + Tambah Foto
        </button>
      </div>

      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>Belum ada foto kegiatan</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>Klik "+ Tambah Foto" untuk mulai mengisi galeri</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '12px' }}>
        {items.map(item => (
          <div key={item.id} style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e8eef8', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ position: 'relative', paddingTop: '70%', cursor: 'pointer' }} onClick={() => setPreview(item)}>
              <img src={item.photo_url} alt={item.title}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)' }} />
              {item.event_date && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '99px', backdropFilter: 'blur(4px)' }}>
                  📅 {new Date(item.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              )}
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', lineHeight: 1.3, marginBottom: '4px' }}>{item.title}</div>
              {item.description && <div style={{ fontSize: '10px', color: '#64748b', lineHeight: 1.5 }}>{item.description}</div>}
              <button onClick={() => handleDelete(item.id)} style={{ marginTop: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '10px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                🗑 Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div onClick={() => setPreview(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <button onClick={() => setPreview(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', fontSize: '18px', cursor: 'pointer' }}>✕</button>
          <img src={preview.photo_url} alt={preview.title} style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '16px', objectFit: 'contain' }} />
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>{preview.title}</div>
            {preview.description && <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '4px' }}>{preview.description}</div>}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e293b', marginBottom: '20px', fontFamily: "'Sora',sans-serif" }}>📸 Tambah Foto Kegiatan</div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '6px' }}>JUDUL KEGIATAN *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Contoh: Praktik Bengkel Motor" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '6px' }}>URL FOTO *</label>
                <input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })} required placeholder="https://..." style={inputStyle} />
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>Upload foto ke Google Drive/Imgur/dll, lalu paste link di sini</div>
              </div>
              {form.photo_url && (
                <div style={{ marginBottom: '14px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <img src={form.photo_url} alt="preview" style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '6px' }}>TANGGAL KEGIATAN</label>
                <input type="date" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '6px' }}>KETERANGAN</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ceritakan tentang kegiatan ini..." rows={3}
                  style={{ ...inputStyle, resize: 'vertical' as const }} />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, border: '1.5px solid #e2e8f0', background: '#fff', borderRadius: '12px', padding: '11px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#64748b', fontFamily: 'inherit' }}>Batal</button>
                <button type="submit" disabled={loading} style={{ flex: 1, background: '#2563eb', border: 'none', borderRadius: '12px', padding: '11px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: '#fff', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Menyimpan...' : '📸 Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

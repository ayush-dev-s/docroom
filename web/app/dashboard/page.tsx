'use client';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Doc = { _id: string; name: string; key: string; contentType: string; size: number };

export default function Dashboard() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const load = async () => {
    const res = await fetch(`${API}/docs`, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setDocs(data.docs);
    }
  };

  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file) return;
    const pres = await fetch(`${API}/docs/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: file.name, contentType: file.type || 'application/octet-stream', size: file.size })
    });
    if (!pres.ok) return alert('presign failed');
    const { url, key } = await pres.json();
    const put = await fetch(url, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream' }, body: file });
    if (!put.ok) return alert('upload failed');
    const fin = await fetch(`${API}/docs/finalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key, name: file.name, size: file.size, contentType: file.type || 'application/octet-stream' })
    });
    if (!fin.ok) return alert('finalize failed');
    setFile(null);
    await load();
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <h2>Your Documents</h2>
      <div style={{ margin:'12px 0' }}>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <button onClick={upload} disabled={!file}>Upload</button>
      </div>
      <ul>
        {docs.map(d => (
          <li key={d._id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee' }}>
            <span>{d.name}</span>
            <span style={{ display:'flex', gap:8 }}>
              <a href={`/docs/${d._id}`}>Open</a>
              <button onClick={async ()=>{
                const email = prompt('Share with user email (must exist):');
                if (!email) return;
                const role = 'viewer';
                const res = await fetch(`${API}/docs/${d._id}/access`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body: JSON.stringify({ email, role })});
                if (res.ok) alert('Shared'); else alert('Share failed');
              }}>Share</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
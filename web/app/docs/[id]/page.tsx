'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Viewer() {
  const params = useParams();
  const id = params?.id as string;
  const [url, setUrl] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const run = async () => {
      // load doc list to find key
      const res = await fetch(`${API}/docs`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      const doc = data.docs.find((d: any) => d._id === id);
      if (!doc) return;
      const vu = await fetch(`${API}/docs/view-url/${encodeURIComponent(doc.key)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const v = await vu.json();
      setUrl(v.url);
      // track open
      await fetch(`${API}/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ docId: id, type: 'open' })
      });
    };
    run();
  }, [id]);

  useEffect(() => {
    let visible = true;
    const onFocus = async () => {
      if (!visible) {
        visible = true;
        await fetch(`${API}/analytics/track`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ docId: id, type: 'page_focus' }) });
      }
    };
    const onBlur = async () => {
      visible = false;
      await fetch(`${API}/analytics/track`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ docId: id, type: 'page_blur' }) });
    };
    window.addEventListener('focus', onFocus);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onBlur);
    };
  }, [id]);

  if (!url) return <div style={{ padding: 40 }}>Loading...</div>;
  return (
    <div style={{ height: '100vh' }}>
      <iframe src={url} style={{ width: '100%', height: '100%', border: 'none' }} />
    </div>
  );
}
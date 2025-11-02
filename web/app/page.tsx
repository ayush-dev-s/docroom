'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Page() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Demo');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [token, setToken] = useState<string | null>(null);

  const submit = async () => {
    const res = await fetch(`${API}/auth/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) return alert('Auth failed');
    const data = await res.json();
    localStorage.setItem('token', data.token);
    window.location.href = '/dashboard';
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <h1>DocRoom</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button onClick={() => setMode('login')} disabled={mode==='login'}>Login</button>
        <button onClick={() => setMode('register')} disabled={mode==='register'}>Register</button>
      </div>
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{ width:'100%', padding:8, marginBottom:8 }} />
      {mode==='register' && (
        <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} style={{ width:'100%', padding:8, marginBottom:8 }} />
      )}
      <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width:'100%', padding:8, marginBottom:8 }} />
      <button onClick={submit} style={{ width:'100%', padding:10 }}>{mode==='login'?'Login':'Create account'}</button>
    </div>
  );
}
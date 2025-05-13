'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Signup successful! Please log in.');
        router.push('/login');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Something went wrong');
    }
  };

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Sign Up</h1>

      <label className="block mb-2">Username:</label>
      <input
        className="w-full p-2 border mb-4"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <label className="block mb-2">Password:</label>
      <input
        type="password"
        className="w-full p-2 border mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={handleSignup}
      >
        Sign Up
      </button>
    </main>
  );
}

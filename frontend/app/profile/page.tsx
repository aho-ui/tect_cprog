'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, isLoggedIn } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [profile, setProfile] = useState({ age: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
  const token = getAccessToken();
  if (!token) {
    router.push('/login');
    return;
  }

  setToken(token);
  fetchProfile(token);
}, []);


  const refreshToken = async () => {
  const refresh = localStorage.getItem('refresh');
  if (!refresh) return null;

  const res = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  localStorage.setItem('access', data.access);
  return data.access;
};


  const fetchProfile = async (accessToken: string) => {
  try {
    const res = await fetch('http://127.0.0.1:8000/api/profile/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // If token expired, try refresh
    if (res.status === 401) {
      const newToken = await refreshToken();
      if (newToken) {
        setToken(newToken);
        return fetchProfile(newToken); // retry with new token
      } else {
        router.push('/login');
        return;
      }
    }

    const data = await res.json();
    setProfile({
      age: data.age?.toString() || '',
      bio: data.bio || '',
    });
    setLoading(false);
  } catch (err) {
    console.error('Error fetching profile:', err);
  }
};


  const handleUpdate = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          age: parseInt(profile.age),
          bio: profile.bio,
        }),
      });
      alert('Profile updated!');
      setIsEditing(false); // go back to view mode
    } catch (err) {
      console.error('Update error:', err);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <main className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      {/* READ-ONLY VIEW */}
      {!isEditing && (
        <>
          <p className="mb-2"><strong>Age:</strong> {profile.age}</p>
          <p className="mb-4"><strong>Bio:</strong> {profile.bio}</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        </>
      )}

      {/* EDIT VIEW */}
      {isEditing && (
        <>
          <label className="block mb-2">Age:</label>
          <input
            type="number"
            className="w-full p-2 border mb-4"
            value={profile.age}
            onChange={(e) => setProfile({ ...profile, age: e.target.value })}
          />

          <label className="block mb-2">Bio:</label>
          <textarea
            className="w-full p-2 border mb-4"
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />

          <button
            className="bg-green-600 text-white px-4 py-2 rounded mr-2"
            onClick={handleUpdate}
          >
            Update
          </button>
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </button>
        </>
      )}
    </main>
  );
}

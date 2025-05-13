'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    logout();
    router.push('/login');
  }, []);

  return (
    <main className="p-4">
      <p>Logging out...</p>
    </main>
  );
}



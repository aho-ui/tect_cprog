'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isLoggedIn } from '@/lib/auth';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const pathname = usePathname();

  // Every time the route changes, re-check token
  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, [pathname]);

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <div className="font-bold">MyApp</div>
      <div className="space-x-4">
        <Link href="/" className="hover:underline">Home</Link>
        {loggedIn && (
          <>
            <Link href="/profile" className="hover:underline">Profile</Link>
            <Link href="/chat" className="hover:underline">Chat</Link>
            <Link href="/logout" className="hover:underline">Logout</Link>
          </>
        )}
        {!loggedIn && (
              <>
          <Link href="/login" className="hover:underline">Login</Link>
          <Link href="/signup" className="hover:underline">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}

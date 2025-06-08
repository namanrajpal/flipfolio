// src/app/(app)/home/page.tsx
'use client';

import { signInWithRedirect, signOut, fetchUserAttributes } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';
import Image from 'next/image';
import FileUpload from '../../components/FileUpload';
import GoogleButton from '../../components/GoogleButton';
import { useState, useEffect } from 'react';

export default function HomeApp() {
  const { authStatus } = useAuthenticator();     // tracks signed-in state
  const [name, setName] = useState<string | null>(null);

  /* Pull friendly name once authenticated */
  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchUserAttributes()
        .then(a =>
          setName(a.name ?? a.given_name ?? a.email?.split('@')[0] ?? null)
        )
        .catch(() => {}); // ignore if fetch fails (rare)
    }
  }, [authStatus]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <Image
        src="/flipfolios-brand-logo.png"
        alt="FlipFolios logo"
        height={96}
        width={96}
        className="mb-8 rounded-3xl shadow-lg"
      />

      {/* ---------- signed-out ---------- */}
      {authStatus !== 'authenticated' ? <GoogleButton /> : (
        /* ---------- signed-in ---------- */
        <>
          {name && (
            <h2 className="mb-6 text-2xl font-semibold text-gray-700">
              Welcome, {name}!
            </h2>
          )}

          <FileUpload
            onUploadSuccess={({ slug }) =>
              window.location.assign(`/folio/${slug}`)
            }
          />

          {/* sign-out button  */}
          <button
            onClick={() => signOut()}
            className="mt-8 text-sm text-blue-500 hover:underline"
          >
            Sign out
          </button>
        </>
      )}

      <footer className="mt-20 text-xs text-gray-400">
        © 2025 FlipFolios. All rights reserved.
      </footer>
    </main>
  );
}

// src/app/(app)/home/page.tsx
'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';   // 👈 new
import awsconfig from '@/aws-exports';
import Image from 'next/image';
import FileUpload from '../../components/FileUpload';
import '@aws-amplify/ui-react/styles.css';
import { useState, useEffect } from 'react';

Amplify.configure(awsconfig);

export default function HomeApp() {
  /** hold the friendly name once we load attributes */
  const [displayName, setDisplayName] = useState<string | null>(null);

  /** load attributes AFTER the user is authenticated */
  async function loadName() {
    try {
      const attrs = await fetchUserAttributes();   // { name, given_name, ... }
      setDisplayName(
        attrs.name ?? attrs.given_name ?? attrs.email?.split('@')[0] ?? null
      );
    } catch {
      /* ignored – user still signing in */
    }
  }

  useEffect(() => {
    loadName();
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      {/* logo */}
      <Image
        src="/flipfolios-brand-logo.png"
        alt="FlipFolios logo"
        height={96}
        width={96}
        className="rounded-3xl shadow-lg"
       />

      {/* Authenticator handles sign-in; we show UI only when authed */}
      <Authenticator socialProviders={['google']} hideSignUp>
        {() => (
          <>
            {/* ---- welcome header ---- */}
            {displayName && (
              <h2 className="mb-6 text-2xl font-semibold text-gray-700">
                Welcome, {displayName}!
              </h2>
            )}

            <FileUpload
              onUploadSuccess={({ slug }) =>
                window.location.assign(`/folio/${slug}`)
              }
            />
          </>
        )}
      </Authenticator>

      <footer className="mt-20 text-xs text-gray-400">
        © 2025 FlipFolios. All rights reserved.
      </footer>
    </main>
  );
}

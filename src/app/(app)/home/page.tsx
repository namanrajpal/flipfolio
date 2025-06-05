// src/app/(app)/home/page.tsx
'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import awsconfig from '@/aws-exports';
import Image from 'next/image';
import FileUpload from '../../components/FileUpload';
import '@aws-amplify/ui-react/styles.css';

Amplify.configure(awsconfig);

export default function HomeApp() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      {/* logo */}
      <Image
        src="/flipfolios-brand-logo.png"
        alt="FlipFolios logo"
        height={96}
        width={96}
        className="mb-8"
      />

      {/* Authenticator shows Google button when signed-out,
          and renders the children only when signed-in */}
      <Authenticator socialProviders={['google']} hideSignUp>
        {({ user }) => (
          <FileUpload
            onUploadSuccess={({ slug }) => {
              window.location.assign(`/folio/${slug}`);
            }}
          />
        )}
      </Authenticator>

      <footer className="mt-20 text-xs text-gray-400">
        © 2025 FlipFolios. All rights reserved.
      </footer>
    </main>
  );
}

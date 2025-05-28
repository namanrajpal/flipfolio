// src/app/page.tsx
'use client';

import Image from 'next/image';
import FileUpload from './components/FileUpload';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAmplifyConfigured } from './components/AmplifyClientProvider';

export default function Home() {
  const [dragOver, setDragOver] = useState(false);
  const router = useRouter();

  const handleUploadSuccess = ({ slug, s3Path }: { slug: string, s3Path: string }) => {
    sessionStorage.clear();
    if (!isAmplifyConfigured()) { // Store slug in sessionStorage if Amplify is not configured
      sessionStorage.setItem(slug, s3Path);
    }

    router.push(`/folio/${slug}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden p-6 text-center">
      {/* logo + tagline */}
      <header className="mb-12 space-y-4 animate-fade-in">
        <div className="mx-auto relative h-24 w-24 sm:h-32 sm:w-32 rounded-2xl overflow-hidden shadow-xl ring-1 ring-gray-200">
          <Image
            src="/flipfolios-brand-logo.png"
            alt="FlipFolios logo"
            fill
            sizes="(min-width: 640px) 128px, 96px"
            className="object-cover"
            priority
          />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
          Welcome to FlipFolios!
        </h1>
        <p className="max-w-xl text-gray-600 mx-auto">
          Upload your multi‑page PDF and we’ll transform it into a stunning, shareable flipbook.
        </p>
      </header>

      {/* upload card */}
      <FileUpload onUploadSuccess={handleUploadSuccess} />

      <footer className="mt-20 text-xs text-gray-400">© 2025 FlipFolio. All rights reserved.</footer>
    </main>
  );
}

/* we keep fade-in keyframe for header ------------------------------------------------
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.6s ease-out both; }
----------------------------------------------------------------- */

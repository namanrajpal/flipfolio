'use client';

import { useParams, usePathname } from 'next/navigation';
import Head from 'next/head';
import FlipbookViewer from '../../components/FlipbookViewer';
import { ShareIcon, CheckIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';

function slugToTitle(slug: string): string {
  // 1. drop the nano-id suffix (-g2neek, _k9p3x7 …)
  const withoutId = slug.replace(/[-_][a-z0-9]{6}$/i, '');

  // 2. turn separators into spaces
  const spaced = withoutId.replace(/[-_]+/g, ' ');

  // 3. Title-case every word
  return spaced
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function FolioPage() {
  /* — 1  slug / folioId — */
  const params = useParams();
  const slug = (params.slug as string) ?? (params.folioId as string);
  const s3Path = `public/${slug}.pdf`;
  const titleText = slugToTitle(slug);

  /* — 2  copy-to-clipboard — */
  const pathname = usePathname();
  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${pathname}`
      : '';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700 p-6">
        Invalid URL
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`Flipbook · ${titleText}`}</title>
        <meta
          name="description"
          content={`Interactive flipbook view of ${slug}.pdf`}
        />
      </Head>

      {/* ——— page wrapper ——— */}
      <div className="relative min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-gray-100 via-neutral-200 to-neutral-300">

        {/* HEADER */}
        <header className="pt-6 text-center">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 drop-shadow-sm">
            {titleText}
          </h1>
        </header>

        {/* BOOK (fades in) */}
        <main className="flex-grow flex items-center justify-center px-4 pb-24 animate-fade-in">
          <FlipbookViewer s3Path={s3Path} />
        </main>

        {/* STICKY FOOTER w/ share button */}
        <footer className="sticky bottom-0 w-full bg-white/80 backdrop-blur-md border-t border-gray-200 py-4 flex flex-col items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                       bg-blue-600 hover:bg-blue-700 text-white shadow transition-colors"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4" /> Copied!
              </>
            ) : (
              <>
                <ShareIcon className="w-4 h-4" /> Copy public link
              </>
            )}
          </button>
          <p className="text-xs text-gray-600">
            Share this link so others can view your flipbook
          </p>
        </footer>
      </div>
    </>
  );
}


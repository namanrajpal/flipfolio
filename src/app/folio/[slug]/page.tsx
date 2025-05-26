// src/app/folio/[slug]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import Head from 'next/head';
import Link from 'next/link';
import FlipbookViewer from '../../components/FlipbookViewer';

export default function FolioPage() {
  /* ── 1. read the slug from the URL ─────────────────────────────── */
  const { slug } = useParams<{ slug: string }>();          // e.g. "my-artbook-E4pRt9"

  /* ── 2. build the S3 key expected by FlipbookViewer ───────────── */
  const s3Path = `public/${slug}.pdf`;

  /* ── 3. simple guard (should never fire unless URL is malformed) ─ */
  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700 p-6">
        <p className="text-lg">Invalid URL. <Link href="/" className="underline">Go home</Link></p>
      </div>
    );
  }

  /* ── 4. render the viewer page ─────────────────────────────────── */
  return (
    <>
      <Head>
        <title>{`Flipbook · ${slug.replace(/-/g, ' ')}`}</title>
        <meta
          name="description"
          content={`Interactive flipbook view of ${slug}.pdf`}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-neutral-200 flex flex-col items-center p-4 sm:p-8">
        <header className="w-full max-w-5xl text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">Your Flipbook</h1>
        </header>

        <FlipbookViewer s3Path={s3Path} />

        <div className="mt-8">
          <Link
            href="/"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 shadow-md transition-colors"
          >
            Upload Another PDF
          </Link>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          Share this link so others can view your flipbook!
        </footer>
      </div>
    </>
  );
}

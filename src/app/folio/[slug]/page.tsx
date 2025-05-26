'use client';

import { useParams, usePathname } from 'next/navigation';
import Head from 'next/head';
import FlipbookViewer from '../../components/FlipbookViewer';
import { ShareIcon, CheckIcon } from '@heroicons/react/24/solid';
import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/solid';

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

interface ToolbarProps {
  current: number;
  numPages: number;
  flipNext: () => void;
  flipPrev: () => void;
  zoom: (factor: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ current, numPages, flipNext, flipPrev, zoom }) => (
  <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md shadow-md flex justify-center py-2">
    <div className="flex items-center gap-3">
      <button
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
        onClick={flipPrev}
        disabled={current === 0}
      >
        <ChevronLeftIcon className="w-5" />
      </button>
      <span className="text-sm w-16 text-center">
        {current + 1} / {numPages}
      </span>
      <button
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
        onClick={flipNext}
        disabled={current >= numPages - 1}
      >
        <ChevronRightIcon className="w-5" />
      </button>

      <span className="mx-3 h-4 w-px bg-gray-300" />

      <button
        className="p-1 rounded hover:bg-gray-100"
        onClick={() => zoom(1 / 1.1)}
      >
        <MinusIcon className="w-5" />
      </button>
      <button
        className="p-1 rounded hover:bg-gray-100"
        onClick={() => zoom(1.1)}
      >
        <PlusIcon className="w-5" />
      </button>
    </div>
  </div>
);

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

  const [current, setCurrent] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const flipNext = () => {/* logic to flip to the next page */};
  const flipPrev = () => {/* logic to flip to the previous page */};
  const zoom = (factor: number) => {/* logic to zoom in or out */};

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
          <FlipbookViewer
            s3Path={s3Path}
            current={current}
            setCurrent={setCurrent}
            numPages={numPages}
            setNumPages={setNumPages}
          />
        </main>

        <Toolbar
          current={current}
          numPages={numPages}
          flipNext={flipNext}
          flipPrev={flipPrev}
          zoom={zoom}
        />
      </div>
    </>
  );
}


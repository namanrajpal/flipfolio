'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import dynamic from 'next/dynamic';
import { Document, Page, pdfjs } from 'react-pdf';
import { getUrl } from '@aws-amplify/storage';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { ensureAmplifyConfigured } from './AmplifyClientProvider';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const HTMLFlipBook = dynamic(() => import('react-pageflip'), { ssr: false });

/* page wrapper – must forward ref for PageFlip */
// eslint-disable-next-line react/display-name
const FlipPage = forwardRef<HTMLDivElement, { num: number; width: number }>(
    ({ num, width }, ref) => {
      return (
        <div
          ref={ref}                                   
          className="flex h-full w-full items-center justify-center"
        >
          <Page
            pageNumber={num}
            width={width}
            loading={null}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </div>
      );
    },
  );

interface ViewerProps {
  s3Path: string;
}

export default function FlipbookViewer({ s3Path }: ViewerProps) {
  ensureAmplifyConfigured();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageDims, setDims] = useState({ w: 600, h: 800 });
  const [current, setCurrent] = useState(0);
  const flipRef = useRef<{ pageFlip: () => { flipNext: () => void; flipPrev: () => void } } | null>(null); // PageFlip instance

  /* signed URL */
  useEffect(() => {
    getUrl({ path: s3Path, options: { expiresIn: 3600 } }).then(({ url }) =>
      setPdfUrl(url.href),
    );
  }, [s3Path]);

  /* responsive width/height */
  /* calc pageDims – replace the existing calcDims call */
  const calcDims = useCallback((pageW: number, pageH: number) => {
    const aspect = pageH / pageW;
  
    /* 48 vw (almost half screen) capped at 750 px per sheet */
    const sheetW = Math.min(window.innerWidth * 0.48, 750);
    const sheetH = sheetW * aspect;
  
    setDims({ w: sheetW, h: sheetH });
  }, []);
  

  /* controls */
  const flipNext = () => flipRef.current?.pageFlip().flipNext();
  const flipPrev = () => flipRef.current?.pageFlip().flipPrev();

  const zoom = (factor: number) =>
    setDims((d) => ({ w: d.w * factor, h: d.h * factor }));

  const share = async () => {
    await navigator.clipboard.writeText(window.location.href);
    alert('Link copied 🙂');
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Document
        file={pdfUrl}
        loading={<p className="py-20">Loading…</p>}
        onLoadSuccess={async (doc) => {
          setNumPages(doc.numPages);
          const page = await doc.getPage(1);
          const [, , w, h] = page.view;
          calcDims(w, h);
        }}
      >
        {numPages > 0 && (
          <>
            <HTMLFlipBook
              ref={flipRef}
              width={pageDims.w}          /* single-sheet width */
              height={pageDims.h}
              size="fixed"
              usePortrait={false}         /* ⬅ stop auto-portrait */
              minWidth={350}              /* keep double-page down to 700 px spread */
              maxShadowOpacity={0.4}
              showCover={true}
              className="shadow-xl"
              onFlip={(e: any) => setCurrent(e.data)}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <FlipPage key={i} num={i + 1} width={pageDims.w} />
              ))}
            </HTMLFlipBook>

            {/* toolbar */}
            <div className="mt-4 flex justify-center">
              <div className="flex items-center">
                <div className="mt-4 flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-md px-4 py-2 shadow">
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

                  <span className="mx-3 h-4 w-px bg-gray-300" />

                  <button
                    className="p-1 rounded hover:bg-gray-100"
                    onClick={share}
                  >
                    <ShareIcon className="w-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </Document>
    </div>
  );
}

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
import { ensureAmplifyConfigured } from './AmplifyClientProvider';
import { cacheAndGet } from '../utils/useServiceWorkerCache';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const HTMLFlipBook = dynamic(() => import('react-pageflip'), { ssr: false });
const WINDOW = 1;          // 0 = current-only, 1 = prev/next, 2 = ±2 …

/* page wrapper – must forward ref for PageFlip */
// eslint-disable-next-line react/display-name
const FlipPage = forwardRef<
  HTMLDivElement,
  { num: number; width: number; height: number; render: boolean }
>(({ num, width, height, render }, ref) => (
  <div
    ref={ref}
    style={{ width, height }}          /* keep geometry stable */
    className="flex items-center justify-center overflow-hidden bg-white"
  >
    {render && (
      <Page
        pageNumber={num}
        width={width}
        loading={null}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    )}
  </div>
));

interface ViewerProps {
  s3Path: string;
  current: number;
  setCurrent: (n: number) => void;
  numPages: number;
  setNumPages: (n: number) => void;
}

export default function FlipbookViewer({ s3Path, current, setCurrent, numPages, setNumPages }: ViewerProps) {
  ensureAmplifyConfigured();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [documentLoadingProgress, setDocumentLoadingProgress] = useState<number | null>(null);
  const [pageDims, setDims] = useState({ w: 600, h: 800 });
  const flipRef = useRef<{
    pageFlip: () => {
      flipNext: () => void;
      flipPrev: () => void;
      flip: (page: number) => void;
      getCurrentPageIndex: () => number;
    };
  } | null>(null); // PageFlip instance

  /* signed URL with caching */
  useEffect(() => {
    if (!s3Path) return;
    (async () => {
      const { url } = await getUrl({ path: s3Path, options: { expiresIn: 3600 }});
      const blob = await cacheAndGet(url.href);
      setPdfUrl(URL.createObjectURL(blob));
    })();
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

  useEffect(() => {
    if (flipRef.current?.pageFlip()) {
      const currentPage = flipRef.current.pageFlip().getCurrentPageIndex();
      if (currentPage !== current) {
        flipRef.current.pageFlip().flip(current);
      }
    }
  }, [current]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Show loading state when pdfUrl is not yet available */}
      {!pdfUrl && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* Progress overlay */}
      {documentLoadingProgress !== null && (
        <div className="flex flex-col items-center gap-4 py-20 w-full">
          <div className="w-56 h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${documentLoadingProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500">{documentLoadingProgress}%</p>
        </div>
      )}
      {pdfUrl && (
        <Document
          file={pdfUrl}
          loading={null} 
          onLoadProgress={({ loaded, total }) => {
            if (total) setDocumentLoadingProgress(Math.round((loaded / total) * 100));
          }}
          onLoadSuccess={async (doc) => {
            setNumPages(doc.numPages);
            const page = await doc.getPage(1);
            const [, , w, h] = page.view;
            calcDims(w, h);
            setDocumentLoadingProgress(null); 
          }}
          error={
            <div className="flex items-center justify-center py-20 text-red-600">
              Failed to load PDF
            </div>
          }
        >
          {numPages > 0 && (
            <HTMLFlipBook
              ref={flipRef}
              width={pageDims.w}
              height={pageDims.h}
              size="fixed"
              usePortrait={false}
              minWidth={350}
              maxShadowOpacity={0.4}
              showCover={true}
              className="shadow-xl"
              mobileScrollSupport={true}
              onFlip={(e: any) => setCurrent(e.data)}
              startPage={current}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <FlipPage
                  key={i}
                  num={i + 1}
                  width={pageDims.w}
                  height={pageDims.h}
                  render={Math.abs(i - current) <= WINDOW}
                />
              ))}
            </HTMLFlipBook>
          )}
        </Document>
      )}
    </div>
  );
}

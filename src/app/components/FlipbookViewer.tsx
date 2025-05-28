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
  slug:string,
  s3Path: string;
  current: number;
  setCurrent: (n: number) => void;
  numPages: number;
  setNumPages: (n: number) => void;
}

export default function FlipbookViewer({ slug, s3Path, current, setCurrent, numPages, setNumPages }: ViewerProps) {
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

  /* signed URL */
  useEffect(() => {             
    if (sessionStorage.getItem(slug)) { // Getting file URL from sessionStorage if amplify is not configured 
      setPdfUrl(sessionStorage.getItem(slug));
    } else {
      getUrl({ path: s3Path, options: { expiresIn: 3600 } }).then(({ url }) =>
        setPdfUrl(url.href),
      );
    }
  }, [slug,s3Path]);

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
    <div className="w-full flex flex-col items-center"  id='flipbook-viewer'>
      {/* ① progress overlay */}
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
      >
        {numPages > 0 && (
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
            mobileScrollSupport={true}
            onFlip={(e: any) => setCurrent(e.data)}
            startPage={current}
          >
            {Array.from({ length: numPages }, (_, i) => (
              <FlipPage key={i} num={i + 1} width={pageDims.w} />
            ))}
          </HTMLFlipBook>
        )}
      </Document>
    </div>
  );
}

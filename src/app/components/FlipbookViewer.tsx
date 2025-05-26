'use client';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useState,
  Ref,
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

/* Page wrapper that PageFlip can attach to */
const FlipPage = forwardRef(function FlipPage(
  {
    pageNumber,
    width,
  }: {
    pageNumber: number;
    width: number;
  },
  ref: Ref<HTMLDivElement>,
) {
  return (
    <div ref={ref} className="flex h-full w-full items-center justify-center">
      <Page
        pageNumber={pageNumber}
        width={width}
        loading={null}
        renderTextLayer={false}
        renderAnnotationLayer={false}
      />
    </div>
  );
});

export default function FlipbookViewer({
  s3Path,
}: {
  /** S3 key e.g. public/1716-myfile.pdf */
  s3Path: string;
}) {
  ensureAmplifyConfigured();

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageSize, setPageSize] = useState<{ w: number; h: number }>({
    w: 420,
    h: 600,
  }); // default portrait A5-ish

  /** signed URL */
  const fetchUrl = useCallback(async () => {
    const { url } = await getUrl({ path: s3Path, options: { expiresIn: 3600 } });
    setPdfUrl(url.href);
  }, [s3Path]);

  useEffect(() => {
    fetchUrl();
  }, [fetchUrl]);

  /** responsively pick width/height */
  const calcPageDims = useCallback(
    (w: number, h: number) => {
      const maxW = Math.min(window.innerWidth * 0.8, 1000); // 80 vw, cap 800
      const aspect = h / w;
      const width = maxW;
      const height = Math.round(maxW * aspect);
      setPageSize({ w: width, h: height });
    },
    [setPageSize],
  );

  if (!pdfUrl) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center">
      <Document
        file={pdfUrl}
        loading={
          <div className="flex h-[50vh] w-full items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          </div>
        }
        onLoadSuccess={async (doc) => {
            setNumPages(doc.numPages);
            const firstPage = await doc.getPage(1);
            const [, , w, h] = firstPage.view;
            calcPageDims(w, h);
          }}
      >
        {numPages > 0 && (
          <HTMLFlipBook
            width={pageSize.w}
            height={pageSize.h}
            size="fixed"
            maxShadowOpacity={0.4}
            mobileScrollSupport
            className="rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-white"
          >
            {Array.from({ length: numPages }, (_, i) => (
              <FlipPage
                key={i}
                pageNumber={i + 1}
                width={pageSize.w}
              />
            ))}
          </HTMLFlipBook>
        )}
      </Document>
    </div>
  );
}

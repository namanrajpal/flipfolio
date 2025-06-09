import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { getUrl } from '@aws-amplify/storage';
import { ExtractedContent } from '@/types/pdf-extract';
import type { TextElement, ListElement, ImageElement } from '@/types/pdf-extract';
import { cacheAndGet } from '../utils/useServiceWorkerCache';
import { DocumentThemeProvider, useDocumentTheme } from './DocumentTheme';
import { ErrorDisplay } from './ErrorDisplay';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface ScrollViewProps {
  s3Path: string;
  extractedContent?: ExtractedContent;
  numPages: number;
  setNumPages: (n: number) => void;
  zoomLevel: number;
}

const TextContent: React.FC<{ element: TextElement }> = ({ element }) => {
  const theme = useDocumentTheme();
  
  const style = {
    position: 'absolute' as const,
    left: `${element.position.x}px`,
    top: `${element.position.y}px`,
    width: `${element.position.width}px`,
    minHeight: `${element.position.height}px`,
    fontSize: element.style.fontSize,
    fontFamily: element.style.fontFamily || theme.fonts[0],
    textAlign: element.style.textAlign as 'left' | 'center' | 'right',
    color: element.style.color || theme.colors[0],
    backgroundColor: element.style.backgroundColor,
    padding: '2px 0',
    margin: 0,
    lineHeight: 1.6,
    letterSpacing: element.type === 'heading' ? '-0.02em' : 'normal',
    fontWeight: element.type === 'heading' ? 600 : 'normal',
  };

  return element.type === 'heading' ? (
    <h2 
      style={style}
      className="text-gray-800 tracking-tight"
    >
      {element.content}
    </h2>
  ) : (
    <p style={style}>{element.content}</p>
  );
};

const ListContent: React.FC<{ element: ListElement }> = ({ element }) => {
  const theme = useDocumentTheme();
  
  const style = {
    position: 'absolute' as const,
    left: `${element.position.x}px`,
    top: `${element.position.y}px`,
    width: `${element.position.width}px`,
    minHeight: `${element.position.height}px`,
    fontSize: element.style.fontSize,
    fontFamily: element.style.fontFamily || theme.fonts[0],
    textAlign: element.style.textAlign as 'left' | 'center' | 'right',
    color: element.style.color || theme.colors[0],
    backgroundColor: element.style.backgroundColor,
    margin: 0,
    padding: '0 0 0 1.5em',
    lineHeight: 1.6,
  };

  const listItemStyle = {
    marginBottom: '0.5em',
    position: 'relative' as const,
  };

  const ListTag = element.listType === 'ordered' ? 'ol' : 'ul';
  
  return (
    <ListTag 
      style={style}
      className={element.listType === 'unordered' ? 'list-disc' : 'list-decimal'}
    >
      {element.items.map((item, idx) => (
        <li 
          key={idx} 
          style={listItemStyle}
          className="text-gray-800"
        >
          {item}
        </li>
      ))}
    </ListTag>
  );
};

const ImageElement: React.FC<{ element: ImageElement }> = ({ element }) => {
  return (
    <div 
      style={{
        position: 'absolute',
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.position.width}px`,
        height: `${element.position.height}px`,
      }}
      className="overflow-hidden rounded-sm shadow-sm"
    >
      <img
        src={element.content}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        alt=""
        loading="lazy"
      />
    </div>
  );
};

export default function ScrollView({ s3Path, extractedContent, numPages, setNumPages, zoomLevel }: ScrollViewProps) {
  const [pageDims, setDims] = React.useState({ w: 600, h: 800 });
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [documentLoadingProgress, setDocumentLoadingProgress] = React.useState<number | null>(null);
  const [extractionError, setExtractionError] = React.useState<string | null>(null);

  // Calculate responsive dimensions
  const calcDims = React.useCallback((pageW: number, pageH: number) => {
    const aspect = pageH / pageW;
    const baseWidth = Math.min(window.innerWidth * 0.8, 1000); // 80% of viewport width, max 1000px
    const width = baseWidth * zoomLevel;
    const height = width * aspect;
    setDims({ w: width, h: height });
  }, [zoomLevel]);

  // Load PDF URL
  React.useEffect(() => {
    if (!s3Path) return;
    (async () => {
      try {
        const { url } = await getUrl({ path: s3Path });
        const blob = await cacheAndGet(url.href);
        setPdfUrl(URL.createObjectURL(blob));
        setExtractionError(null);
      } catch (err) {
        console.error('Failed to load PDF:', err);
        setExtractionError('Failed to load the PDF file. Please try again.');
      }
    })();
  }, [s3Path]);

  // Recalculate dimensions when zoom level changes
  React.useEffect(() => {
    if (pdfUrl) {
      const loadPage = async () => {
        const doc = await pdfjs.getDocument(pdfUrl).promise;
        const page = await doc.getPage(1);
        const [, , w, h] = page.view;
        calcDims(w, h);
      };
      loadPage();
    }
  }, [zoomLevel, pdfUrl, calcDims]);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {extractionError && (
        <ErrorDisplay 
          message="PDF Loading Error"
          details={extractionError}
          onRetry={() => window.location.reload()}
        />
      )}

      {!pdfUrl && !extractionError && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {documentLoadingProgress !== null && !extractionError && (
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

      {pdfUrl && extractedContent && !extractionError && (
        <DocumentThemeProvider theme={extractedContent.theme}>
          <Document
            file={pdfUrl}
            loading={null}
            onLoadProgress={({ loaded, total }) => {
              if (total) setDocumentLoadingProgress(Math.round((loaded / total) * 100));
            }}
            onLoadSuccess={(doc) => {
              setNumPages(doc.numPages);
              setDocumentLoadingProgress(null);
            }}
            onLoadError={(err) => {
              console.error('PDF load error:', err);
              setExtractionError('Failed to render the PDF. The file might be corrupted or in an unsupported format.');
            }}
            error={
              <ErrorDisplay 
                message="PDF Rendering Error"
                details="Failed to render the PDF file. The file might be corrupted or in an unsupported format."
                onRetry={() => window.location.reload()}
              />
            }
          >
            <div className="flex flex-col gap-8 pb-24">
              {Array.from({ length: numPages }, (_, i) => (
                <div key={i} className="shadow-xl relative bg-white" style={{ width: pageDims.w, height: pageDims.h }}>
                  <Page
                    pageNumber={i + 1}
                    width={pageDims.w}
                    loading={null}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    error={
                      <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                        <ErrorDisplay 
                          message={`Failed to render page ${i + 1}`}
                          details="The page content might be corrupted."
                        />
                      </div>
                    }
                  />
                  {extractedContent.pages[i]?.elements.map((element, idx) => {
                    try {
                      switch (element.type) {
                        case 'image':
                          return <ImageElement key={idx} element={element} />;
                        case 'list':
                          return <ListContent key={idx} element={element} />;
                        default:
                          return <TextContent key={idx} element={element as TextElement} />;
                      }
                    } catch (err) {
                      console.error(`Failed to render element on page ${i + 1}:`, err);
                      return null; // Skip rendering this element
                    }
                  })}
                </div>
              ))}
            </div>
          </Document>
        </DocumentThemeProvider>
      )}
    </div>
  );
}
// src/app/page.tsx
'use client'; // This page uses client-side hooks (useRouter)

import Head from 'next/head'; // Next.js Head component for meta tags
import { useRouter } from 'next/navigation'; // App Router hook for navigation
import FileUpload from './components/FileUpload'; // Adjust path if your component folder is different

export default function HomePage() {
  const router = useRouter();

  const handleUploadSuccess = ({ slug }: { slug: string }) => {
    router.push(`/folio/${slug}`);      // clean URL
  };

  return (
    <>
      <Head>
        <title>Flipfolio - Create Your PDF Flipbook</title>
        <meta name="description" content="Upload your PDF and share it as an interactive flipbook." />
        <link rel="icon" href="/favicon.ico" /> {/* Ensure you have a favicon.ico in your /public folder */}
      </Head>

      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '20px' }}> {/* Basic styling */}
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#333' }}>Welcome to Flipfolio!</h1>
          <p style={{ fontSize: '1.1rem', color: '#555' }}>
            Upload your multi-page PDF and we'll transform it into a stunning, shareable flipbook.
          </p>
        </header>
        
        <FileUpload onUploadSuccess={handleUploadSuccess} />

        <footer style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', width: '100%', maxWidth: '600px' }}>
          <p style={{ fontSize: '0.9rem', color: '#777' }}>
            Copyright © {new Date().getFullYear()} Flipfolio. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
// src/app/layout.tsx
import './globals.css';
import { AmplifyProvider } from './components/AmplifyClientProvider';
import React from 'react';

export const metadata = {
  title: 'Flipfolios',
  description: 'Create and share PDF flipbooks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="icon" href="/flipfolio-icon.png" sizes="240x240" />
      <body>
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
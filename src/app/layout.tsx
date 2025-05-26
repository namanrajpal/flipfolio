// src/app/layout.tsx
import './globals.css';
// Adjust path to where you created AmplifyClientProvider.tsx
import { AmplifyProvider } from './components/AmplifyClientProvider';
import React from 'react';

export const metadata = {
  title: 'Flipfolio',
  description: 'Create and share PDF flipbooks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Note: No Amplify.configure() here anymore.
  // The console logs you previously added here were showing server-side resolved config.
  return (
    <html lang="en">
      <body>
        <AmplifyProvider>{children}</AmplifyProvider>
      </body>
    </html>
  );
}
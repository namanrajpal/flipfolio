// src/amplifyClient.tsx               <-- runs in the browser only
'use client';

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../../amplifyconfiguration.json';

// Guard so we don’t call configure twice if React fast-refreshes
let configured = false;
export function ensureAmplifyConfigured() {
  if (!configured) {
    Amplify.configure(amplifyconfig);
    configured = true;
  }
}

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  ensureAmplifyConfigured();
  return <>{children}</>;
}

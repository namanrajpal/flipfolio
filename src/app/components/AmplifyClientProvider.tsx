// src/amplifyClient.tsx               <-- runs in the browser only
'use client';

import { Amplify } from 'aws-amplify';
// import amplifyconfig from '../../amplifyconfiguration.json';

let amplifyconfig: any;
try { 
  amplifyconfig = require('../../amplifyconfiguration.json');
}catch (error) {
  console.warn('Amplify configuration file not found. Please ensure amplifyconfiguration.json exists in the correct path.');
}

// Guard so we don’t call configure twice if React fast-refreshes
let configured = false;
export function ensureAmplifyConfigured() {
  if (amplifyconfig && !configured) {
    Amplify.configure(amplifyconfig);
    configured = true;
  }
}

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  ensureAmplifyConfigured();
  return <>{children}</>;
}

export function isAmplifyConfigured() {
  return configured;
}

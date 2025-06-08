'use client';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import amplifyconfig from '../../amplifyconfiguration.json';
import '@aws-amplify/ui-react/styles.css';

let configured = false;
export function ensureAmplifyConfigured() {
  if (!configured) {
    Amplify.configure(amplifyconfig);
    configured = true;
  }
}

export function AmplifyProvider({ children }: { children: React.ReactNode }) {
  ensureAmplifyConfigured();

  /* 👉 provides auth context for useAuthenticator() & friends */
  return <Authenticator.Provider>{children}</Authenticator.Provider>;
}

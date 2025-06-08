/* src/components/GoogleButton.tsx */
'use client';

import { signInWithRedirect } from 'aws-amplify/auth';
import Image from 'next/image';

export default function GoogleButton() {
  return (
    <button
      onClick={() => signInWithRedirect({ provider: 'Google' })}
      className="flex items-center gap-4
                 h-12 px-6
                 border border-[#dadce0] rounded-full
                 bg-white text-sm font-medium text-[#3c4043]
                 hover:shadow-md active:shadow-none
                 transition"
      aria-label="Sign in with Google"
    >
      {/* Google “G” icon (official SVG) */}
      <Image
        src="/google-logo.png"      // put the SVG in /public/
        alt=""
        width={20}
        height={20}
      />

      <span className="whitespace-nowrap">Sign in with Google</span>
    </button>
  );
}

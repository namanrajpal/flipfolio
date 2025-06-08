/* -----------------------------------------------------------------------
   Landing (marketing) page – short, punchy, scroll-free
   --------------------------------------------------------------------- */
import Image from 'next/image';
import Link from 'next/link';

export default function Landing() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Moving gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-white via-violet-50/30 to-fuchsia-50/30 animate-gradient"
        style={{ backgroundSize: '200% 200%' }}
      ></div>
      
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-violet-200/20 via-fuchsia-100/20 to-transparent rounded-full animate-blob blur-lg"></div>
        <div className="absolute top-[60%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-fuchsia-200/20 via-purple-100/20 to-transparent rounded-full animate-blob [animation-delay:1s] blur-lg"></div>
        <div className="absolute top-[30%] left-[30%] w-[500px] h-[500px] bg-gradient-to-br from-purple-200/20 via-violet-100/20 to-transparent rounded-full animate-blob [animation-delay:2s] blur-lg"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-16 md:pt-0">
        {/* Logo & tagline */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <Image
              src="/flipfolios-brand-logo.png"
              alt="FlipFolios logo"
              height={120}
              width={120}
              priority
              className="mb-8 rounded-3xl shadow-lg animate-flip-entrance"
            />
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">
            Flip your PDFs into wow ✨
          </h1>

          <p className="max-w-xl text-lg text-slate-600">
            Drag–drop a PDF. Get a sleek, shareable flipbook&nbsp;URL in seconds.
          </p>
        </div>

        {/* Feature blips */}
        <section className="mt-20 grid sm:grid-cols-3 gap-8 max-w-5xl w-full mx-auto">
          {[
            ['Real-feel page turns', 'react-pageflip engine, 60 fps animations'],
            ['Instant sharing', 'a clean URL, no sign-up needed for viewers'],
            ['Mobile-ready 💯', 'responsive, pinch-zoom & swipe navigation'],
          ].map(([title, body]) => (
            <div
              key={title}
              className="bg-white/30 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/40"
            >
              <h3 className="font-semibold text-xl mb-2 text-violet-700">{title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </section>

        {/* Call-to-action */}
        <div className="flex justify-center mt-16">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-lg px-10 py-4 rounded-full shadow-xl hover:scale-110 transition"
          >
            Get started – it's free
          </Link>
        </div>

        <footer className="mt-20 text-xs text-slate-500 text-center">
          © 2025 FlipFolios. All rights reserved.
          <br />
          Made&nbsp;with&nbsp;❤️ by Naman Rajpal
        </footer>
      </div>
    </main>
  );
}

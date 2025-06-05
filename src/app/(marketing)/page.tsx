/* -----------------------------------------------------------------------
   Landing (marketing) page – short, punchy, scroll-free
   --------------------------------------------------------------------- */
   import Image from 'next/image';
   import Link from 'next/link';
   
   export default function Landing() {
     return (
       <main className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-sky-400 via-blue-600 to-fuchsia-600 text-white px-6">
         {/* Logo & tagline */}
         <div className="flex flex-col items-center gap-6 text-center">
           <Image
             src="/flipfolios-brand-logo.png"
             alt="FlipFolios logo"
             height={120}
             width={120}
             priority
             className="rounded-3xl shadow-lg"
           />
   
           <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg">
             Flip your PDFs into wow ✨
           </h1>
   
           <p className="max-w-xl text-lg opacity-90">
             Drag–drop a PDF. Get a sleek, shareable flipbook&nbsp;URL in seconds.
           </p>
         </div>
   
         {/* Feature blips */}
         <section className="mt-20 grid sm:grid-cols-3 gap-8 max-w-5xl w-full">
           {[
             ['Real-feel page turns', 'react-pageflip engine, 60 fps animations'],
             ['Instant sharing', 'a clean URL, no sign-up needed for viewers'],
             ['Mobile-ready 💯', 'responsive, pinch-zoom & swipe navigation'],
           ].map(([title, body]) => (
             <div
               key={title}
               className="bg-white/10 rounded-3xl p-6 backdrop-blur-lg border border-white/20"
             >
               <h3 className="font-semibold text-xl mb-2">{title}</h3>
               <p className="opacity-80 text-sm leading-relaxed">{body}</p>
             </div>
           ))}
         </section>
   
         {/* Call-to-action */}
         <Link
           href="/home"
           className="mt-16 inline-flex items-center gap-2 bg-white text-blue-700 font-semibold text-lg px-10 py-4 rounded-full shadow-xl hover:scale-110 transition"
           /*         ↑ bigger font & padding, larger hover scale */
         >
           Get started – it’s free
         </Link>
   
         <footer className="mt-20 text-xs opacity-80 text-center">
            © 2025 FlipFolios. All rights reserved.
            <br />
            Made&nbsp;with&nbsp;❤️ by Naman Rajpal
        </footer>

       </main>
     );
   }
   
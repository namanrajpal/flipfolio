export async function cacheAndGet(url: string) {
  const cache = await caches.open('flipfolios-pdfs');
  const cached = await cache.match(url);
  if (cached) return cached.blob();

  const res = await fetch(url);  // No need for credentials with pre-signed URLs
  if (!res.ok) {
    throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`);
  }
  await cache.put(url, res.clone());                // saved for next time
  return await res.blob();
}
import { customAlphabet } from 'nanoid/non-secure';

const nano = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

export const generateNanoid = () => nano();

export async function cacheAndGet(url: string): Promise<Blob> {
  const cache = await caches.open('pdf-cache');
  const response = await cache.match(url);

  if (response) {
    return response.blob();
  }

  const fetchResponse = await fetch(url);
  const responseClone = fetchResponse.clone();
  await cache.put(url, responseClone);
  return fetchResponse.blob();
}
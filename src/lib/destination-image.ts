/**
 * Server-only utility — do NOT import in client components.
 * Fetches a landscape photo for a destination from the Unsplash API.
 * Returns null if UNSPLASH_ACCESS_KEY is not set or the request fails.
 */
export async function getDestinationImage(destination: string): Promise<string | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  // Use just the primary place name: "Goa, India" → "Goa"
  const place = destination.split(/[,→]/)[0].trim();
  const query = encodeURIComponent(`${place} travel`);

  try {
    const res = await fetch(
      `https://api.unsplash.com/photos/random?query=${query}&orientation=landscape&client_id=${key}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const json = await res.json();
    // urls.regular is ~1080px wide — good quality without being huge
    return (json.urls?.regular as string) ?? null;
  } catch {
    return null;
  }
}

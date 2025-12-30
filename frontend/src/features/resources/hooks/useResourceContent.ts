import { useState } from "react";

export default function useResourceContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchContent = async (
    id: string,
    signal?: AbortSignal,
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const base = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";
      const res = await fetch(
        `${base}/v1/resources/${encodeURIComponent(id)}/readermode`,
        {
          signal,
        },
      );
      if (!res.ok)
        throw new Error(`Failed to fetch reader-mode content: ${res.status}`);
      return await res.text();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchContent, loading, error };
}

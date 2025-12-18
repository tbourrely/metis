import { useState } from "react";

export default function useCreateResource() {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const createResource = async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const base = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000';
      const res = await fetch(`${base}/v1/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error(`Failed to create resource: ${res.status}`);
      return await res.text();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createResource, loading, error };
}

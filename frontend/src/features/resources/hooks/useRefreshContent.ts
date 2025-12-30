import { useState } from "react";

export default function useRefreshContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshContent = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const base = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";
      const res = await fetch(
        `${base}/v1/resources/${encodeURIComponent(id)}/refresh-content`,
        {
          method: "POST",
        },
      );
      if (!res.ok) throw new Error(`Failed to refresh content: ${res.status}`);
      // response can be discarded
      return;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { refreshContent, loading, error };
}

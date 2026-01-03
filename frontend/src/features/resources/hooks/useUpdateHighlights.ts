import { useState } from "react";

type UpdateHighlightsDTO = {
  start: number;
  end: number;
};

export default function useUpdateHighlights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateHighlights = async (
    id: string,
    highlights: UpdateHighlightsDTO[],
  ) => {
    setLoading(true);
    setError(null);
    try {
      const base = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";
      const res = await fetch(
        `${base}/v1/resources/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ highlights }),
        },
      );
      if (!res.ok) throw new Error(`Failed to update read: ${res.status}`);
      // return parsed body if any
      try {
        return await res.json();
      } catch {
        return null;
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return [updateHighlights, loading, error] as const;
}

import { useState } from "react";

export default function useDeleteResource() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteResource = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:3000/v1/resources/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error(`Failed to delete article: ${res.status}`);
      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteResource, loading, error };
}

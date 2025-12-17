import { useEffect, useState } from "react";
import useDeleteResource from "./useDeleteResource";
import useUpdateRead from "./useUpdateRead";
import type { Resource } from "../types/resource";

export default function useResources() {
  const [articles, setArticles] = useState<Resource[]>([]);
  const { deleteResource } = useDeleteResource();
  const { updateRead } = useUpdateRead();

  const reloadArticles = async (signal?: AbortSignal) => {
    try {
      const res = await fetch("http://localhost:3000/v1/resources", { signal });
      if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
      const data = await res.json();
      setArticles(data);
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      console.error(err);
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    reloadArticles(ac.signal);
    return () => ac.abort();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteResource(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRead = async (id: string) => {
    const found = articles.find((a) => a.id === id);
    const newRead = !found?.read;
    try {
      await updateRead(id, Boolean(newRead));
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, read: Boolean(newRead) } : a)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return { articles, handleDelete, handleToggleRead, reloadArticles };
}

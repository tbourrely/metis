import { useEffect, useState } from "react";
import useDeleteResource from "./useDeleteResource";
import useUpdateRead from "./useUpdateRead";
import type { Resource } from "../types/resource";

export default function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const { deleteResource } = useDeleteResource();
  const { updateRead } = useUpdateRead();

  const reloadArticles = async (signal?: AbortSignal) => {
    try {
      const res = await fetch("http://localhost:3000/v1/resources", { signal });
      if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
      const data = await res.json();
      setResources(data);
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
      setResources((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRead = async (id: string) => {
    const found = resources.find((a) => a.id === id);
    const newRead = !found?.read;
    try {
      await updateRead(id, Boolean(newRead));
      setResources((prev) =>
        prev.map((a) => (a.id === id ? { ...a, read: Boolean(newRead) } : a)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  return { resources, handleDelete, handleToggleRead, reloadArticles };
}

import { useCallback, useEffect, useState } from "react";
import useDeleteResource from "./useDeleteResource";
import useUpdateRead from "./useUpdateRead";
import type { Resource } from "../types/resource";

type PaginatedResponse = {
  items: Resource[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
};

// FIXME: this hook does a lot !
export default function useResources(
  itemsPerPage: number = 20,
  pageInit: number = 1,
  name?: string,
  hideRead?: boolean,
) {
  const [resources, setResources] = useState<Resource[]>([]);
  const { deleteResource } = useDeleteResource();
  const { updateRead } = useUpdateRead();
  const [totalPages, setTotalPages] = useState(0);

  const reloadResources = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const base =
          import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";
        const url = new URL("/v1/resources", base);
        url.searchParams.append("perPage", itemsPerPage.toString());
        url.searchParams.append("page", pageInit.toString());
        url.searchParams.append("hideRead", hideRead ? "true" : "false");
        if (name) {
          url.searchParams.append("name", name);
        }
        const res = await fetch(url, { signal });
        if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
        const data: PaginatedResponse = await res.json();
        setTotalPages(data.meta.totalPages);
        setResources(data.items);
      } catch (err: unknown) {
        if ((err as Error).name === "AbortError") return;
        console.error(err);
      }
    },
    [itemsPerPage, pageInit, name, hideRead],
  );

  useEffect(() => {
    const ac = new AbortController();
    reloadResources(ac.signal);
    return () => ac.abort();
  }, [pageInit, reloadResources]);

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

  return {
    resources,
    handleDelete,
    handleToggleRead,
    reloadResources,
    totalPages,
  };
}

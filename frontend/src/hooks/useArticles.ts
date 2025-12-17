import { useEffect, useState } from "react";
import useDeleteArticle from "./useDeleteArticle";
import useUpdateRead from './useUpdateRead'
import type { Article } from "../types/article";

export default function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const { deleteArticle } = useDeleteArticle();
  const { updateRead } = useUpdateRead()

  const reloadArticles = async (signal?: AbortSignal) => {
    try {
      const res = await fetch("http://localhost:3000/v1/resources", { signal });
      if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
      const data = await res.json();
      setArticles(data);
    } catch (err: any) {
      if (err.name === "AbortError") return;
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
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRead = async (id: string) => {
    const found = articles.find((a) => a.id === id)
    const newRead = !found?.read
    try {
      await updateRead(id, Boolean(newRead))
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, read: Boolean(newRead) } : a)))
    } catch (err) {
      console.error(err)
    }
  }

  return { articles, handleDelete, handleToggleRead, reloadArticles };
}

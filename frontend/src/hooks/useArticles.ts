import { useEffect, useState } from "react";
import type { Article } from "../types/article";

type ArticleWithState = Article & { read?: boolean };

export default function useArticles() {
  const [articles, setArticles] = useState<ArticleWithState[]>([]);

  useEffect(() => {
    const ac = new AbortController();

    fetch("http://localhost:3000/v1/resources", { signal: ac.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch articles: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // assume API returns Article[]; add optional read flag defaulting to false
        const withState: ArticleWithState[] = Array.isArray(data)
          ? data.map((a: Article) => ({ ...a, read: false }))
          : [];
        setArticles(withState);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        console.error(err);
      });

    return () => ac.abort();
  }, []);

  const handleDelete = (id: string) =>
    setArticles((prev) => prev.filter((a) => a.id !== id));
  const handleToggleRead = (id: string) =>
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: !a.read } : a)),
    );

  return { articles, handleDelete, handleToggleRead };
}

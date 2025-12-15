import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import useDeleteArticle from "./useDeleteArticle";
import useUpdateRead from './useUpdateRead'
import type { Article } from "../types/article";

// Hook to provide article data and actions (uses API)
export default function useArticle() {
  // extract article ID from URL path with tanstack-router
  const { resourceId } = useParams({ strict: false });
  const id = resourceId || "";

  const [article, setArticle] = useState<Article>({
    id,
    name: `Article ${id}`,
    type: "document",
    source: { name: "Unknown", url: "" },
    createdAt: new Date().toISOString(),
    read: false,
  }); // TODO: do not default to dummy
  const [content, setContent] = useState<string>(
    "<p>No content available.</p>",
  );
  const [read, setRead] = useState(false);
  const { deleteArticle } = useDeleteArticle();
  const { updateRead } = useUpdateRead()
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();

    // fetch article details
    fetch(`http://localhost:3000/v1/resources/${encodeURIComponent(id)}`, {
      signal: ac.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch article: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // Accept either Article or { article, content }
        if (!data) return;
        setArticle(data);
        setRead(data.read || false);
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        console.error(err);
      });

    // fetch reader-mode content (HTML/text)
    fetch(
      `http://localhost:3000/v1/resources/${encodeURIComponent(id)}/readermode`,
      {
        signal: ac.signal,
      },
    )
      .then((res) => {
        if (!res.ok) return null;
        return res.text();
      })
      .then((text) => {
        if (typeof text === "string" && text.length > 0) {
          setContent(text);
        }
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        console.error(err);
      });

    return () => ac.abort();
  }, [id]);

  const toggleRead = async () => {
    const newRead = !read
    try {
      await updateRead(id, newRead)
      setRead(newRead)
      setArticle((a) => ({ ...a, read: newRead }))
    } catch (err) {
      console.error(err)
    }
  }
  const remove = async () => {
    try {
      await deleteArticle(id);
      navigate({ to: "/" });
    } catch (err) {
      console.error(err);
    }
  };

  return { id, article, content, read, toggleRead, remove };
}

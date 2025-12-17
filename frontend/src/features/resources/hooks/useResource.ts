import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import useDeleteResource from "./useDeleteResource";
import useUpdateRead from "./useUpdateRead";
import type { Resource } from "../types/resource";

// Hook to provide article data and actions (uses API)
export default function useResource() {
  // extract article ID from URL path with tanstack-router
  const { resourceId } = useParams({ strict: false });
  const id = resourceId || "";

  const [article, setArticle] = useState<Resource>({
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
  const { deleteResource } = useDeleteResource();
  const { updateRead } = useUpdateRead();
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
        if (!data) return;

        let resolvedArticle: Resource | null = null;
        resolvedArticle = data;

        if (resolvedArticle) {
          setArticle(resolvedArticle as Resource);
          setRead((resolvedArticle.read as boolean) || false);

          // fetch reader-mode content only for text articles
          if (resolvedArticle.type === "text") {
            fetch(
              `http://localhost:3000/v1/resources/${encodeURIComponent(id)}/readermode`,
              { signal: ac.signal },
            )
              .then((r) => {
                if (!r.ok) return null;
                return r.text();
              })
              .then((text) => {
                if (typeof text === "string" && text.length > 0)
                  setContent(text);
              })
              .catch((err: Error) => {
                if (err.name === "AbortError") return;
                console.error(err);
              });
          }
        }
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        console.error(err);
      });

    return () => ac.abort();
  }, [id]);

  const toggleRead = async () => {
    const newRead = !read;
    try {
      await updateRead(id, newRead);
      setRead(newRead);
      setArticle((a) => ({ ...a, read: newRead }));
    } catch (err) {
      console.error(err);
    }
  };
  const remove = async () => {
    try {
      await deleteResource(id);
      navigate({ to: "/" });
    } catch (err) {
      console.error(err);
    }
  };

  return { id, article, content, read, toggleRead, remove };
}

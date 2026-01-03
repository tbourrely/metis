import { useEffect } from "react";
import useHighlightText from "../../../../hooks/useHighlightText";

export default function ResourceContentHtml({ html, read }: { html: string; read: boolean }) {
  const [containerRef, , setRanges] = useHighlightText();

  useEffect(() => {
    // Apply fake restore ranges for demo purposes
    const fakeRestore = {
      "start": 231,
      "end": 235
    };

    setRanges([fakeRestore]);
  }, [setRanges]);

  return (
    <div ref={containerRef} className="mt-4 prose prose-xl max-w-none" style={{ opacity: read ? 0.8 : 1 }} dangerouslySetInnerHTML={{ __html: html }} />
  )
}

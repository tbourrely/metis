import { useCallback, useEffect, useRef, useState } from 'react'
import useResource from '../features/resources/hooks/useResource'
import ResourceHeader from '../features/resources/components/ResourceHeader'
import ResourceContentHtml from '../features/resources/components/ResourceContentHtml'
import FloatingActions from '../features/resources/components/FloatingActions'
import { isPdf } from '../lib/supportedDocuments'
import useIsIosDevice from '../hooks/useIsIosDevice'
import useHighlightText from '../hooks/useHighlightText'
import useUpdateHighlights from '../features/resources/hooks/useUpdateHighlights'

function ResourcePdfViewer({ url, isFullScreen }: { url: string; isFullScreen: boolean }) {
  return (
    <object
      data={url}
      type="application/pdf"
      className={`${isFullScreen ? 'fixed top-0 left-0 w-full h-full' : 'mt-4 w-full grow'}`}
      title="PDF Document"
    />
  )
}

export default function ResourceView() {
  const { resource, content, read, toggleRead, remove, loading, setContent } = useResource()
  const isIos = useIsIosDevice();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [containerRef, ranges, setRanges] = useHighlightText();
  const [updateHighlights] = useUpdateHighlights();
  const rangesRef = useRef(ranges);

  useEffect(() => {
    if (loading) return;
    if (!content) return;
    if (!resource.highlights || resource.highlights.length === 0) return;
    setRanges(resource.highlights);
  }, [resource, setRanges, content, loading]);

  const callback = useCallback(async () => {
    try {
      await updateHighlights(resource.id, ranges);
    } catch (err) {
      console.error("Failed to update highlights:", err);
    }
  }, [ranges, resource.id, updateHighlights]);

  // useEffect(() => {
  //   if (ranges === rangesRef.current) return;
  //   if (resource.highlights && JSON.stringify(resource.highlights) === JSON.stringify(ranges)) {
  //     return;
  //   }
  //   rangesRef.current = ranges;
  //
  //   (async () => {
  //     await callback();
  //   })();
  // }, [ranges, resource, updateHighlights, callback]);

  // derive highlighted HTML from content + ranges

  const handleFullScreenChange = () => {
    setIsFullScreen(!isFullScreen);
  }

  const isPdfDocument = resource.type === 'document' && isPdf(resource.source.url);

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen flex flex-col">
      <ResourceHeader resource={resource} read={read} setContent={setContent} />

      {loading && resource.type === 'text' && (
        <div className="mt-4">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="animate-pulse h-3 rounded bg-gray-200 mb-2"></div>
          ))}
        </div>
      )}

      {!loading && content && resource.type === 'text' && (
        <div ref={containerRef}>
          <ResourceContentHtml html={content} read={read} />
        </div>
      )}

      {!isIos && isPdfDocument && (
        <ResourcePdfViewer url={resource.source.url} isFullScreen={isFullScreen} />
      )}

      {isIos && isPdfDocument && (
        <div className="mt-4">
          <p className="text-red-300">PDF viewing is not supported on iOS devices. Please use the link above to access the document.</p>
        </div>
      )}

      <FloatingActions read={read} onToggleRead={toggleRead} onDelete={remove} onToggleFullScreen={!isIos && isPdfDocument ? handleFullScreenChange : undefined} />
    </div>
  )
}

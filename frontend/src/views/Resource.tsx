import { useState } from 'react'
import useResource from '../features/resources/hooks/useResource'
import useRefreshContent from '../features/resources/hooks/useRefreshContent'
import useResourceContent from '../features/resources/hooks/useResourceContent'
import ResourceHeader from '../features/resources/components/ResourceHeader'
import ResourceContentHtml from '../features/resources/components/ResourceContentHtml'
import FloatingActions from '../features/resources/components/FloatingActions'
import { isPdf } from '../lib/supportedDocuments'
import useIsIosDevice from '../hooks/useIsIosDevice'

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
  const { refreshContent: triggerRefresh, loading: refreshLoading } = useRefreshContent()
  const { fetchContent } = useResourceContent()
  const isIos = useIsIosDevice();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleFullScreenChange = () => {
    setIsFullScreen(!isFullScreen);
  }

  const isPdfDocument = resource.type === 'document' && isPdf(resource.source.url);

  const handleRefresh = async () => {
    try {
      await triggerRefresh(resource.id)
      const newContent = await fetchContent(resource.id)
      setContent(newContent)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen flex flex-col">
      <ResourceHeader resource={resource} read={read} />

      {loading && resource.type === 'text' && (
        <div className="mt-4">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="animate-pulse h-3 rounded bg-gray-200 mb-2"></div>
          ))}
        </div>
      )}

      {!loading && !content && resource.type === 'text' && (
        <div className="mt-4">
          <p className="text-gray-600">No content available for this resource.</p>
          <div className="mt-2">
            <button onClick={handleRefresh} disabled={refreshLoading} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">
              {refreshLoading ? 'Refreshing...' : 'Refetch content'}
            </button>
          </div>
        </div>
      )}

      {content && resource.type === 'text' && (<ResourceContentHtml html={content} read={read} />)}

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

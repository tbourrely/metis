import { useState } from 'react'
import useResource from '../features/resources/hooks/useResource'
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
  const { resource, content, read, toggleRead, remove } = useResource()
  const isIos = useIsIosDevice();
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleFullScreenChange = () => {
    setIsFullScreen(!isFullScreen);
  }

  const isPdfDocument = resource.type === 'document' && isPdf(resource.source.url);

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen flex flex-col">
      <ResourceHeader resource={resource} read={read} />

      {resource.type == 'text' && (<ResourceContentHtml html={content} read={read} />)}

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

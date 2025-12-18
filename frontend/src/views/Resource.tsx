import { useState } from 'react'
import useResource from '../features/resources/hooks/useResource'
import ResourceHeader from '../features/resources/components/ResourceHeader'
import ResourceContent from '../features/resources/components/ResourceContent'
import FloatingActions from '../features/resources/components/FloatingActions'
import { isPdf } from '../lib/supportedDocuments'

export default function ResourceView() {
  const { resource, content, read, toggleRead, remove } = useResource()

  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleFullScreenChange = () => {
    setIsFullScreen(!isFullScreen);
  }

  const isPdfDocument = resource.type === 'document' && isPdf(resource.source.url);

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen flex flex-col">
      <ResourceHeader resource={resource} read={read} />

      {resource.type == 'text' && (<ResourceContent html={content} read={read} />)}

      {isPdfDocument && (
        <object
          data={resource.source.url}
          type="application/pdf"
          className={`${isFullScreen ? 'fixed top-0 left-0 w-full h-full' : 'mt-4 w-full grow'}`}
          title={resource.name}
        />
      )}

      <FloatingActions read={read} onToggleRead={toggleRead} onDelete={remove} onToggleFullScreen={isPdfDocument ? handleFullScreenChange : undefined} />
    </div>
  )
}

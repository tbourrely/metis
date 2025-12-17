import useResource from '../features/resources/hooks/useResource'
import ResourceHeader from '../features/resources/components/ResourceHeader'
import ResourceContent from '../features/resources/components/ResourceContent'
import FloatingActions from '../features/resources/components/FloatingActions'
import { isPdf } from '../lib/supportedDocuments'

export default function ResourceView() {
  const { article, content, read, toggleRead, remove } = useResource()

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen flex flex-col">
      <ResourceHeader article={article} read={read} />

      {article.type == 'text' && (<ResourceContent html={content} read={read} />)}

      {article.type == 'document' && isPdf(article.source.url) && (
        <object
          data={article.source.url}
          type="application/pdf"
          className="w-full grow mt-4"
          title={article.name}
        />
      )}

      <FloatingActions read={read} onToggleRead={toggleRead} onDelete={remove} />
    </div>
  )
}

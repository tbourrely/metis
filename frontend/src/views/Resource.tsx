import useArticle from '../hooks/useArticle'
import ResourceHeader from '../components/ResourceHeader'
import ArticleContent from '../components/ArticleContent'
import FloatingActions from '../components/FloatingActions'
import { isPdf } from '../lib/supportedDocuments'

export default function ResourceView() {
  const { article, content, read, toggleRead, remove } = useArticle()

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen flex flex-col">
      <ResourceHeader article={article} read={read} />

      {article.type == 'text' && (<ArticleContent html={content} read={read} />)}

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

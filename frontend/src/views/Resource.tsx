import useArticle from '../hooks/useArticle'
import ResourceHeader from '../components/ResourceHeader'
import ArticleContent from '../components/ArticleContent'
import FloatingActions from '../components/FloatingActions'

export default function ResourceView() {
  const { article, read, toggleRead, remove } = useArticle()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <ResourceHeader article={article} read={read} />

      <ArticleContent html={article.html} read={read} />

      <FloatingActions read={read} onToggleRead={toggleRead} onDelete={remove} />
    </div>
  )
}

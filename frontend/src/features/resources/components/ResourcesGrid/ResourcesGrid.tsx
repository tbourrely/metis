import ResourceCard from '../ResourceCard'
import type { Resource } from '../../types/resource'

type Props = {
  articles: Resource[],
  onToggleRead: (id: string) => void,
  onDelete: (id: string) => void
}

export default function ResourcesGrid({ articles, onToggleRead, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {articles.map((article) => (
        <ResourceCard key={article.id} article={article} onToggleRead={onToggleRead} onDelete={onDelete} />
      ))}
    </div>
  )
}

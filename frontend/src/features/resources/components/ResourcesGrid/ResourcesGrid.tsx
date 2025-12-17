import type { MouseEvent } from 'react'
import ResourceCard from '../ResourceCard'
import type { Resource } from '../../types/resource'

export default function ResourcesGrid({ articles, onMenuOpen }: { articles: (Resource & { read?: boolean })[]; onMenuOpen: (e: MouseEvent, id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article) => (
        <ResourceCard key={article.id} article={article} onMenuOpen={onMenuOpen} />
      ))}
    </div>
  )
}

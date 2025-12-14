import type { MouseEvent } from 'react'
import ArticleCard from './ArticleCard'
import type { Article } from '../types/article'

export default function ArticlesGrid({ articles, onMenuOpen }: { articles: (Article & { read?: boolean })[]; onMenuOpen: (e: MouseEvent, id: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} onMenuOpen={onMenuOpen} />
      ))}
    </div>
  )
}

import React from 'react'
import ArticleCard from './ArticleCard'

export default function ArticlesGrid({ articles, onMenuOpen }: { articles: any[]; onMenuOpen: (e: React.MouseEvent, id: number) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} onMenuOpen={onMenuOpen} />
      ))}
    </div>
  )
}

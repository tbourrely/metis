import type { MouseEvent } from 'react'
import type { Article } from '../types/article'

type Props = {
  article: Article,
  onMenuOpen: (e: MouseEvent, id: string) => void
}

export default function ArticleCard({ article, onMenuOpen }: Props) {
  return (
    <a href={`/resources/${article.id}`} className="block relative">
      <article className={`p-4 bg-white rounded shadow hover:shadow-md transition ${article.read ? 'opacity-60 line-through' : ''}`}>
        <div className="absolute top-2 right-2">
          <button
            onClick={(e) => onMenuOpen(e, article.id)}
            className="px-2 py-1 border border-dotted rounded"
            aria-expanded={false}
          >
            ⋯
          </button>
        </div>

        <h4 className="font-bold">{article.name}</h4>
        <p className="text-sm text-gray-600 mt-2">By {article.source.name}</p>
      </article>
    </a>
  )
}

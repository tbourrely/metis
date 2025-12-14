import type { Article } from '../hooks/useArticle'

export default function ResourceHeader({ article, read }: { article: Article; read: boolean }) {
  return (
    <header className="mb-4">
      <a href="/" className="text-blue-600 hover:underline inline-block mb-2">← Back</a>

      <div>
        <h1 className="text-2xl font-bold mt-0 flex items-center gap-2">
          {article.title}
          {read && <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Read</span>}
        </h1>
        <p className="text-sm text-gray-600 mt-1">By {article.author}</p>
      </div>
    </header>
  )
}

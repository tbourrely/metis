import type { Resource } from '../../types/resource'

type Props = {
  article: Resource,
  onToggleRead: (id: string) => void
  onDelete: (id: string) => void
}

export default function ResourceCard({ article, onToggleRead, onDelete }: Props) {
  return (
    <article className="bg-white rounded shadow hover:shadow-md transition h-[12rem]">
      <a href={`/resources/${article.id}`}>
        <div className={`p-4 h-3/4 ${article.read ? 'opacity-60 line-through' : ''}`}>
          <h4 className="font-bold line-clamp-3">{article.name}</h4>
          <p className="text-sm text-gray-600 mt-2">By {article.source.name}</p>
        </div>
      </a>

      <hr className='border-gray-300' />

      <div className='p-4 flex justify-end items-center h-1/4'>
        <button className='cursor-pointer bg-gray-600 text-white text-sm px-4 py-1 rounded hover:bg-gray-700' onClick={() => onToggleRead(article.id)}>
          {article.read ? 'Mark as Unread' : 'Mark as Read'}
        </button>
        <button className='cursor-pointer bg-red-600 text-white text-sm px-4 py-1 rounded hover:bg-red-700 ml-4' onClick={() => onDelete(article.id)}>Delete</button>
      </div>
    </article>
  )
}

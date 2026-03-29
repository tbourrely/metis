import type { Resource } from '../../types/resource'

type Props = {
  resource: Resource,
  onToggleRead: (id: string) => void
  onDelete: (id: string) => void
}

export default function ResourceCard({ resource, onToggleRead, onDelete }: Props) {
  return (
    <article style={{backgroundColor: '#fef6e8'}} className="rounded shadow hover:shadow-md transition h-[12rem]">
      <a href={`/resources/${resource.id}`}>
        <div className={`p-4 h-3/4 ${resource.read ? 'opacity-60 line-through' : ''}`}>
          <h4 className="font-bold line-clamp-3">{resource.name}</h4>
          <p className="text-sm text-gray-600 mt-2">By {resource.source.name}</p>
        </div>
      </a>

      <hr style={{borderColor: '#e8d9c0'}} />

      <div className='p-4 flex justify-between items-center h-1/4'>
        {resource.estimatedReadingTime &&
          <p className='text-gray-500'>{resource.estimatedReadingTime} min read</p>
        }

        <div className='align-self-end ml-auto flex gap-2'>
          <button style={{borderColor: '#c4a882'}} className='cursor-pointer text-sm px-3 py-1 rounded border text-stone-600 hover:bg-amber-50' onClick={() => onToggleRead(resource.id)}>
            {resource.read ? 'Mark as Unread' : 'Mark as Read'}
          </button>
          <button className='cursor-pointer text-sm px-3 py-1 rounded border border-red-300 text-red-500 hover:bg-red-50' onClick={() => onDelete(resource.id)}>Delete</button>
        </div>
      </div>
    </article>
  )
}

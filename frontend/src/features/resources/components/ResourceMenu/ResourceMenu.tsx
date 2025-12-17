import ReactDOM from 'react-dom'
import type { Resource } from '../../types/resource';

export default function ResourceMenu({
  menuInfo,
  onToggleRead,
  onDelete,
  articles,
}: {
  menuInfo: { id: string; top: number; left: number } | null
  onToggleRead: (id: string) => void
  onDelete: (id: string) => void
  articles: (Resource & { read?: boolean })[]
}) {
  if (!menuInfo) return null
  const article = articles.find((a) => a.id === menuInfo.id)
  return ReactDOM.createPortal(
    <div
      style={{ position: 'absolute', top: menuInfo.top, left: menuInfo.left, width: 160, zIndex: 9999 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white border rounded shadow"
    >
      <button
        className="block w-full text-left px-3 py-2 hover:bg-gray-100"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onToggleRead(menuInfo.id)
        }}
      >
        {article?.read ? 'Mark as unread' : 'Mark as read'}
      </button>

      <button
        className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete(menuInfo.id)
        }}
      >
        Delete
      </button>
    </div>,
    document.body,
  )
}

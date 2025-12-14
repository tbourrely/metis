import ReactDOM from 'react-dom'

export default function ArticleMenu({
  menuInfo,
  onToggleRead,
  onDelete,
  articles,
}: {
  menuInfo: { id: number; top: number; left: number } | null
  onToggleRead: (id: number) => void
  onDelete: (id: number) => void
  articles: any[]
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

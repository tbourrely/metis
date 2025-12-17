
export default function FloatingActions({ read, onToggleRead, onDelete }: { read: boolean; onToggleRead: () => void; onDelete: () => void }) {
  return (
    <div className="fixed right-6 top-1/3 z-50 flex flex-col gap-2">
      <button
        onClick={onToggleRead}
        className="bg-white border p-2 rounded shadow hover:bg-gray-50"
        aria-pressed={read}
        title={read ? 'Mark as unread' : 'Mark as read'}
      >
        {read ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172 15.293 5.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>

      <button
        onClick={onDelete}
        className="bg-white border p-2 rounded shadow text-red-600 hover:bg-gray-50"
        title="Delete"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M6 2a1 1 0 011-1h6a1 1 0 011 1h3a1 1 0 110 2h-1v12a2 2 0 01-2 2H5a2 2 0 01-2-2V4H2a1 1 0 110-2h3zm3 5a1 1 0 10-2 0v7a1 1 0 102 0V7zm4 0a1 1 0 10-2 0v7a1 1 0 102 0V7z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

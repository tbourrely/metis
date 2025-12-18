import Check from './icons/check.svg?react';
import Eye from './icons/eye.svg?react';
import Bin from './icons/bin.svg?react';

export default function FloatingActions({ read, onToggleRead, onDelete }: { read: boolean; onToggleRead: () => void; onDelete: () => void }) {
  return (
    <div className="fixed right-6 top-1/3 z-50 flex flex-col gap-2">
      <button
        onClick={onToggleRead}
        className="bg-white border p-2 rounded shadow hover:bg-gray-50"
        aria-pressed={read}
        title={read ? 'Mark as unread' : 'Mark as read'}
      >
        {read ? <Check /> : <Eye />}
      </button>

      <button
        onClick={onDelete}
        className="bg-white border p-2 rounded shadow text-red-600 hover:bg-gray-50"
        title="Delete"
      >
        <Bin />
      </button>
    </div>
  )
}

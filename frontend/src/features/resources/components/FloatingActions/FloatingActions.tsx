import Check from './icons/check.svg?react';
import Eye from './icons/eye.svg?react';
import Bin from './icons/bin.svg?react';
import Fullscreen from './icons/fullscreen.svg?react';
import { useState } from 'react';

type FloatingActionsProps = {
  read: boolean;
  onToggleRead: () => void;
  onDelete: () => void;
  onToggleFullScreen?: () => void;
};

export default function FloatingActions({ read, onToggleRead, onDelete, onToggleFullScreen }: FloatingActionsProps) {

  const [hidden, setHidden] = useState(true);

  return (
    <>
      <div className={`fixed bottom-14 px-2 rounded z-50 ${hidden ? '-left-full' : 'left-5'} transition-all`}>
        <div className="flex gap-2">
          {onToggleFullScreen && (
            <button
              onClick={onToggleFullScreen}
              className="bg-white border p-2 rounded shadow hover:bg-gray-50"
              title="Toggle Fullscreen"
            >
              <Fullscreen />
            </button>
          )}

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
      </div>

      <button
        onClick={() => setHidden(!hidden)}
        className="fixed z-55 left-0 bottom-15 p-1 shadow hover:bg-gray-100 hover:cursor-pointer"
        title={hidden ? 'Show actions' : 'Hide actions'}
      >
        {hidden ? '»' : '«'}
      </button>
    </>
  )
}

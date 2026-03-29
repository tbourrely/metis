import useSidebar from '../hooks/useSidebar'

export default function Sidebar() {
  const { open, closeSidebar } = useSidebar()

  // TODO: Refactor to use a map for nav items and DRY it up

  return (
    <>
      {/* Mobile sliding menu (controlled by header button via context) */}
      <div style={{backgroundColor: '#f5edca'}} className={`fixed inset-y-0 left-0 w-64 p-4 transform transition-transform duration-200 md:hidden ${open ? 'translate-x-0' : '-translate-x-full'} z-50`} role="dialog" aria-hidden={!open}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold">Metis</div>
          <button aria-label="Close menu" onClick={() => closeSidebar()} className="p-2 rounded-md">✕</button>
        </div>
        <nav>
          <ul>
            <li>
              <a href="/" className="text-teal-700 hover:underline">Resources</a>
            </li>
            <li>
              <a href="/sources" className="text-teal-700 hover:underline">Sources</a>
            </li>
            <li>
              <a href="/upload-json" className="text-teal-700 hover:underline">Upload JSON</a>
            </li>
          </ul>
        </nav>
      </div>

      {/* overlay */}
      {open && <div className="fixed inset-0 bg-black/40 md:hidden z-40" onClick={() => closeSidebar()} />}

      {/* Desktop sidebar */}
      <aside style={{backgroundColor: '#f5edca'}} className="hidden md:block md:w-1/6 md:sticky md:top-0 md:h-screen md:overflow-auto p-4">
        <div className="text-2xl font-bold mb-4">Metis</div>
        <nav>
          <ul>
            <li>
              <a href="/" className="text-teal-700 hover:underline">Resources</a>
            </li>
            <li>
              <a href="/sources" className="text-teal-700 hover:underline">Sources</a>
            </li>
            <li>
              <a href="/upload-json" className="text-teal-700 hover:underline">Upload JSON</a>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  )
}

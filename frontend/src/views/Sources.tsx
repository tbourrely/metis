import Sidebar from '../components/Sidebar'
import useSources from '../features/sources/hooks/useSources'
import useSidebar from '../hooks/useSidebar'
import BurgerIcon from '../features/resources/components/ResourcesHeader/icons/burger.svg?react'

export default function Sources() {
  const { sources, loading, error } = useSources()
  const { toggle } = useSidebar()

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        { // TODO: Refactor to a common Header component 
        }
        <header className="mb-4 flex gap-3 items-center">
          <button className="md:hidden p-2" aria-label="Toggle menu" onClick={() => toggle()}>
            <BurgerIcon width={20} height={20} />
          </button>
          <h1 className="text-2xl font-semibold">Sources</h1>
        </header>

        {loading && <div>Loading sources...</div>}
        {error && <div className="text-red-600">{error.message}</div>}

        <div>
          <ul>
            {sources.map((s, idx) => (
              <li key={idx} className="p-3">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 hover:underline">{s.name}</a>
                <div className="text-sm text-gray-600">{s.url}</div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}

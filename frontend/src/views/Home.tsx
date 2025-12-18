import useHideRead from '../hooks/useHideRead'
import Sidebar from '../components/Sidebar'
import ResourcesGrid from '../features/resources/components/ResourcesGrid'
import ResourcesHeader from '../features/resources/components/ResourcesHeader'
import useResources from '../features/resources/hooks/useResources'

function Home() {
  const { resources, handleDelete, handleToggleRead, reloadArticles, page, setPage, totalPages } = useResources();
  const [hideRead, setHideRead] = useHideRead(true)

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        <ResourcesHeader hideRead={hideRead} setHideRead={setHideRead} onCreated={reloadArticles} />

        <ResourcesGrid resources={hideRead ? resources.filter((a) => !a.read) : resources} onDelete={handleDelete} onToggleRead={handleToggleRead} />

        <div>
          {
            page > 1 &&
            (
              <button
                className="mt-6 mr-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setPage(page - 1)}
              >
                Previous page
              </button>
            )}
          {
            page < totalPages &&
            (
              <button
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => setPage(page + 1)}
              >
                Next page
              </button>
            )}
        </div>
      </main>
    </div>
  )
}

export default Home

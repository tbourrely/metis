import Sidebar from '../components/Sidebar'
import ResourcesGrid from '../features/resources/components/ResourcesGrid'
import ResourcesHeader from '../features/resources/components/ResourcesHeader'
import useResources from '../features/resources/hooks/useResources'
import { Route } from '../routes'
import { useEffect } from 'react'

function Home() {
  const { page, search, hideRead } = Route.useSearch();

  const { resources, handleDelete, handleToggleRead, reloadResources, totalPages, setNameFilter, setPage } = useResources(20, page);

  useEffect(() => {
    setNameFilter(search);
  }, [search, setNameFilter]);

  useEffect(() => {
    setPage(page);
  }, [page, setPage]);

  const navigate = Route.useNavigate();

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        <ResourcesHeader onCreated={reloadResources} />

        <ResourcesGrid resources={hideRead ? resources.filter((a) => !a.read) : resources} onDelete={handleDelete} onToggleRead={handleToggleRead} />

        <div>
          {
            page > 1 &&
            (
              <button
                className="mt-6 mr-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => navigate({
                  search: (prev) => ({
                    page: prev.page - 1
                  })
                })}
              >
                Previous page
              </button>
            )}
          {
            page < totalPages &&
            (
              <button
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => navigate({
                  search: (prev) => ({
                    page: prev.page + 1
                  })
                })}
              >
                Next page
              </button>
            )}
        </div>
      </main >
    </div >
  )
}

export default Home

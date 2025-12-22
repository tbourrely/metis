import Sidebar from '../components/Sidebar'
import ResourcesGrid from '../features/resources/components/ResourcesGrid'
import ResourcesHeader from '../features/resources/components/ResourcesHeader'
import useResources from '../features/resources/hooks/useResources'
import { Route } from '../routes'

function NavigationBtn({ onClick, children, disabled, className }: { onClick: () => void; children: React.ReactNode, disabled: boolean, className?: string }) {
  return (
    <button disabled={disabled} className={`mt-6 px-4 py-2 text-white rounded ${disabled ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700 hover:cursor-pointer'} ${className}`} onClick={onClick}>
      {children}
    </button>
  )
}

function Home() {
  const { page, search, hideRead } = Route.useSearch();
  const { resources, handleDelete, handleToggleRead, reloadResources, totalPages, totalItems } = useResources(undefined, page, search, hideRead);
  const navigate = Route.useNavigate();

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        <ResourcesHeader onCreated={reloadResources} />

        <ResourcesGrid resources={resources} onDelete={handleDelete} onToggleRead={handleToggleRead} />

        <div className="flex">
          <NavigationBtn disabled={page <= 1} onClick={() => navigate({
            search: (prev) => ({
              page: prev.page - 1
            })
          })}>
            Previous page
          </NavigationBtn>

          <NavigationBtn className='ml-4' disabled={page >= totalPages} onClick={() => navigate({
            search: (prev) => ({
              page: prev.page + 1
            })
          })}>
            Next page
          </NavigationBtn>

          <p className="ml-auto self-center text-sm text-gray-600">
            Page {page} of {totalPages} - {totalItems} items total
          </p>
        </div>
      </main >
    </div >
  )
}

export default Home

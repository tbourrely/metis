import useHideRead from '../hooks/useHideRead'
import Sidebar from '../components/Sidebar'
import ResourcesGrid from '../features/resources/components/ResourcesGrid'
import ResourcesHeader from '../features/resources/components/ResourcesHeader'
import useResources from '../features/resources/hooks/useResources'

function Home() {
  const { resources, handleDelete, handleToggleRead, reloadArticles } = useResources()

  const [hideRead, setHideRead] = useHideRead(true)

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        <ResourcesHeader hideRead={hideRead} setHideRead={setHideRead} onCreated={reloadArticles} />

        <ResourcesGrid resources={hideRead ? resources.filter((a) => !a.read) : resources} onDelete={handleDelete} onToggleRead={handleToggleRead} />
      </main>
    </div>
  )
}

export default Home

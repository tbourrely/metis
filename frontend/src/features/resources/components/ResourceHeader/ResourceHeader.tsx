import { useRouter } from '@tanstack/react-router';
import type { Resource } from '../../types/resource'
import useRefreshContent from '../../hooks/useRefreshContent';
import useResourceContent from '../../hooks/useResourceContent';

type Props = {
  resource: Resource;
  read: boolean;
  setContent?: (content: string) => void;
}

const RefreshButton = ({ onClick, loading }: { onClick: () => void; loading: boolean }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="text-teal-700 text-sm mt-1 inline-block cursor-pointer disabled:opacity-50"
  >
    {loading ? 'Refreshing...' : 'Refetch content'}
  </button>
)

export default function ResourceHeader({ resource, read, setContent }: Props) {
  const router = useRouter();
  const { refreshContent: triggerRefresh, loading: refreshLoading } = useRefreshContent()
  const { fetchContent } = useResourceContent()

  const handleRefresh = async () => {
    try {
      await triggerRefresh(resource.id)
      const newContent = await fetchContent(resource.id)
      setContent?.(newContent)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <header className="mb-4">
      <button onClick={() => router.history.back()} className="text-teal-700 hover:underline hover:cursor-pointer inline-block mb-2">← Back</button>

      <div className="flex flex-col">
        <h1 className="text-2xl font-bold mt-0 flex items-center gap-2">
          {resource.name}
          {read && <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Read</span>}
        </h1>
        <p className="text-sm text-gray-600 mt-1">By {resource.source.name} {resource.estimatedReadingTime && (`- ${resource.estimatedReadingTime} min read`)}</p>
        <div className='flex gap-2 mt-1'>
          <a href={resource.source.url} target="_blank" rel="noopener noreferrer" className="text-teal-700 text-sm mt-1 inline-block">Original resource</a>
          <span>|</span>
          <RefreshButton onClick={handleRefresh} loading={refreshLoading} />
        </div>
      </div>
    </header >
  )
}

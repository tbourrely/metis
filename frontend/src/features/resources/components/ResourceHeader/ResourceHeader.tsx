import type { Resource } from '../../types/resource'

type Props = {
  resource: Resource;
  read: boolean;
}

export default function ResourceHeader({ resource, read }: Props) {
  return (
    <header className="mb-4">
      <a href="/" className="text-blue-600 hover:underline inline-block mb-2">← Back</a>

      <div>
        <h1 className="text-2xl font-bold mt-0 flex items-center gap-2">
          {resource.name}
          {read && <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Read</span>}
        </h1>
        <p className="text-sm text-gray-600 mt-1">By {resource.source.name} {resource.estimatedReadingTime && (`- ${resource.estimatedReadingTime} min read`)}</p>
        <a href={resource.source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-1 inline-block">Original resource</a>
      </div>
    </header>
  )
}

import ResourceCard from '../ResourceCard'
import type { Resource } from '../../types/resource'

type Props = {
  resources: Resource[],
  onToggleRead: (id: string) => void,
  onDelete: (id: string) => void
}

export default function ResourcesGrid({ resources, onToggleRead, onDelete }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {resources.map((resource) => (
        <ResourceCard key={resource.id} resource={resource} onToggleRead={onToggleRead} onDelete={onDelete} />
      ))}
    </div>
  )
}

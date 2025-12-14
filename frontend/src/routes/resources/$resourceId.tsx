import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/resources/$resourceId')({
  component: Resource,
})

function Resource() {
  const { resourceId } = Route.useParams()
  return <div className="p-6">Resource ID: {resourceId}</div>
}

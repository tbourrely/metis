import { createFileRoute } from '@tanstack/react-router'
import ResourceView from '../../views/Resource'

export const Route = createFileRoute('/resources/$resourceId')({
  component: ResourceView,
})

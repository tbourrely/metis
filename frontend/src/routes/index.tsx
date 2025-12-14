import { createFileRoute } from '@tanstack/react-router'
import Home from '../views/home'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return <Home />
}

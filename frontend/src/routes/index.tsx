import { createFileRoute } from '@tanstack/react-router'
import Home from '../views/Home'
import { z } from 'zod';

export const Route = createFileRoute('/')({
  component: Index,
  validateSearch: z.object({
    page: z.number().default(1),
    search: z.string().default(''),
    hideRead: z.boolean().default(false),
  }),
})

function Index() {
  return <Home />
}

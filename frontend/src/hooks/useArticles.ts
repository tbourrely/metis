import { useState } from 'react'

type Article = { id: number; title: string; author: string; read?: boolean }

export default function useArticles() {
  const [articles, setArticles] = useState<Article[]>([
    { id: 1, title: 'Understanding React', author: 'Alice Johnson' },
    { id: 2, title: 'Tailwind Tips', author: 'Bob Smith' },
    { id: 3, title: 'State Management', author: 'Carol Lee' },
    { id: 4, title: 'TypeScript Basics', author: 'David Kim' },
    { id: 5, title: 'Testing with Vitest', author: 'Eve Martinez' },
    { id: 6, title: 'Deploying with Vite', author: 'Frank Zhao' },
  ])

  const handleDelete = (id: number) => setArticles((prev) => prev.filter((a) => a.id !== id))
  const handleToggleRead = (id: number) => setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, read: !a.read } : a)))

  return { articles, handleDelete, handleToggleRead }
}

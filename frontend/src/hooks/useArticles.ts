import { useState } from 'react'
import type { Article } from '../types/article'

type ArticleWithState = Article & { read?: boolean }

export default function useArticles() {
  const [articles, setArticles] = useState<ArticleWithState[]>([
    { id: '1', name: 'Understanding React', type: 'document', source: { name: 'Alice Johnson', url: '' }, createdAt: new Date().toISOString() },
    { id: '2', name: 'Tailwind Tips', type: 'document', source: { name: 'Bob Smith', url: '' }, createdAt: new Date().toISOString() },
    { id: '3', name: 'State Management', type: 'document', source: { name: 'Carol Lee', url: '' }, createdAt: new Date().toISOString() },
    { id: '4', name: 'TypeScript Basics', type: 'document', source: { name: 'David Kim', url: '' }, createdAt: new Date().toISOString() },
    { id: '5', name: 'Testing with Vitest', type: 'document', source: { name: 'Eve Martinez', url: '' }, createdAt: new Date().toISOString() },
    { id: '6', name: 'Deploying with Vite', type: 'document', source: { name: 'Frank Zhao', url: '' }, createdAt: new Date().toISOString() },
  ])

  const handleDelete = (id: string) => setArticles((prev) => prev.filter((a) => a.id !== id))
  const handleToggleRead = (id: string) =>
    setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, read: !a.read } : a)))

  return { articles, handleDelete, handleToggleRead }
}

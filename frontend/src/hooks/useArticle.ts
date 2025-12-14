import { useState } from 'react'

export type Article = { id: string; title: string; author: string; html: string }

// Hook to provide article data and actions (mocked for now)
export default function useArticle() {
  const id = typeof window !== 'undefined' ? (window.location.pathname.split('/').pop() || '') : ''

  const mockArticles: Record<string, Article> = {
    '1': {
      id: '1',
      title: 'Understanding React',
      author: 'Alice Johnson',
      html: '<p>This article explains the fundamentals of React including components, state and props.</p><p>It is safe to simulate HTML content for now.</p>',
    },
    '2': {
      id: '2',
      title: 'Tailwind Tips',
      author: 'Bob Smith',
      html: '<p>Tailwind makes styling faster by providing utility classes. Here are some tips...</p>',
    },
  }

  const article = mockArticles[id] || { id, title: `Article ${id}`, author: 'Unknown', html: '<p>No content available.</p>' }

  const [read, setRead] = useState(false)

  const toggleRead = () => setRead((r) => !r)
  const remove = () => {
    // simulate deletion
    window.location.href = '/'
  }

  return { id, article, read, toggleRead, remove }
}

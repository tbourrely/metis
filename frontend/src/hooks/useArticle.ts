import { useState } from 'react'
import type { Article } from '../types/article'

// Hook to provide article data and actions (mocked for now)
export default function useArticle() {
  const id = typeof window !== 'undefined' ? window.location.pathname.split('/').pop() || '' : ''

  const mockArticles: Record<string, Article> = {
    '1': {
      id: '1',
      name: 'Understanding React',
      type: 'document',
      source: { name: 'Alice Johnson', url: '' },
      createdAt: new Date().toISOString(),
    },
    '2': {
      id: '2',
      name: 'Tailwind Tips',
      type: 'document',
      source: { name: 'Bob Smith', url: '' },
      createdAt: new Date().toISOString(),
    },
  }

  const mockContent: Record<string, string> = {
    '1': '<p>This article explains the fundamentals of React including components, state and props.</p><p>It is safe to simulate HTML content for now.</p>',
    '2': '<p>Tailwind makes styling faster by providing utility classes. Here are some tips...</p>',
  }

  const article: Article = mockArticles[id] || { id, name: `Article ${id}`, type: 'document', source: { name: 'Unknown', url: '' }, createdAt: new Date().toISOString() }
  const content = mockContent[id] || '<p>No content available.</p>'

  const [read, setRead] = useState(false)

  const toggleRead = () => setRead((r) => !r)
  const remove = () => {
    // simulate deletion
    window.location.href = '/'
  }

  return { id, article, content, read, toggleRead, remove }
}

import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import ArticlesGrid from '../components/ArticlesGrid'
import ArticleMenu from '../components/ArticleMenu'
import useArticles from '../hooks/useArticles'

function Home() {
  const { articles, handleDelete, handleToggleRead } = useArticles()
  const [menuInfo, setMenuInfo] = useState<{ id: number; top: number; left: number } | null>(null)

  useEffect(() => {
    const onDoc = () => setMenuInfo(null)
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const openMenuFor = (e: React.MouseEvent, articleId: number) => {
    e.preventDefault()
    e.stopPropagation()
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    setMenuInfo({ id: articleId, top: rect.bottom + window.scrollY + 4, left: rect.right + window.scrollX - 160 })
  }

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        <h3 className="text-xl font-semibold mb-4">Welcome Home, hey !</h3>
        <p className="mb-4">This is the home page of our application.</p>

        <ArticlesGrid articles={articles} onMenuOpen={openMenuFor} />

        <ArticleMenu menuInfo={menuInfo} onToggleRead={handleToggleRead} onDelete={handleDelete} articles={articles} />
      </main>
    </div>
  )
}

export default Home

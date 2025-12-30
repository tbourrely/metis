import { useEffect, useState } from 'react'

export type Source = { name: string; url: string }

export default function useSources() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    const fetchSources = async () => {
      setLoading(true)
      setError(null)
      try {
        const base = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'
        const res = await fetch(`${base}/v1/sources`, { signal: ac.signal })
        if (!res.ok) throw new Error(`Failed to fetch sources: ${res.status}`)
        const data = await res.json()
        if (Array.isArray(data)) setSources(data)
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchSources()
    return () => ac.abort()
  }, [])

  return { sources, loading, error }
}

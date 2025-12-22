import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import useUploadJson from '../features/upload/hooks/useUploadJson'
import * as z from 'zod'
import type { ImportError } from '../features/upload/types'

// Define the expected structure of the JSON file
const UrlsList = z.array(z.object({ url: z.string().url() }));

export default function UploadJson() {
  const [fileName, setFileName] = useState('')
  const [preview, setPreview] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [parsed, setParsed] = useState<string[] | null>(null)
  const [importErrors, setImportErrors] = useState<ImportError[] | null>(null)
  const [createdUrls, setCreatedUrls] = useState<string[] | null>(null)

  const { uploadJson, loading } = useUploadJson()

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setPreview('')
    setParsed(null)
    setSuccess('')
    setImportErrors(null)
    setCreatedUrls(null)

    const file = e.target.files && e.target.files[0]
    if (!file) return
    setFileName(file.name)

    if (!file.name.toLowerCase().endsWith('.json')) {
      setError('Please select a .json file')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const text = String(reader.result || '')
        const obj = JSON.parse(text)
        const parsedResult = UrlsList.safeParse(obj)
        if (!parsedResult.success) {
          setError('JSON does not match expected format (array of objects with "url" field)')
          return
        }
        setParsed(parsedResult.data.map(item => item.url))
        const fullPreview = JSON.stringify(obj, null, 2)
        const MAX_PREVIEW = 2000
        if (fullPreview.length > MAX_PREVIEW) {
          setPreview(fullPreview.slice(0, MAX_PREVIEW) + '\n\n... (truncated, total ' + fullPreview.length + ' chars)')
        } else {
          setPreview(fullPreview)
        }
      } catch {
        setError('Invalid JSON file')
      }
    }
    reader.onerror = () => setError('Failed to read file')
    reader.readAsText(file)
  }

  const send = async () => {
    setError('')
    setSuccess('')
    setImportErrors(null)
    setCreatedUrls(null)
    if (!parsed) {
      setError('No valid JSON to send')
      return
    }

    try {
      const result = await uploadJson(parsed)
      setSuccess('Uploaded successfully')
      setParsed(null)
      setPreview('')
      setFileName('')
      setImportErrors(result.errors && result.errors.length ? result.errors : null)
      setCreatedUrls(result.created && result.created.length ? result.created : null)
    } catch (err: unknown) {
      // check for importErrors prop on thrown error
      if (err && typeof err === 'object') {
        const maybe = err as { importErrors?: unknown }
        if (Array.isArray(maybe.importErrors) && maybe.importErrors.every(i => typeof i === 'object' && i !== null && 'url' in (i as Record<string, unknown>) && 'error' in (i as Record<string, unknown>))) {
          setImportErrors(maybe.importErrors as ImportError[])
          setError('Import returned errors')
          return
        }
      }
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg || 'Upload failed')
    }
  }

  return (
    <div className="flex h-full min-h-screen">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Upload JSON</h1>

        <div className="mb-4">
          <label className="block mb-2">Select a JSON file</label>
          <input type="file" accept=".json,application/json" onChange={onFileChange} />
          <div className="mt-2 text-sm text-gray-600">
            The JSON file should contain an array of objects with a "url" field, e.g.:<br />
            <code>{'[{"url": "https://example.com/doc1"}, {"url": "https://example.com/doc2"}]'}</code>
          </div>
        </div>

        {fileName && <div className="mb-4">Selected: <strong>{fileName}</strong></div>}

        {error && <div className="mb-4 text-red-600">{error}</div>}
        {success && <div className="mb-4 text-green-600">{success}</div>}

        {createdUrls && createdUrls.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 text-green-600">Created</label>
            <ul className="list-disc ml-6">
              {createdUrls.map((u, idx) => <li key={idx}>{u}</li>)}
            </ul>
          </div>
        )}

        {importErrors && importErrors.length > 0 && (
          <div className="mb-4">
            <label className="block mb-2 text-red-600">Import errors</label>
            <ul className="list-disc ml-6">
              {importErrors.map((ie, idx) => <li key={idx}><strong>{ie.url}:</strong> {ie.error}</li>)}
            </ul>
          </div>
        )}

        {preview && (
          <div className="mb-4">
            <label className="block mb-2">Preview</label>
            <pre className="bg-gray-100 p-3 rounded max-h-64 overflow-auto"><code>{preview}</code></pre>
          </div>
        )}

        <div className="flex items-center">
          <button onClick={send} disabled={loading || !parsed} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
            {loading ? 'Sending...' : 'Send to API'}
          </button>

          <button onClick={() => { setParsed(null); setPreview(''); setFileName(''); setError(''); setSuccess(''); setImportErrors(null); setCreatedUrls(null) }} className="ml-4 px-4 py-2 bg-gray-200 rounded">
            Clear
          </button>
        </div>
      </main>
    </div>
  )
}

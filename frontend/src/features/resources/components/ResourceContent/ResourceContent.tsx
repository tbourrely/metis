export default function ResourceContent({ html, read }: { html: string; read: boolean }) {
  return (
    <div className="mt-4 prose prose-xl max-w-none" style={{ opacity: read ? 0.8 : 1 }} dangerouslySetInnerHTML={{ __html: html }} />
  )
}

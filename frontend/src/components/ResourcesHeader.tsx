export default function ResourcesHeader({ hideRead, setHideRead }: { hideRead: boolean; setHideRead: (v: boolean) => void }) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Resources</h1>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={hideRead} onChange={(e) => setHideRead(e.target.checked)} />
        <span className="text-sm">Hide read resources</span>
      </label>
    </header>
  )
}

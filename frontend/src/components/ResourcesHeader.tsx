import CreateResourceForm from "./CreateResourceForm";

export default function ResourcesHeader({ hideRead, setHideRead, onCreated }: { hideRead: boolean; setHideRead: (v: boolean) => void, onCreated?: () => void }) {

  return (
    <header className="mb-4 flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Resources</h1>
        <label className="flex items-center">
          <input type="checkbox" checked={hideRead} onChange={(e) => setHideRead(e.target.checked)} />
          <span className="ml-2 text-sm">Hide read resources</span>
        </label>
      </div>

      <CreateResourceForm onCreated={onCreated} />

    </header>
  )
}

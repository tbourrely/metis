import CreateResourceForm from "../CreateResourceForm";
import { Route } from "../../../../routes";
import BurgerIcon from './icons/burger.svg?react'
import useSidebar from '../../../../hooks/useSidebar'

type ResourcesHeaderProps = {
  onCreated?: () => void;
}

export default function ResourcesHeader({ onCreated }: ResourcesHeaderProps) {
  const { search, hideRead } = Route.useSearch()
  const navigate = Route.useNavigate();
  const { toggle } = useSidebar()

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    navigate({
      search: (prev) => ({
        ...prev,
        search: query,
        page: 1, // Reset to first page on new search
      }),
    });
  }

  return (
    <header className="mb-4 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2" aria-label="Toggle menu" onClick={() => toggle()}>
            <BurgerIcon width={20} height={20} />
          </button>

          <h1 className="text-2xl font-semibold">Resources</h1>
        </div>

        <label className="flex items-center">
          <input type="checkbox" checked={hideRead} onChange={() => {
            const next = !hideRead;
            try { localStorage.setItem('hideRead', String(next)); } catch { /* ignore */ }
            navigate({ search: (prev) => ({ ...prev, hideRead: next }) });
          }} />
          <span className="ml-2 text-sm">Hide read resources</span>
        </label>
      </div>

      <CreateResourceForm onCreated={onCreated} />

      <hr className="my-4 border-stone-300" />

      <input type="text" placeholder="Search resources..." className="border border-stone-300 w-full rounded px-3 py-2" value={search} onChange={handleSearchChange} />
    </header>
  )
}

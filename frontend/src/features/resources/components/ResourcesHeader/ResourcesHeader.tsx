import CreateResourceForm from "../CreateResourceForm";
import { Route } from "../../../../routes";

type ResourcesHeaderProps = {
  onCreated?: () => void;
}

export default function ResourcesHeader({ onCreated }: ResourcesHeaderProps) {
  const { search, hideRead } = Route.useSearch()
  const navigate = Route.useNavigate();

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
        <h1 className="text-2xl font-semibold">Resources</h1>
        <label className="flex items-center">
          <input type="checkbox" checked={hideRead} onChange={() => navigate({ search: (prev) => ({ ...prev, hideRead: !hideRead }) })} />
          <span className="ml-2 text-sm">Hide read resources</span>
        </label>
      </div>

      <CreateResourceForm onCreated={onCreated} />

      <hr className="my-4 border-gray-300" />

      <input type="text" placeholder="Search resources..." className="border border-gray-300 w-full rounded px-3 py-2" value={search} onChange={handleSearchChange} />
    </header>
  )
}

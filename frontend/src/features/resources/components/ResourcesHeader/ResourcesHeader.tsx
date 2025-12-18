import { useState } from "react";
import CreateResourceForm from "../CreateResourceForm";

type ResourcesHeaderProps = {
  hideRead: boolean;
  setHideRead: (v: boolean) => void;
  onCreated?: () => void;
  onSearch?: (query: string) => void;
}

export default function ResourcesHeader({ hideRead, setHideRead, onCreated, onSearch }: ResourcesHeaderProps) {

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  }

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

      <hr className="my-4 border-gray-300" />

      <input type="text" placeholder="Search resources..." className="border border-gray-300 w-full rounded px-3 py-2" value={searchQuery} onChange={handleSearchChange} />
    </header>
  )
}

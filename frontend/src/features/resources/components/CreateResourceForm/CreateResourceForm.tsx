import { useState, type FormEvent } from "react";
import useCreateResource from "../../hooks/useCreateResource";

export default function CreateResourceForm({ onCreated }: { onCreated?: () => void }) {
  const { createResource, error } = useCreateResource();
  const [url, setUrl] = useState<string>("");
  const [created, setCreated] = useState<boolean>(false);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const url = formData.get("url")?.toString();
    if (!url) return;
    try {
      await createResource(url);
      setCreated(true);
      setUrl("");
      onCreated?.();
    } catch (err) {
      console.error("Failed to create resource:", err);
    }
  };

  return (<>
    <form className="mt-4 flex gap-2" onSubmit={save}>
      <input id="url" name="url" type="url" placeholder="url" value={url} onChange={(e) => setUrl(e.target.value)} className={`border rounded px-3 py-1 ${error ? 'border-red-700' : 'border-gray-300'}`} />
      <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Add</button>
    </form>

    {error && <p className="text-red-700 mt-2">Failed to create resource</p>}

    {created && <p className="text-green-700 mt-2">Resource created successfully!</p>}
  </>);
}

import { useState } from "react";
import type { ImportDTO, ImportError, ImportResult } from "../types";

export default function useUploadJson() {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const parseImportErrors = (json: unknown): ImportError[] | null => {
    if (!json || typeof json !== "object") return null;
    const asObj = json as Record<string, unknown>;
    const msg = asObj["message"] as Record<string, unknown> | undefined;
    const maybeErrors = msg ? msg["errors"] : asObj["errors"];
    if (Array.isArray(maybeErrors)) return maybeErrors as ImportError[];
    return null;
  };

  const uploadJson = async (urls: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const base = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000";

      const payload: ImportDTO = { urls };

      const res = await fetch(`${base}/v1/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);

      const importErrors = parseImportErrors(json) ?? [];

      if (!res.ok) {
        if (importErrors.length) {
          const errObj = new Error("Import failed with errors") as Error & { importErrors?: ImportError[] };
          errObj.importErrors = importErrors;
          setError(errObj);
          throw errObj;
        }
        throw new Error(`Failed to import: ${res.statusText || res.status}`);
      }

      const created = Array.isArray((json as Record<string, unknown>)?.created) ? ((json as Record<string, unknown>).created as string[]) : [];
      const result: ImportResult = { created, errors: importErrors };
      return result;
    } catch (err: unknown) {
      const e = err instanceof Error ? err : new Error(String(err));
      setError(e);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { uploadJson, loading, error };
}

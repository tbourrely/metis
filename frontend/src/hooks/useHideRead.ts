import { useEffect, useState } from "react";

export default function useHideRead(initial = true) {
  const [hideRead, setHideRead] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem("hideRead");
      return v == null ? initial : v === "true";
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("hideRead", String(hideRead));
    } catch {
      // ignore
    }
  }, [hideRead]);

  return [hideRead, setHideRead] as const;
}

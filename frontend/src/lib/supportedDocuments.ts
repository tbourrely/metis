export function isPdf(url: string): boolean {
  try {
    const { pathname } = new URL(url);
    const lastSegment = pathname.split("/").pop() ?? "";
    // Match explicit .pdf extension
    if (lastSegment.toLowerCase().endsWith(".pdf")) return true;
    // Match URLs where the path segment is purely an identifier with no extension
    // and a parent path component is "pdf" (e.g. arxiv.org/pdf/2505.18397)
    const segments = pathname.split("/").filter(Boolean);
    const pdfSegmentIndex = segments.findIndex((s) => s.toLowerCase() === "pdf");
    if (pdfSegmentIndex !== -1 && pdfSegmentIndex < segments.length - 1) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

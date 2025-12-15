// FIXME: this is a temporary implementation. Replace with a more robust solution later.
export function isPdf(url: string): boolean {
  const supportedDocuments = ["pdf"];
  const extension = url.split(".").pop();
  if (!extension) return false;
  return supportedDocuments.includes(extension.toLowerCase());
}

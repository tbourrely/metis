type ResourceContentHtmlProps = {
  html: string;
  read: boolean;
};

export default function ResourceContentHtml({ html, read }: ResourceContentHtmlProps) {
  return (
    <div className="mt-4 prose prose-xl max-w-none" style={{ opacity: read ? 0.8 : 1 }} dangerouslySetInnerHTML={{ __html: html }} />
  )
}

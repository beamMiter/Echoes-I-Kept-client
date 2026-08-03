// Shared by PostDetailPage (the real rendered post) and ArticleForm's preview
// toggle, so what an author previews while writing matches what readers get.
export function toMarkdownContent(content) {
  if (!content) return null

  return content.replace(/(^|\n)(\d+\.\s[^\n]+)/g, '$1## $2')
}

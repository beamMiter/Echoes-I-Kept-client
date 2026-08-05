// Stored as one paragraph per array entry (matches posts.author_bio, which
// this gets snapshotted into on post creation) — a blank line in a textarea
// is how an author splits their bio into paragraphs.
export function bioTextToParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

export function bioParagraphsToText(paragraphs) {
  return (paragraphs || []).join('\n\n')
}

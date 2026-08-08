// The introduction's hard cap. The textarea enforces it via maxLength, but
// that only constrains typing — anything written to form state programmatically
// (an accepted AI suggestion, say) has to clamp against this itself.
export const DESCRIPTION_MAX_LENGTH = 120

export const emptyArticleForm = {
  title: '',
  category: '',
  image: '',
  detailImage: '',
  // No form control edits this — it's carried read-only so the preview crops
  // the hero the same way the published page will. Without it the preview
  // always fell back to 'center' while PostDetailPage honoured the stored
  // value, which is exactly the drift the shared ArticleContent exists to stop.
  detailImagePosition: '',
  description: '',
  content: '',
  artist: '',
  bestPick: '',
  spotifyUrl: '',
}

export function getArticleForm(article) {
  if (!article) return emptyArticleForm

  return {
    title: article.title,
    category: article.category,
    image: article.image,
    detailImage: article.detailImage || '',
    detailImagePosition: article.detailImagePosition || '',
    description: article.description,
    content: article.content,
    artist: article.artist || '',
    bestPick: article.bestPick || '',
    spotifyUrl: article.spotifyUrl || '',
  }
}

export function validateArticleForm(form) {
  const errors = {}

  if (!form.title.trim()) errors.title = 'Title is required.'
  if (!form.category.trim()) errors.category = 'Category is required.'
  if (!form.image.trim()) errors.image = 'Thumbnail image is required.'
  if (!form.description.trim()) errors.description = 'Introduction is required.'
  if (!form.content.trim()) errors.content = 'Content is required.'
  if (!form.artist.trim()) errors.artist = 'Artist is required.'
  if (!form.bestPick.trim()) errors.bestPick = 'Best pick (song title) is required.'

  return errors
}

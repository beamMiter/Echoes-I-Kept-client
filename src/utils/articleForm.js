export const emptyArticleForm = {
  title: '',
  category: '',
  image: '',
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

export const emptyArticleForm = {
  title: '',
  category: '',
  image: '',
  description: '',
  content: '',
}

export function getArticleForm(article) {
  if (!article) return emptyArticleForm

  return {
    title: article.title,
    category: article.category,
    image: article.image,
    description: article.description,
    content: article.content,
  }
}

export function validateArticleForm(form) {
  const errors = {}

  if (!form.title.trim()) errors.title = 'Title is required.'
  if (!form.category.trim()) errors.category = 'Category is required.'
  if (!form.image.trim()) errors.image = 'Thumbnail image is required.'
  if (!form.description.trim()) errors.description = 'Introduction is required.'
  if (!form.content.trim()) errors.content = 'Content is required.'

  return errors
}

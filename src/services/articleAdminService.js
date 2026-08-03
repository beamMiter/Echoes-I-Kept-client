import { mockPosts } from '../data/mockPosts'
import { SITE_AUTHOR_AVATAR } from '../data/mockUsers'

const STORAGE_KEY = 'adminArticles'

const LEGACY_SEED_TITLES = new Set([
  'Understanding Cat Behavior: Why Your Feline Friend Acts the Way They Do',
  'The Fascinating World of Cats: Why We Love Them',
])

const LEGACY_ARTIST_TAB_NAMES = new Set([
  'Billie Eilish',
  'Charlie Puth',
  'The Neighbourhood',
  'Taylor Swift',
  'Katy Perry',
  'The Weeknd',
])

function isLegacySeed(articles) {
  return articles.some(
    (article) =>
      LEGACY_SEED_TITLES.has(article.title) ||
      article.category === 'Cat' ||
      LEGACY_ARTIST_TAB_NAMES.has(article.category),
  )
}

function toAdminArticle(post) {
  return {
    ...post,
    status: post.status || 'published',
    updatedAt: post.updatedAt || post.date,
  }
}

function mergeDetailImagesFromMock(articles) {
  return articles.map((article) => {
    const mock = mockPosts.find((post) => post.id === article.id)
    if (!mock) return article

    return {
      ...article,
      artist: mock.artist || article.artist,
      category: mock.category || article.category,
      image: mock.image,
      detailImage: mock.detailImage,
      detailImagePosition:
        mock.detailImagePosition ?? article.detailImagePosition,
      author: mock.author,
      authorAvatar: mock.authorAvatar,
      authorBio: mock.authorBio,
    }
  })
}

export function getAdminArticles() {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored) {
    try {
      const articles = JSON.parse(stored)
      if (Array.isArray(articles) && !isLegacySeed(articles)) {
        return mergeDetailImagesFromMock(articles)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const initialArticles = mockPosts.map(toAdminArticle)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialArticles))
  return initialArticles
}

export function hasAdminArticleStore() {
  return Boolean(localStorage.getItem(STORAGE_KEY))
}

export function saveAdminArticles(articles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles))
}

export function getPublishedAdminArticles() {
  return getAdminArticles().filter((article) => article.status === 'published')
}

export function getPublishedAdminArticleById(id) {
  const numericId = typeof id === 'string' ? Number(id) : id
  return (
    getPublishedAdminArticles().find((article) => article.id === numericId) ||
    null
  )
}

export function getPublishedAdminArticlesByCategory(
  category,
  page = 1,
  limit = 6,
) {
  const publishedArticles = getPublishedAdminArticles()
  const filtered =
    category === 'Highlight'
      ? publishedArticles
      : publishedArticles.filter((article) => article.category === category)
  const start = (page - 1) * limit
  const paginated = filtered.slice(start, start + limit)

  return {
    posts: paginated,
    currentPage: page,
    totalPages: Math.ceil(filtered.length / limit) || 1,
  }
}

export function searchPublishedAdminArticles(keyword) {
  const lower = keyword.trim().toLowerCase()
  if (!lower) return []

  return getPublishedAdminArticles().filter(
    (article) =>
      article.title.toLowerCase().includes(lower) ||
      article.description.toLowerCase().includes(lower) ||
      article.category?.toLowerCase().includes(lower) ||
      article.artist?.toLowerCase().includes(lower) ||
      article.bestPick?.toLowerCase().includes(lower) ||
      article.author?.toLowerCase().includes(lower),
  )
}

export function createAdminArticle(form, status) {
  const today = new Date().toISOString().slice(0, 10)

  return {
    id: Date.now(),
    image: form.image,
    category: form.category,
    title: form.title,
    description: form.description,
    authorId: 2,
    author: 'Techin B.',
    authorAvatar: SITE_AUTHOR_AVATAR,
    authorBio: [
      'I write about the artists whose music stays with me, from polished pop and alternative moods to after-dark R&B.',
      'Each article begins with the artist and ends with my best pick: the song I keep returning to and why it matters to me.',
    ],
    date: today,
    content: form.content,
    status,
    updatedAt: new Date().toISOString(),
  }
}

export function updateAdminArticle(article, form, status) {
  return {
    ...article,
    image: form.image,
    category: form.category,
    title: form.title,
    description: form.description,
    content: form.content,
    status,
    updatedAt: new Date().toISOString(),
  }
}

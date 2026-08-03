import { mockCategories } from '../data/mockPosts'

const CATEGORY_STORAGE_KEY = 'adminCategories'

function toAdminCategory(category) {
  return {
    id: category.id,
    name: category.name,
    updatedAt: category.updatedAt || new Date().toISOString(),
  }
}

function parseStoredCategories() {
  try {
    return JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY) || 'null')
  } catch {
    localStorage.removeItem(CATEGORY_STORAGE_KEY)
    return null
  }
}

function normalizeName(name) {
  return name.trim()
}

const MUSIC_GENRES = new Set(['Pop', 'Alternative', 'R&B'])

const LEGACY_ARTIST_TAB_NAMES = new Set([
  'Billie Eilish',
  'Charlie Puth',
  'The Neighbourhood',
  'Taylor Swift',
  'Katy Perry',
  'The Weeknd',
])

function isLegacySeed(categories) {
  return (
    Array.isArray(categories) &&
    categories.some(
      (category) =>
        category.name === 'Cat' ||
        LEGACY_ARTIST_TAB_NAMES.has(category.name) ||
        !MUSIC_GENRES.has(category.name),
    )
  )
}

function createCategoryError(message) {
  return new Error(message)
}

export function getAdminCategories() {
  const stored = parseStoredCategories()

  if (Array.isArray(stored) && !isLegacySeed(stored)) return stored

  const initialCategories = mockCategories.map(toAdminCategory)
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(initialCategories))
  return initialCategories
}

export function hasAdminCategoryStore() {
  return Boolean(localStorage.getItem(CATEGORY_STORAGE_KEY))
}

export function saveAdminCategories(categories) {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories))
}

export function createAdminCategory(form) {
  const name = normalizeName(form.name)

  if (!name) {
    throw createCategoryError('Category name is required.')
  }

  const categories = getAdminCategories()

  if (
    categories.some(
      (category) => category.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw createCategoryError('Category name already exists.')
  }

  return {
    id: Date.now(),
    name,
    updatedAt: new Date().toISOString(),
  }
}

export function updateAdminCategory(category, form, categories) {
  const name = normalizeName(form.name)

  if (!name) {
    throw createCategoryError('Category name is required.')
  }

  if (
    categories.some(
      (item) =>
        item.id !== category.id && item.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw createCategoryError('Category name already exists.')
  }

  return {
    ...category,
    name,
    updatedAt: new Date().toISOString(),
  }
}

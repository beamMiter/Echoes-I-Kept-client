import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ImageOff } from 'lucide-react'
import AuthorSidebar from './AuthorSidebar'
import { getCategoryTextStyles } from '../utils/categoryStyles'

// Single source of truth for "what an article looks like" — PostDetailPage
// (the real, published view) and ArticlePreviewDialog (the draft preview)
// both render through this component instead of keeping two hand-maintained
// copies of the same markup in sync. `placeholder` toggles the fallback
// copy/empty states a draft can be in (no cover image yet, empty title...)
// that a published post can never actually hit.
function ArticleContent({
  category,
  dateLabel,
  title,
  description,
  content,
  heroImage,
  heroImagePosition = 'center',
  authorName,
  authorBio = [],
  authorAvatar,
  placeholder = false,
  headerActions,
  children,
}) {
  const [loadedHeroImage, setLoadedHeroImage] = useState(null)
  const [erroredHeroImage, setErroredHeroImage] = useState(null)
  const heroImageLoaded = loadedHeroImage === heroImage
  const heroImageErrored = erroredHeroImage === heroImage

  return (
    <div className="container mx-auto max-w-7xl space-y-8 pb-20 md:px-8 md:pb-28 md:pt-8 lg:pt-16">
      <div className="space-y-4 md:px-4">
        {heroImage ? (
          <div className="relative h-[260px] w-full overflow-hidden bg-[#EFEEEB] sm:h-[340px] md:h-[587px] md:rounded-lg">
            {!heroImageLoaded && !heroImageErrored && (
              <div className="skeleton-shimmer absolute inset-0 z-10" aria-hidden="true" />
            )}
            {heroImageErrored ? (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageOff className="h-10 w-10" strokeWidth={1.5} aria-hidden="true" />
                <span className="text-sm">Image unavailable</span>
              </div>
            ) : (
              <img
                src={heroImage}
                alt={title}
                draggable={false}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  heroImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ objectPosition: heroImagePosition }}
                onLoad={() => setLoadedHeroImage(heroImage)}
                onError={() => setErroredHeroImage(heroImage)}
              />
            )}
          </div>
        ) : (
          placeholder && (
            <div className="flex h-[260px] w-full items-center justify-center bg-[#EFEEEB] text-sm text-muted-foreground sm:h-[340px] md:h-[400px] md:rounded-lg">
              No cover image yet
            </div>
          )
        )}
      </div>

      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="space-y-8 xl:w-3/4">
          <article className="px-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={`shrink-0 text-sm font-semibold ${getCategoryTextStyles(category)}`}
                >
                  {category || (placeholder ? 'Uncategorized' : '')}
                </span>
                {dateLabel && (
                  <span className="shrink-0 text-sm text-muted-foreground">{dateLabel}</span>
                )}
              </div>
              {headerActions}
            </div>

            <h1 className="font-display text-3xl font-medium">
              {title || (placeholder ? 'Untitled article' : '')}
            </h1>
            <p className="mt-4 mb-10 text-muted-foreground">
              {description || (placeholder ? 'No introduction written yet.' : '')}
            </p>

            <div className="markdown font-sans text-[15px] leading-[1.55]">
              {content ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                placeholder && <p className="text-muted-foreground">Nothing written yet.</p>
              )}
            </div>
          </article>

          <div className="px-4 xl:hidden">
            <AuthorSidebar name={authorName} profilePic={authorAvatar} bio={authorBio} />
          </div>

          {children}
        </div>

        <div className="hidden xl:block xl:w-1/4">
          <div className="sticky top-32">
            <AuthorSidebar name={authorName} profilePic={authorAvatar} bio={authorBio} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ArticleContent

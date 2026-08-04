import { Copy, Heart } from 'lucide-react'
import { toast } from 'sonner'
import BrandIcon from './ui/BrandIcon'

function ArticleLikeShare({ likesAmount, onLike }) {
  const shareUrl = encodeURI(window.location.href)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Copied to clipboard', {
        description: 'This article link is ready to share.',
      })
    } catch {
      toast.error('Unable to copy link', {
        description: 'Please copy the URL from your browser instead.',
      })
    }
  }

  return (
    <div className="md:px-4">
      <div className="bg-[#EFEEEB] py-4 px-4 md:rounded-sm flex flex-col space-y-4 md:gap-16 md:flex-row md:items-center md:space-y-0 md:justify-between mb-10">
        <button
          type="button"
          onClick={onLike}
          className="group flex items-center justify-center gap-2 rounded-md border border-foreground bg-white px-11 py-3 text-[#4A4945] transition-colors hover:border-muted-foreground hover:text-muted-foreground"
        >
          <Heart className="h-5 w-5 transition-colors" />
          <span className="font-medium transition-colors">{likesAmount}</span>
        </button>

        <div className="flex items-center gap-4 md:gap-5">
          <button
            type="button"
            onClick={handleCopy}
            className="group flex flex-1 items-center justify-center gap-2 rounded-md border border-foreground bg-white px-11 py-3 text-[#4A4945] transition-colors hover:border-muted-foreground hover:text-muted-foreground"
          >
            <Copy className="h-5 w-5 transition-colors" />
            <span className="font-medium transition-colors">Copy</span>
          </button>

          <a
            href={`https://www.facebook.com/share.php?u=${shareUrl}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#4A4945] transition-opacity hover:opacity-50"
            aria-label="Share on Facebook"
          >
            <BrandIcon
              src="/figma-assets/Facebook_black.svg"
              className="h-10 w-10"
            />
          </a>

          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#4A4945] transition-opacity hover:opacity-50"
            aria-label="Share on LinkedIn"
          >
            <BrandIcon
              src="/figma-assets/LinkedIN_black.svg"
              className="h-10 w-10"
            />
          </a>

          <a
            href={`https://www.twitter.com/share?&url=${shareUrl}`}
            target="_blank"
            rel="noreferrer"
            className="text-[#4A4945] transition-opacity hover:opacity-50"
            aria-label="Share on Twitter"
          >
            <BrandIcon
              src="/figma-assets/Twitter_black.svg"
              className="h-10 w-10"
            />
          </a>
        </div>
      </div>
    </div>
  )
}

export default ArticleLikeShare

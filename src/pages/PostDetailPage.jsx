import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { FileQuestion, ImageOff } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import AuthorSidebar from "../components/AuthorSidebar";
import ArticleLikeShare from "../components/ArticleLikeShare";
import ArticleComments from "../components/ArticleComments";
import AuthRequiredDialog from "../components/ui/AuthRequiredDialog";
import {
  getMockPostById,
  getMockLikesAmount,
  getMockCommentsByPostId,
  getPostHeroImage,
  getPostHeroImagePosition,
} from "../data/mockPosts";
import { fetchPublishedPostById } from "../services/postsService";
import { toMarkdownContent } from "../utils/markdown";
import { useAuth } from "../context/useAuth";
import { getCategoryTextStyles } from "../utils/categoryStyles";

const pageShellClassName = "no-image-drag flex flex-col min-h-screen";

function preventImageDrag(e) {
  if (e.target instanceof HTMLImageElement) e.preventDefault();
}

function PostDetailPage() {
  const { postId } = useParams();
  const detailImageSource = useMemo(() => getMockPostById(postId), [postId]);

  return (
    <div className={pageShellClassName} onDragStart={preventImageDrag}>
      <Navbar />
      <PostDetailBody
        key={postId}
        postId={postId}
        detailImageSource={detailImageSource}
      />
      <Footer />
    </div>
  );
}

function PostDetailBody({ postId, detailImageSource }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const resolvePost = () => {
      return fetchPublishedPostById(postId).catch(() => detailImageSource);
    };

    resolvePost().then((result) => {
      if (cancelled) return;
      setPost(result);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [postId, detailImageSource]);

  if (loading) {
    return (
      <main className="flex flex-grow items-center justify-center px-4">
        <LoadingSpinner padded={false} />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="flex flex-grow items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#EFEEEB] text-[#7A746E]">
            <FileQuestion className="h-7 w-7" aria-hidden="true" />
          </div>
          <h1 className="font-display text-3xl font-medium">
            Article not found
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            The article you are looking for is not available or has been
            removed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <PostDetailContent
      post={post}
      postId={postId}
      detailImageSource={detailImageSource}
    />
  );
}

function PostDetailContent({ post, postId, detailImageSource }) {
  const { state, isAuthenticated } = useAuth();
  const content = post.content || "";
  const currentUser = state.user;
  const [likesAmount, setLikesAmount] = useState(() =>
    getMockLikesAmount(postId),
  );
  const [comments, setComments] = useState(() =>
    getMockCommentsByPostId(postId),
  );
  const [loadedHeroImage, setLoadedHeroImage] = useState(null);
  const [erroredHeroImage, setErroredHeroImage] = useState(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const requireLogin = () => {
    if (isAuthenticated) return true;

    setLoginDialogOpen(true);
    return false;
  };

  const handleLike = () => {
    if (!requireLogin()) return;

    setLikesAmount((prev) => prev + 1);
  };

  const handleAddComment = (text) => {
    if (!requireLogin()) return false;

    const newComment = {
      id: Date.now(),
      name: currentUser?.name || "You",
      profile_pic: currentUser?.profilePic || "/author-image.jpeg",
      comment_text: text,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [newComment, ...prev]);
    return true;
  };

  const dateString = post.date;
  const heroImage = getPostHeroImage(post, detailImageSource);
  const heroImagePosition = getPostHeroImagePosition(post, detailImageSource);
  const heroImageLoaded = loadedHeroImage === heroImage;
  const heroImageErrored = erroredHeroImage === heroImage;
  const author = {
    name: post.author,
    profilePic: post.authorAvatar,
    bio: post.authorBio,
  };

  return (
    <main className="flex-grow">
        <div className="max-w-7xl mx-auto space-y-8 container md:px-8 pb-20 md:pb-28 md:pt-8 lg:pt-16">
          <div className="space-y-4 md:px-4">
            {heroImage && (
              <div className="relative h-[260px] w-full overflow-hidden bg-[#EFEEEB] md:rounded-lg sm:h-[340px] md:h-[587px]">
                {!heroImageLoaded && !heroImageErrored && (
                  <div
                    className="skeleton-shimmer absolute inset-0 z-10"
                    aria-hidden="true"
                  />
                )}
                {heroImageErrored ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageOff className="h-10 w-10" strokeWidth={1.5} aria-hidden="true" />
                    <span className="text-sm">Image unavailable</span>
                  </div>
                ) : (
                  <img
                    src={heroImage}
                    alt={post.title}
                    draggable={false}
                    className={`h-full w-full object-cover transition-opacity duration-300 ${
                      heroImageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    style={{ objectPosition: heroImagePosition }}
                    onLoad={() => setLoadedHeroImage(heroImage)}
                    onError={() => setErroredHeroImage(heroImage)}
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col xl:flex-row gap-6">
            <div className="xl:w-3/4 space-y-8">
              <article className="px-4">
                <div className="mb-2 flex items-center gap-3">
                  <span
                    className={`shrink-0 text-sm font-semibold ${getCategoryTextStyles(post?.category)}`}
                  >
                    {post?.category}
                  </span>
                  {dateString && (
                    <span className="shrink-0 text-sm text-muted-foreground">
                      {new Date(dateString).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl font-medium">{post?.title}</h1>
                <p className="mt-4 mb-10 text-muted-foreground">
                  {post?.description}
                </p>

                <div className="markdown font-sans text-[15px] leading-[1.55]">
                  <ReactMarkdown>{toMarkdownContent(content)}</ReactMarkdown>
                </div>
              </article>

              <div className="xl:hidden px-4">
                <AuthorSidebar {...author} />
              </div>

              <ArticleLikeShare likesAmount={likesAmount} onLike={handleLike} />

              <ArticleComments
                comments={comments}
                onAddComment={handleAddComment}
              />
            </div>

            <div className="hidden xl:block xl:w-1/4">
              <div className="sticky top-32">
                <AuthorSidebar {...author} />
              </div>
            </div>
          </div>
        </div>

        {loginDialogOpen && (
          <AuthRequiredDialog onClose={() => setLoginDialogOpen(false)} />
        )}
      </main>
  );
}

export default PostDetailPage;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";
import ArticleContent from "../components/ArticleContent";
import ArticleLikeShare from "../components/ArticleLikeShare";
import ArticleComments from "../components/ArticleComments";
import ArticleTranslate from "../components/ArticleTranslate";
import AuthRequiredDialog from "../components/ui/AuthRequiredDialog";
import { fetchPublishedPostById } from "../services/postsService";
import { fetchComments, createComment } from "../services/commentsService";
import { likePost, unlikePost } from "../services/likesService";
import { translatePost } from "../services/aiService";
import { useAuth } from "../context/useAuth";

const pageShellClassName = "no-image-drag flex flex-col min-h-screen";

function preventImageDrag(e) {
  if (e.target instanceof HTMLImageElement) e.preventDefault();
}

function PostDetailPage() {
  const { postId } = useParams();

  return (
    <div className={pageShellClassName} onDragStart={preventImageDrag}>
      <Navbar />
      <PostDetailBody key={postId} postId={postId} />
      <Footer />
    </div>
  );
}

function PostDetailBody({ postId }) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchPublishedPostById(postId)
      .then((result) => {
        if (cancelled) return;
        setPost(result);
      })
      .catch(() => {
        if (!cancelled) setPost(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

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

  return <PostDetailContent post={post} postId={postId} />;
}

function PostDetailContent({ post, postId }) {
  const { isAuthenticated } = useAuth();
  const content = post.content || "";
  const [likesAmount, setLikesAmount] = useState(post.likesCount || 0);
  const [liked, setLiked] = useState(Boolean(post.likedByMe));
  const [comments, setComments] = useState([]);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const [language, setLanguage] = useState("original");
  const [loadingLanguage, setLoadingLanguage] = useState(null);
  // Keyed by language code so switching back to one already fetched this
  // session (including "original") is instant and doesn't re-spend a quota
  // slot on a call the server would've served from its own cache anyway.
  const [translations, setTranslations] = useState({
    original: { title: post.title, description: post.description, content },
  });

  const handleSelectLanguage = async (code) => {
    if (code === language || loadingLanguage) return;

    if (translations[code]) {
      setLanguage(code);
      return;
    }

    // No login gate up front — anonymous readers can read a language other
    // readers already generated for free. The server only asks for a login
    // (LOGIN_REQUIRED) when this specific post/language isn't cached yet,
    // since generating a fresh translation is the part that costs money.
    setLoadingLanguage(code);
    try {
      const result = await translatePost(postId, code);
      setTranslations((prev) => ({ ...prev, [code]: result }));
      setLanguage(code);
    } catch (error) {
      if (error.code === "LOGIN_REQUIRED") {
        setLoginDialogOpen(true);
      } else {
        toast.error("Unable to translate this article", {
          description: error.error,
        });
      }
    } finally {
      setLoadingLanguage(null);
    }
  };

  useEffect(() => {
    let cancelled = false;

    fetchComments(postId)
      .then((result) => {
        if (!cancelled) setComments(result);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const requireLogin = () => {
    if (isAuthenticated) return true;

    setLoginDialogOpen(true);
    return false;
  };

  const handleLike = async () => {
    if (!requireLogin()) return;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesAmount((prev) => prev + (nextLiked ? 1 : -1));

    try {
      const result = nextLiked
        ? await likePost(postId)
        : await unlikePost(postId);
      setLikesAmount(result.likesCount);
      setLiked(result.liked);
    } catch {
      // Roll back the optimistic update — most likely cause is the like
      // state on the server already matched what we were toggling away
      // from (e.g. a second tab), so re-syncing beats leaving a wrong count.
      setLiked(!nextLiked);
      setLikesAmount((prev) => prev + (nextLiked ? -1 : 1));
    }
  };

  const handleAddComment = async (text) => {
    if (!requireLogin()) return false;

    const comment = await createComment(postId, text);
    setComments((prev) => [comment, ...prev]);
    toast.success("Comment posted");
    return true;
  };

  const dateString = post.date;
  const heroImage = post.detailImage || post.image || "";
  const heroImagePosition = post.detailImagePosition || "center";
  const dateLabel = dateString
    ? new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const displayed = translations[language];

  return (
    <main className="flex-grow">
      <ArticleContent
        category={post?.category}
        dateLabel={dateLabel}
        title={displayed.title}
        description={displayed.description}
        content={displayed.content}
        heroImage={heroImage}
        heroImagePosition={heroImagePosition}
        authorName={post.author}
        authorBio={post.authorBio}
        authorAvatar={post.authorAvatar}
        headerActions={
          <ArticleTranslate
            active={language}
            loadingLanguage={loadingLanguage}
            onSelect={handleSelectLanguage}
          />
        }
      >
        <ArticleLikeShare
          likesAmount={likesAmount}
          liked={liked}
          onLike={handleLike}
        />

        <ArticleComments
          comments={comments}
          onAddComment={handleAddComment}
        />
      </ArticleContent>

      {loginDialogOpen && (
        <AuthRequiredDialog onClose={() => setLoginDialogOpen(false)} />
      )}
    </main>
  );
}

export default PostDetailPage;

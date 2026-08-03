import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Loader2, Search, SearchX, X } from "lucide-react";
import ArticleCard from "./ArticleCard";
import ArticleCardSkeleton from "./ui/ArticleCardSkeleton";
import { mockCategories, searchMockPosts } from "../data/mockPosts";
import {
  getPublishedAdminArticlesByCategory,
  hasAdminArticleStore,
  searchPublishedAdminArticles,
} from "../services/articleAdminService";
import { fetchPublishedPosts } from "../services/postsService";
import { fetchCategories } from "../services/categoriesService";

const PAGE_SIZE = 6;
const SEARCH_MAX_LENGTH = 80;

function LatestArticles() {
  const navigate = useNavigate();

  const tabRefs = useRef({});
  const [tabIndicator, setTabIndicator] = useState({
    left: 0,
    width: 0,
  });

  const [selectedCategory, setSelectedCategory] = useState("Highlight");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const [useMockData, setUseMockData] = useState(false);

  const [categories, setCategories] = useState(mockCategories);
  const displayCategories = categories;
  const categoryKey = displayCategories.map((cat) => cat.name).join("|");

  useEffect(() => {
    let cancelled = false;

    fetchCategories()
      .then((data) => {
        if (!cancelled) setCategories(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchPosts = () => {
      if (useMockData || hasAdminArticleStore()) {
        return Promise.resolve(
          getPublishedAdminArticlesByCategory(selectedCategory, page, PAGE_SIZE),
        );
      }

      return fetchPublishedPosts({
        page,
        limit: PAGE_SIZE,
        category: selectedCategory,
      }).catch(() => {
        setUseMockData(true);
        return getPublishedAdminArticlesByCategory(
          selectedCategory,
          page,
          PAGE_SIZE,
        );
      });
    };

    fetchPosts().then((result) => {
      if (cancelled) return;

      setPosts((prev) =>
        page === 1 ? result.posts : [...prev, ...result.posts],
      );
      setHasMore(result.currentPage < result.totalPages);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [page, selectedCategory, useMockData]);

  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    let cancelled = false;

    const runSearch = () => {
      if (useMockData || hasAdminArticleStore()) {
        return Promise.resolve(
          hasAdminArticleStore()
            ? searchPublishedAdminArticles(trimmed)
            : searchMockPosts(trimmed),
        );
      }

      return fetchPublishedPosts({ search: trimmed, limit: 10 })
        .then((result) => result.posts)
        .catch(() => searchMockPosts(trimmed));
    };

    runSearch().then((results) => {
      if (!cancelled) setSearchResults(results);
    });

    return () => {
      cancelled = true;
    };
  }, [keyword, useMockData]);

  useLayoutEffect(() => {
    const updateIndicator = () => {
      const activeTab = tabRefs.current[selectedCategory];

      if (!activeTab) return;

      setTabIndicator({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [selectedCategory, categoryKey]);

  const handleCategoryChange = (category) => {
    if (selectedCategory === category) return;

    setSelectedCategory(category);
    setKeyword("");
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const isInitialLoading = loading && page === 1 && posts.length === 0;
  const isLoadingMore = loading && posts.length > 0;
  const visiblePosts = keyword.trim() ? searchResults : posts;
  const showSearchDropdown = searchOpen && Boolean(keyword.trim());

  const clearSearch = () => {
    setKeyword("");
    setLoading(false);
  };

  return (
    <section className="mx-auto mb-20 w-full max-w-[1040px] px-4 sm:px-6 lg:px-0">
      <div className="mb-10 rounded-[4px] bg-[#EFEEEB] px-4 py-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-5">
            <h2 className="text-xl font-display leading-none text-[#171717] font-medium md:border-r md:border-[#D7D3CE] md:pr-5">
              Latest articles
            </h2>

            <div className="relative w-full md:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={loading}
                className="h-10 w-full appearance-none rounded-[3px] border border-[#DEDBD6] bg-white px-3 pr-10 text-sm text-[#5F5A55] outline-none transition-colors focus:border-[#9A948E]"
              >
                <option value="Highlight">Highlight</option>
                {displayCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F8983]"
                aria-hidden="true"
              />
            </div>

            <div className="relative hidden h-10 items-center gap-5 md:flex">
              <span
                className={`absolute bottom-0 h-[2px] bg-[#171717] transition-[left,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  tabIndicator.width ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  left: `${tabIndicator.left}px`,
                  width: `${tabIndicator.width}px`,
                }}
              />

              <button
                ref={(node) => {
                  tabRefs.current.Highlight = node;
                }}
                type="button"
                onClick={() => handleCategoryChange("Highlight")}
                className={`relative h-10 text-sm font-medium transition-colors ${
                  selectedCategory === "Highlight"
                    ? "text-[#171717]"
                    : "text-[#6F6963] hover:text-[#2B2825]"
                }`}
              >
                Highlight
              </button>

              {displayCategories.map((cat) => (
                <button
                  key={cat.id}
                  ref={(node) => {
                    tabRefs.current[cat.name] = node;
                  }}
                  type="button"
                  onClick={() => handleCategoryChange(cat.name)}
                  className={`relative h-10 text-sm font-medium transition-colors ${
                    selectedCategory === cat.name
                      ? "text-[#171717]"
                      : "text-[#6F6963] hover:text-[#2B2825]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full md:max-w-[300px]">
            <div className="relative">
              {keyword ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-[#8F8983] transition-colors hover:text-[#1F1F1F]"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8F8983]" />
              )}

              <input
                type="text"
                placeholder="Search"
                value={keyword}
                maxLength={SEARCH_MAX_LENGTH}
                className="h-10 w-full rounded-[3px] border border-[#DEDBD6] bg-white px-3 pr-10 text-sm text-[#1F1F1F] outline-none transition-colors placeholder:text-[#8F8983] focus:border-[#9A948E]"
                onChange={(e) => {
                  const nextKeyword = e.target.value;

                  setKeyword(nextKeyword);
                  setLoading(false);
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => {
                  setTimeout(() => setSearchOpen(false), 200);
                }}
              />

              {showSearchDropdown && (
                <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-[3px] border border-[#DEDBD6] bg-white shadow-lg md:w-[420px]">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="border-b border-[#EFEEEB] px-3 py-2.5">
                        <p className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#7A746E]">
                          Related articles
                          <span className="shrink-0 tracking-normal text-[#8F8983]">
                            {searchResults.length} result
                            {searchResults.length > 1 ? "s" : ""}
                          </span>
                        </p>
                        <p className="mt-1 truncate text-xs text-[#8F8983]">
                          Search related to &quot;{keyword.trim()}&quot;
                        </p>
                      </div>
                      <div className="max-h-72 overflow-y-auto p-1">
                        {searchResults.map((post) => (
                          <button
                            key={post.id}
                            type="button"
                            className="block w-full rounded-[2px] px-3 py-2.5 text-left transition-colors hover:bg-[#EFEEEB] hover:text-black"
                            onClick={() => navigate(`/post/${post.id}`)}
                          >
                            <span className="block truncate text-sm font-medium text-[#2B2825]">
                              {post.title}
                            </span>
                            {post.description && (
                              <span className="mt-1 line-clamp-2 text-xs leading-5 text-[#7A746E]">
                                {post.description}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-start gap-3 px-3 py-4">
                      <SearchX
                        className="mt-0.5 h-4 w-4 shrink-0 text-[#8F8983]"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-medium text-[#2B2825]">
                          No matches found
                        </p>
                        <p className="mt-1 text-xs leading-5 text-[#7A746E]">
                          Try another artist, song, or category.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : visiblePosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
          {visiblePosts.map((post) => (
            <ArticleCard
              key={post.id}
              id={post.id}
              image={post.image}
              category={post.category}
              title={post.title}
              description={post.description}
              author={post.author}
              authorAvatar={post.authorAvatar}
              date={formatDate(post.date)}
            />
          ))}

          {isLoadingMore &&
            Array.from({ length: PAGE_SIZE }, (_, i) => (
              <ArticleCardSkeleton key={`loading-${i}`} />
            ))}
        </div>
      ) : (
        <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#EFEEEB] text-[#7A746E]">
            <SearchX className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="font-display text-2xl font-medium text-[#171717]">
            No articles found
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Try a different keyword or choose another category.
          </p>
        </div>
      )}

      {hasMore && !isInitialLoading && !keyword.trim() && (
        <div className="mt-20 text-center">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setPage((p) => p + 1);
            }}
            className={`inline-flex items-center justify-center gap-2 font-medium transition-colors ${
              loading ? "" : "underline hover:text-muted-foreground"
            }`}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Loading more..." : "View more"}
          </button>
        </div>
      )}
    </section>
  );
}

export default LatestArticles;

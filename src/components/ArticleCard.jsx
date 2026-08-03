import { Link } from "react-router-dom";
import { useState } from "react";
import { getCategoryTagStyles } from "../utils/categoryStyles";

function ArticleCard({
  id,
  image,
  category,
  title,
  description,
  author,
  authorAvatar = "/avatars/anime.jpg",
  date,
}) {
  const postPath = `/post/${id}`;
  const [loadedImage, setLoadedImage] = useState(null);
  const imageLoaded = loadedImage === image;

  return (
    <article className="flex flex-col gap-4">
      <Link
        to={postPath}
        className="relative block aspect-[1.65/1] overflow-hidden rounded-md"
      >
        {!imageLoaded && (
          <div
            className="skeleton-shimmer absolute inset-0 z-10"
            aria-hidden="true"
          />
        )}
        <img
          className={`h-full w-full object-cover transition-transform duration-300 hover:scale-105 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          src={image}
          alt={title}
          loading="lazy"
          onLoad={() => setLoadedImage(image)}
          onError={() => setLoadedImage(image)}
        />
        {category && (
          <span
            className={`absolute top-0 right-0 rounded-bl-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-md ring-1 ring-inset ${getCategoryTagStyles(category)}`}
          >
            {category}
          </span>
        )}
      </Link>

      <div className="flex flex-col gap-2">
        <Link to={postPath} className="group">
          <h2 className="font-display text-start text-xl font-medium leading-snug line-clamp-2 group-hover:underline">
            {title}
          </h2>
        </Link>

        <p className="text-[15px] leading-[1.55] text-muted-foreground line-clamp-3">
          {description}
        </p>

        <div className="flex items-center gap-2 pt-1 text-[13px] font-medium text-muted-foreground">
          <img
            className="h-8 w-8 rounded-full object-cover"
            src={authorAvatar}
            alt={author || "Author"}
          />
          <span className="text-foreground">{author || "Unknown author"}</span>
          <span className="text-border" aria-hidden="true">
            |
          </span>
          {date && <time dateTime={date}>{date}</time>}
        </div>
      </div>
    </article>
  );
}

export default ArticleCard;

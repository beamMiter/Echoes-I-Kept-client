function AuthorSidebar({ name, profilePic, bio }) {
  // A default parameter only fires on `undefined`, and these columns are
  // nullable — a null author_bio would reach `bio.length` below and blank the
  // whole article page, and a null author would render an empty heading with
  // no alt text on the avatar. Normalizing here closes both for every caller.
  const authorName = name || "Author";
  const bioParagraphs = Array.isArray(bio) ? bio : [];

  return (
    <div className="bg-[#EFEEEB] rounded-3xl p-6">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 shrink-0">
          <img
            src={profilePic || "/avatars/anime.jpg"}
            alt={authorName}
            draggable={false}
            className="object-cover w-16 h-16"
          />
        </div>
        <div>
          <p className="text-sm">Author</p>
          <h3 className="text-2xl font-bold">{authorName}</h3>
        </div>
      </div>

      <hr className="border-gray-300 mb-4" />

      <div className="text-muted-foreground space-y-4">
        {bioParagraphs.length > 0 ? (
          // Keyed by position, not text: nothing dedupes the paragraphs, and
          // two identical ones would collide on a text key and let React drop
          // a <p> on re-render. The list is static for a given bio anyway.
          bioParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
        ) : (
          <p className="italic">This author hasn't added a bio yet.</p>
        )}
      </div>
    </div>
  );
}

export default AuthorSidebar;

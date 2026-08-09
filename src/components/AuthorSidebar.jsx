function AuthorSidebar({ name = "Author", profilePic, bio }) {
  // A default parameter only fires on `undefined`, and the API can return a
  // null author_bio — which would reach `bio.length` below and blank the whole
  // article page. Normalizing here closes it for every caller at once.
  const bioParagraphs = Array.isArray(bio) ? bio : [];

  return (
    <div className="bg-[#EFEEEB] rounded-3xl p-6">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 shrink-0">
          <img
            src={profilePic || "/avatars/anime.jpg"}
            alt={name}
            draggable={false}
            className="object-cover w-16 h-16"
          />
        </div>
        <div>
          <p className="text-sm">Author</p>
          <h3 className="text-2xl font-bold">{name}</h3>
        </div>
      </div>

      <hr className="border-gray-300 mb-4" />

      <div className="text-muted-foreground space-y-4">
        {bioParagraphs.length > 0 ? (
          bioParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
        ) : (
          <p className="italic">This author hasn't added a bio yet.</p>
        )}
      </div>
    </div>
  );
}

export default AuthorSidebar;

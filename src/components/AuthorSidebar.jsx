function AuthorSidebar({
  name = "Techin B.",
  profilePic = '/avatars/anime.jpg',
  bio = [
    "I write about the artists whose music stays with me, from polished pop and alternative moods to after-dark R&B.",
    "Each article begins with the artist and ends with my best pick: the song I keep returning to and why it matters to me.",
  ],
}) {
  return (
    <div className="bg-[#EFEEEB] rounded-3xl p-6">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4 shrink-0">
          <img src={profilePic} alt={name} draggable={false} className="object-cover w-16 h-16" />
        </div>
        <div>
          <p className="text-sm">Author</p>
          <h3 className="text-2xl font-bold">{name}</h3>
        </div>
      </div>

      <hr className="border-gray-300 mb-4" />

      <div className="text-muted-foreground space-y-4">
        {bio.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

export default AuthorSidebar;

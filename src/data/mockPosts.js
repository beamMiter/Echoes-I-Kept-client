import { getMockUserById } from "./mockUsers";

export const mockCategories = [
  { id: 1, name: "Pop" },
  { id: 2, name: "Alternative" },
  { id: 3, name: "R&B" },
];

const rawMockPosts = [
  {
    id: 1,
    artist: "Billie Eilish",
    bestPick: "Birds of a Feather",
    spotifyUrl: "https://open.spotify.com/track/6dOtVTDdiauQNBQEDOtlAB",
    image: "/music-covers/Billie_Eilish.webp",
    detailImage: "/music-covers/Billie_Eilish_Wallpaper.webp",
    category: "Alternative",
    title: "Billie Eilish: Quiet Intensity and Birds of a Feather",
    description:
      "A personal look at Billie Eilish, the intimacy in her sound, and why Birds of a Feather is my best pick.",
    authorId: 2,
    date: "2026-06-20",
    content: `1. About Billie Eilish

Billie Eilish has a rare ability to make a huge pop song feel private. Her voice can be soft and close, but the emotion behind it never feels small. Alongside Finneas, she has built a sound that values atmosphere, unusual details, and honest feelings over predictable pop formulas.

2. What Makes Her Different

The thing I enjoy most about Billie is contrast. A restrained vocal can sit beside heavy production, and a vulnerable thought can become the center of a confident song. Her music works through headphones because every small sound feels intentional.

3. My Best Pick: Birds of a Feather

Birds of a Feather is my best Billie Eilish pick. It is warmer and more open than much of her darker material, yet it still carries the intimacy that makes her music recognizable. The melody feels immediate without losing its emotional weight.

4. Why It Stays With Me

I return to this song because it captures devotion without making the feeling complicated. It is bright, sincere, and easy to live with. Among Billie's songs, this is the one that best balances her distinctive voice with a timeless pop feeling.`,
  },
  {
    id: 2,
    artist: "Charlie Puth",
    bestPick: "We Don't Talk Anymore",
    spotifyUrl: "https://open.spotify.com/track/06KyNuuMOX1ROXRhj787tj",
    image: "/music-covers/Charlie_Puth.webp",
    detailImage: "/music-covers/Charlie_Puth_Wallpaper.webp",
    category: "Pop",
    title: "Charlie Puth: Pop Precision and We Don't Talk Anymore",
    description:
      "Charlie Puth turns musical precision into effortless pop. We Don't Talk Anymore is the song I keep returning to.",
    authorId: 2,
    date: "2026-06-19",
    content: `1. About Charlie Puth

Charlie Puth is a songwriter, producer, and vocalist with an unusually sharp ear for melody. His music often sounds effortless, but behind that ease is a musician who pays close attention to harmony, rhythm, and the tiny production choices that make a chorus memorable.

2. The Craft Behind the Pop

What makes Charlie interesting to me is how clearly he understands pop structure. He can turn a simple emotional situation into a polished song without removing the awkwardness or uncertainty that made the story relatable in the first place.

3. My Best Pick: We Don't Talk Anymore

We Don't Talk Anymore is my best Charlie Puth pick. The song captures the strange distance that can appear between two people who once knew everything about each other. Its light, tropical production contrasts with the discomfort at the center of the story.

4. Why It Stays With Me

This is the Charlie Puth song I revisit most because it sounds calm while carrying unresolved emotion. The duet format makes the separation feel mutual, and the melody remains instantly recognizable. It is polished pop with a very human silence underneath it.`,
  },
  {
    id: 3,
    artist: "The Neighbourhood",
    bestPick: "Reflections",
    spotifyUrl: "https://open.spotify.com/track/2xql0pid3EUwW38AsywxhV",
    image: "/music-covers/The_Neighbourhood.webp",
    detailImage: "/music-covers/The_Neighbourhood_Wallpaper.webp",
    category: "Alternative",
    title: "The Neighbourhood: Monochrome Mood and Reflections",
    description:
      "The Neighbourhood built a world of nocturnal alternative pop, and Reflections is the track that represents it best for me.",
    authorId: 2,
    date: "2026-06-18",
    content: `1. About The Neighbourhood

The Neighbourhood blends alternative rock, pop, and R&B into music that feels inseparable from its visual identity. Their black-and-white presentation is more than styling; it matches songs filled with distance, desire, insecurity, and late-night overthinking.

2. A Sound Built for the Night

I like how their music creates space. Guitars, slow rhythms, and Jesse Rutherford's restrained delivery make even direct emotions feel hazy. Their best songs do not rush to explain themselves, which gives the listener room to attach personal memories.

3. My Best Pick: Reflections

Reflections is my best pick from The Neighbourhood. It carries the band's familiar atmosphere while feeling especially inward-looking. The production is smooth and spacious, and the song moves like a thought that keeps circling back.

4. Why It Stays With Me

This track works for me because it captures the moment when memory and reality become difficult to separate. It is ideal for quiet nights and long journeys. Reflections feels less like a performance and more like being left alone with a thought.`,
  },
  {
    id: 4,
    artist: "Taylor Swift",
    bestPick: "Daylight",
    spotifyUrl: "https://open.spotify.com/track/1fzAuUVbzlhZ1lJAx9PtY6",
    image: "/music-covers/Taylor_Swift.webp",
    detailImage: "/music-covers/Taylor_Swift_Wallpaper.webp",
    category: "Pop",
    title: "Taylor Swift: Storytelling That Reaches Daylight",
    description:
      "Taylor Swift has made storytelling the center of her career. Daylight is the song that brings her growth into focus for me.",
    authorId: 2,
    date: "2026-06-17",
    content: `1. About Taylor Swift

Taylor Swift's greatest strength is the way she turns specific memories into stories that feel shared. Across country, pop, folk, and alternative sounds, the details change but the writing remains central. Her albums often feel like chapters in a longer emotional life.

2. Growth Through Storytelling

I enjoy how Taylor revisits familiar subjects from new perspectives. Love, regret, ambition, and identity are not fixed themes in her work; they evolve as she does. That continuity gives listeners a reason to grow alongside the music.

3. My Best Pick: Daylight

Daylight is my best Taylor Swift pick. It closes an album shaped by anxiety with a feeling of clarity. The song is not simply about finding love; to me, it is about choosing a healthier way to understand it.

4. Why It Stays With Me

I come back to Daylight because it feels earned. Its warmth arrives after uncertainty, which makes the hope believable. It is a reminder that a person can outgrow old definitions and decide what deserves to guide the next chapter.`,
  },
  {
    id: 5,
    artist: "Katy Perry",
    bestPick: "The One That Got Away",
    spotifyUrl: "https://open.spotify.com/track/63DKmLTYzYqET9IDXMV95I",
    image: "/music-covers/Katy_Perry.webp",
    detailImage: "/music-covers/Katy_Perry_Wallpaper.webp",
    category: "Pop",
    title: "Katy Perry: Big Pop Feelings and The One That Got Away",
    description:
      "Behind Katy Perry's colorful pop is an instinct for emotional clarity. The One That Got Away is my favorite example.",
    authorId: 2,
    date: "2026-06-16",
    content: `1. About Katy Perry

Katy Perry is known for bright concepts, enormous choruses, and pop songs that immediately understand their own identity. Beneath the color and spectacle, her strongest work often depends on direct emotions that need very little explanation.

2. More Than the Big Choruses

What I appreciate about Katy is her commitment to a feeling. Whether a song is playful, triumphant, or sad, she performs it without hesitation. That confidence is why her pop records can feel both theatrical and personal.

3. My Best Pick: The One That Got Away

The One That Got Away is my best Katy Perry pick. It steps away from pure celebration and focuses on memory, timing, and the future that never happened. The production stays accessible, but the emotional idea grows heavier with every return.

4. Why It Stays With Me

I like this song because it treats regret with tenderness rather than drama. It understands that some relationships remain important even when they cannot continue. Among Katy's hits, this is the one that feels most reflective and lasting to me.`,
  },
  {
    id: 6,
    artist: "The Weeknd",
    bestPick: "Lost in the Fire",
    spotifyUrl: "https://open.spotify.com/track/2vXKRlJBXyOcvZYTdNeckS",
    image: "/music-covers/Gesaffelstein_The_Weeknd.webp",
    detailImage: "/music-covers/Gesaffelstein_The_Weeknd_Wallpaper.webp",
    detailImagePosition: "center 35%",
    category: "R&B",
    title: "The Weeknd: After-Dark R&B and Lost in the Fire",
    description:
      "The Weeknd made darkness feel cinematic. His Gesaffelstein collaboration Lost in the Fire is my best pick from that world.",
    authorId: 2,
    date: "2026-06-15",
    content: `1. About The Weeknd

The Weeknd helped move alternative R&B into the center of pop without losing its shadows. His music combines a polished voice with stories about desire, isolation, excess, and consequences. Even at his most accessible, there is usually something uneasy beneath the surface.

2. A Cinematic After-Dark World

I enjoy the scale of his music. Synths, bass, and dramatic production turn a private conflict into a scene that feels built for city lights at midnight. His collaborations often work best when the producer understands that tension.

3. My Best Pick: Lost in the Fire

Lost in the Fire, his collaboration with Gesaffelstein, is my best pick from this side of The Weeknd's music. The production is dark, controlled, and immediately recognizable. His vocal sits against the electronic backdrop with exactly the right amount of distance.

4. Why It Stays With Me

This is the track I choose because its atmosphere arrives instantly. It feels sleek and dangerous without becoming chaotic. For me, Lost in the Fire captures the after-dark character that first made The Weeknd's music so compelling.`,
  },
];

function hydratePost(post) {
  const author = getMockUserById(post.authorId);

  return {
    ...post,
    author: author?.name || "Unknown author",
    authorAvatar: author?.profilePic || "/author-image.jpeg",
    authorBio: author?.bio || [],
  };
}

function hydrateComment(comment) {
  const user = getMockUserById(comment.userId);

  return {
    ...comment,
    name: user?.name || "Anonymous",
    profile_pic: user?.profilePic || "/author-image.jpeg",
  };
}

export const mockPosts = rawMockPosts.map(hydratePost);

export function getMockPostsByCategory(category, page = 1, limit = 6) {
  const filtered =
    category === "Highlight"
      ? mockPosts
      : mockPosts.filter((post) => post.category === category);

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return {
    posts: paginated,
    currentPage: page,
    totalPages: Math.ceil(filtered.length / limit) || 1,
  };
}

export function searchMockPosts(keyword) {
  const lower = keyword.trim().toLowerCase();
  if (!lower) return [];

  return mockPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(lower) ||
      post.description.toLowerCase().includes(lower) ||
      post.category.toLowerCase().includes(lower) ||
      post.artist.toLowerCase().includes(lower) ||
      post.bestPick?.toLowerCase().includes(lower) ||
      post.author?.toLowerCase().includes(lower),
  );
}

export function getMockPostById(id) {
  const numericId = typeof id === "string" ? Number(id) : id;
  return mockPosts.find((p) => p.id === numericId) || null;
}

// `fallbackPost` is the seed entry matched by id, and it is exactly that — a
// fallback. It must stay below the real post: seed ids 1-6 collide with real
// post ids, so checking it first meant a cover image edited through the admin
// panel never showed up on the article page.
export function getPostHeroImage(post, fallbackPost) {
  return (
    post?.detailImage ||
    post?.image ||
    fallbackPost?.detailImage ||
    fallbackPost?.image ||
    ""
  );
}

// Only meaningful alongside a seed detailImage (the API has no position field),
// so this may only apply when the hero actually came from the seed entry —
// otherwise a seed's crop position would be applied to a different image.
export function getPostHeroImagePosition(post, fallbackPost) {
  if (post?.detailImage || post?.image) {
    return post?.detailImagePosition || "center";
  }

  return fallbackPost?.detailImagePosition || "center";
}

export const mockLikesByPostId = {
  1: 128,
  2: 84,
  3: 63,
  4: 91,
  5: 73,
  6: 57,
};

const rawMockCommentsByPostId = {
  1: [
    {
      id: 101,
      userId: 4,
      comment_text:
        "Birds of a Feather is my favorite too. The warmth in that song feels so different from her earlier work.",
      created_at: "2024-09-11T10:30:00Z",
    },
    {
      id: 102,
      userId: 5,
      comment_text:
        "I like how you described the contrast in her music. It is quiet but never emotionally small.",
      created_at: "2024-09-11T14:15:00Z",
    },
    {
      id: 103,
      userId: 6,
      comment_text:
        "This made me listen to the song again with better headphones. So many details in the production.",
      created_at: "2024-09-12T09:00:00Z",
    },
  ],
  2: [
    {
      id: 201,
      userId: 3,
      comment_text:
        "I loved this article. We Don't Talk Anymore still sounds effortless even though the emotion is complicated.",
      created_at: "2024-09-12T18:30:00Z",
    },
    {
      id: 202,
      userId: 8,
      comment_text:
        "The contrast between the light production and the awkward silence is exactly why the song works.",
      created_at: "2024-09-10T16:45:00Z",
    },
  ],
  3: [
    {
      id: 301,
      userId: 9,
      comment_text:
        "Reflections really does feel like a thought looping late at night. Great description of their atmosphere.",
      created_at: "2024-09-09T08:30:00Z",
    },
    {
      id: 302,
      userId: 10,
      comment_text:
        "The black-and-white identity and the music have always felt inseparable to me too.",
      created_at: "2024-09-09T13:10:00Z",
    },
  ],
  4: [
    {
      id: 401,
      userId: 11,
      comment_text:
        "Daylight is such a hopeful closer. I like that you focused on growth instead of only romance.",
      created_at: "2024-09-08T12:00:00Z",
    },
    {
      id: 402,
      userId: 12,
      comment_text:
        "This captures why her storytelling stays interesting across different eras.",
      created_at: "2024-09-08T17:30:00Z",
    },
  ],
  5: [
    {
      id: 501,
      userId: 13,
      comment_text:
        "The One That Got Away has always felt more reflective than her other big singles. Great pick.",
      created_at: "2024-09-07T10:15:00Z",
    },
    {
      id: 502,
      userId: 14,
      comment_text:
        "I agree that the song treats regret with tenderness. That is what makes it last.",
      created_at: "2024-09-07T15:40:00Z",
    },
  ],
  6: [
    {
      id: 601,
      userId: 15,
      comment_text:
        "Lost in the Fire has an atmosphere that grabs you immediately. The production is the main character.",
      created_at: "2024-09-06T09:50:00Z",
    },
    {
      id: 602,
      userId: 16,
      comment_text:
        "Gesaffelstein and The Weeknd make perfect sense together. Dark, polished, and cinematic.",
      created_at: "2024-09-06T18:20:00Z",
    },
  ],
};

export const mockCommentsByPostId = Object.fromEntries(
  Object.entries(rawMockCommentsByPostId).map(([postId, comments]) => [
    postId,
    comments.map(hydrateComment),
  ]),
);

export function getMockLikesAmount(postId) {
  const numericId = typeof postId === "string" ? Number(postId) : postId;
  return mockLikesByPostId[numericId] || 0;
}

export function getMockCommentsByPostId(postId) {
  const numericId = typeof postId === "string" ? Number(postId) : postId;
  return mockCommentsByPostId[numericId] || [];
}

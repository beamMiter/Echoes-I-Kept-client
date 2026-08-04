import { mockPosts } from "../data/mockPosts";
import VinylAlbumCarousel from "./VinylAlbumCarousel";

function HeroSection() {
  const heroTracks = mockPosts.map(
    ({ id, artist, bestPick, image, spotifyUrl }) => ({
      id,
      artist,
      bestPick,
      image,
      spotifyUrl,
    }),
  );

  return (
    <main className="mx-auto overflow-hidden px-4 py-12 md:px-8 md:py-14 lg:w-[clamp(960px,92vw,1380px)] lg:px-0 lg:pb-28 lg:pt-16">
      <div className="flex flex-col items-center lg:grid lg:[grid-template-columns:minmax(240px,340px)_minmax(420px,520px)_minmax(240px,340px)] lg:items-center lg:justify-center lg:gap-x-10 xl:gap-x-14">
        <div className="mb-10 max-w-[380px] text-center lg:mb-0 lg:w-full lg:max-w-[340px] lg:justify-self-end lg:text-right">
          <p className="mb-4 text-xs font-semibold uppercase text-muted-foreground">
            A personal listening journal
          </p>
          <h1 className="mb-5 leading-none">
            <span className="font-display block whitespace-nowrap text-[42px] font-medium sm:text-5xl lg:text-[46px] xl:text-5xl">
              Artists I Love
            </span>
            <span className="font-display mt-2 block text-[44px] font-medium text-muted-foreground sm:text-[52px] lg:text-[50px] xl:text-[54px]">
              Songs I Keep
            </span>
          </h1>
          <p className="mx-auto max-w-[340px] text-[15px] leading-[1.55] text-muted-foreground lg:ml-auto lg:mr-0 lg:text-[15px] xl:text-base">
            A personal music journal about the artists I return to and the one
            song from each of them that means the most to me.
          </p>
          <p className="mt-5 text-[13px] font-medium text-foreground">
            06 artists&nbsp;&nbsp;·&nbsp;&nbsp;06
            songs&nbsp;&nbsp;·&nbsp;&nbsp;one best pick each
          </p>
        </div>

        <div className="mb-10 flex w-full max-w-[520px] justify-center lg:mb-0">
          <VinylAlbumCarousel tracks={heroTracks} />
        </div>

        <div className="max-w-[380px] border-l-2 border-foreground/15 pl-6 lg:w-full lg:max-w-[340px]">
          <h2 className="mb-2 text-xs font-semibold uppercase leading-4 text-muted-foreground">
            A note from
          </h2>
          <h3 className="mb-4 text-2xl font-display leading-8">Techin B.</h3>
          <p className="mb-5 text-[15px] font-medium italic leading-[1.55] text-foreground">
            I keep this journal for the songs that turn ordinary moments into
            memories.
          </p>
          <p className="text-[15px] leading-[1.55] text-muted-foreground">
            Each article starts with the artist, follows the feeling, and ends
            with the one track I would keep.
          </p>
        </div>
      </div>
    </main>
  );
}

export default HeroSection;

import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import LatestArticles from "../components/LatestArticles";
import Footer from "../components/Footer";

function HomePage() {
  return (
    <div
      className="no-image-drag flex flex-col min-h-screen"
      onDragStart={(e) => {
        if (e.target instanceof HTMLImageElement) e.preventDefault();
      }}
    >
      <Navbar />
      <div className="flex-grow">
        <HeroSection />
        <LatestArticles />
      </div>
      <Footer />
    </div>
  );
}

export default HomePage;

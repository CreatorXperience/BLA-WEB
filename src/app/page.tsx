import { Hero } from "@/components/home/hero";
import { FeaturedCollections } from "@/components/home/featured-collections";
import { FeaturedProducts, BestSellers, NewArrivals } from "@/components/home/product-rows";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { BrandStory } from "@/components/home/brand-story";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Hero />
      <ErrorBoundary>
        <FeaturedCollections />
        <FeaturedProducts />
        <EditorialBanner />
        <BestSellers />
        <NewArrivals />
        <BrandStory />
        <InstagramGallery />
      </ErrorBoundary>
    </div>
  );
}

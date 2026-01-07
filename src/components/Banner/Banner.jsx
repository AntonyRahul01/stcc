import { useState, useEffect } from "react";
import { getPublicBanners } from "../../utils/bannerService";
import { getPublicTopBanner } from "../../utils/topBannerService";
import { getImageUrl } from "../../utils/imageUtils";

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [topBanner, setTopBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTopBannerLoading, setIsTopBannerLoading] = useState(true);

  // Fetch top banner from API
  useEffect(() => {
    const loadTopBanner = async () => {
      try {
        setIsTopBannerLoading(true);
        const response = await getPublicTopBanner();
        if (response.success && response.data && response.data.image) {
          setTopBanner(response.data);
        } else {
          setTopBanner(null);
        }
      } catch (error) {
        console.error("Error loading top banner:", error);
        setTopBanner(null);
      } finally {
        setIsTopBannerLoading(false);
      }
    };

    loadTopBanner();
  }, []);

  // Fetch banners from API
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setIsLoading(true);
        const response = await getPublicBanners();
        if (response.success && response.data && Array.isArray(response.data)) {
          // Filter only active banners with images
          const activeBanners = response.data.filter(
            (banner) => banner.status === "active" && banner.image
          );
          setBanners(activeBanners);
        }
      } catch (error) {
        console.error("Error loading banners:", error);
        setBanners([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBanners();
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    if (banners.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  return (
    <>
      {/* Header Banner */}
      {isTopBannerLoading ? (
        <div className="w-full overflow-hidden bg-gray-100 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-500">Loading top banner...</p>
          </div>
        </div>
      ) : topBanner && topBanner.image ? (
        <div className="w-full overflow-hidden">
          <img
            src={getImageUrl(topBanner.image)}
            alt="STCC Header Banner"
            className="w-full h-auto"
            style={{ display: "block", maxWidth: "100%" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      ) : null}

      {/* Slider Banner */}
      {isLoading ? (
        <div className="w-full relative overflow-hidden bg-gray-100 min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-500">Loading banners...</p>
          </div>
        </div>
      ) : banners.length > 0 ? (
        <div className="w-full relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((banner, index) => (
              <div key={banner.id || index} className="w-full flex-shrink-0">
                <img
                  src={getImageUrl(banner.image)}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-auto block"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="p-0 m-0 bg-transparent border-0"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <span
                    className={`block rounded-full transition-opacity duration-300 ${
                      currentSlide === index
                        ? "w-3 h-3 bg-[#FF0000]/80"
                        : "w-3 h-3 bg-gray-300 opacity-60"
                    }`}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Navigation Arrows */}
          {banners.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/75 rounded-full p-1.5 sm:p-2 transition-all z-10"
                aria-label="Previous slide"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/75 rounded-full p-1.5 sm:p-2 transition-all z-10"
                aria-label="Next slide"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="w-full relative overflow-hidden bg-gray-100 min-h-[300px] flex items-center justify-center">
          <p className="text-gray-500">No banners available</p>
        </div>
      )}
    </>
  );
};

export default Banner;

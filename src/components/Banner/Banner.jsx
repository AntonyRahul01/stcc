import { useState, useEffect } from "react";
import headerBanner from "../../assets/images/headerbanner.webp";
import hero1 from "../../assets/images/hero1.webp";
import hero2 from "../../assets/images/hero2.webp";

const Banner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [hero1, hero2];

  // Auto-play functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <>
      {/* Header Banner */}
      <div className="w-full overflow-hidden">
        <img
          src={headerBanner}
          alt="STCC Header Banner"
          className="w-full h-auto"
          style={{ display: "block", maxWidth: "100%" }}
        />
      </div>

      {/* Slider Banner */}
      <div className="w-full relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={slide}
                alt={`Banner ${index + 1}`}
                className="w-full h-auto block"
              />
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((_, index) => (
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

        {/* Navigation Arrows */}
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
      </div>
    </>
  );
};

export default Banner;

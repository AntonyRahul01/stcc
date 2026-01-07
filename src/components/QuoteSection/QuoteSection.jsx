import { useEffect, useState } from "react";
import AOS from "aos";
import quoteIcon from "../../assets/images/quoteicon.png";
import { getPublicLeaderBanner } from "../../utils/leaderBannerService";
import { getPublicQuotes } from "../../utils/quotesService";
import { getImageUrl } from "../../utils/imageUtils";

const QuoteSection = () => {
  const [leaderBanner, setLeaderBanner] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isQuotesLoading, setIsQuotesLoading] = useState(true);

  // Fetch leader banner from API
  useEffect(() => {
    const loadLeaderBanner = async () => {
      try {
        setIsLoading(true);
        const response = await getPublicLeaderBanner();
        if (response.success && response.data && response.data.image) {
          setLeaderBanner(response.data);
        } else {
          setLeaderBanner(null);
        }
      } catch (error) {
        console.error("Error loading leader banner:", error);
        setLeaderBanner(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderBanner();
  }, []);

  // Fetch quotes from API
  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setIsQuotesLoading(true);
        const response = await getPublicQuotes();
        if (response.success && response.data && Array.isArray(response.data)) {
          // Filter only active quotes
          const activeQuotes = response.data.filter(
            (quote) => quote.status === "active" && quote.quote
          );
          setQuotes(activeQuotes);
        } else {
          setQuotes([]);
        }
      } catch (error) {
        console.error("Error loading quotes:", error);
        setQuotes([]);
      } finally {
        setIsQuotesLoading(false);
      }
    };

    loadQuotes();
  }, []);

  // Auto-play functionality for quotes slider
  useEffect(() => {
    if (quotes.length === 0 || quotes.length === 1) return;

    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000); // Change quote every 5 seconds

    return () => clearInterval(interval);
  }, [quotes.length]);

  const goToQuote = (index) => {
    setCurrentQuoteIndex(index);
  };

  useEffect(() => {
    // Refresh AOS when component mounts or data loads
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 50);

    return () => clearTimeout(timer);
  }, [leaderBanner, quotes]);

  return (
    <div className="w-full bg-white py-16 md:py-24 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Section - Image */}
          <div
            className="w-full md:w-2/5"
            data-aos="fade-right"
            data-aos-delay="100"
          >
            <div className="bg-white rounded-[20px] shadow-lg overflow-hidden h-auto md:h-[456px]">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <p className="mt-4 text-gray-500 text-sm">Loading...</p>
                  </div>
                </div>
              ) : leaderBanner && leaderBanner.image ? (
                <img
                  src={getImageUrl(leaderBanner.image)}
                  alt="மேதகு. வே பிரபாகரன்"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentElement.innerHTML =
                      '<div class="w-full h-full flex items-center justify-center bg-gray-100"><p class="text-gray-500 text-sm">Image not available</p></div>';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500 text-sm">Image not available</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Text Content */}
          <div
            className="w-full md:w-3/5"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <div className="bg-[#F6F6F9] rounded-[20px] p-4 sm:p-6 md:p-8 h-auto md:h-[456px] flex flex-col relative overflow-hidden">
              {isQuotesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                    <p className="mt-4 text-gray-500 text-sm">
                      Loading quotes...
                    </p>
                  </div>
                </div>
              ) : quotes.length > 0 ? (
                <>
                  {/* Navigation Dots */}
                  {quotes.length > 1 && (
                    <div className="flex gap-2 mb-4 sm:mb-6 md:mb-8">
                      {quotes.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToQuote(index)}
                          className="p-0 m-0 bg-transparent border-0 cursor-pointer"
                          aria-label={`Go to quote ${index + 1}`}
                        >
                          <span
                            className={`block w-3 h-3 rounded-full transition-colors duration-300 ${
                              currentQuoteIndex === index
                                ? "bg-[#FF0000]"
                                : "bg-[#DEDEDE]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Heading */}
                  <h2 className="text-lg sm:text-xl md:text-[23px] font-[700] text-black mb-4 sm:mb-6 md:mb-8 leading-tight">
                    தமிழீழத் தேசியத் தலைவரின்
                    <br />
                    இன்றைய சிந்தனை
                  </h2>

                  {/* Quote Icon */}
                  <div className="mb-4 sm:mb-6 md:mb-8">
                    <img
                      src={quoteIcon}
                      alt="Quote"
                      className="h-6 sm:h-7 md:h-8 w-auto"
                    />
                  </div>

                  {/* Quote Text Slider */}
                  <div className="relative mb-4 sm:mb-6 md:mb-8 overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{
                        transform: `translateX(-${currentQuoteIndex * 100}%)`,
                      }}
                    >
                      {quotes.map((quote, index) => (
                        <div
                          key={quote.id || index}
                          className="w-full flex-shrink-0"
                        >
                          <div className="text-xs sm:text-sm md:text-[14px] font-[400] text-black leading-relaxed space-y-1 sm:space-y-2">
                            {quote.quote
                              .split("\n")
                              .filter((line) => line.trim())
                              .map((line, lineIndex) => (
                                <p key={lineIndex}>{line.trim()}</p>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attribution */}
                  <div>
                    <div className="text-xs sm:text-sm text-black mb-1">
                      தமிழீழத் தேசியத் தலைவர்
                    </div>
                    <div className="text-sm sm:text-base md:text-[16px] font-[600] text-red-600">
                      மேதகு. வே பிரபாகரன் அவர்கள்
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 text-sm">No quotes available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteSection;

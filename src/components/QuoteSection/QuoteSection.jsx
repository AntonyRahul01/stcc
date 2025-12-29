import { useEffect } from "react";
import AOS from "aos";
import prabhakaranImage from "../../assets/images/prabharakan.webp";
import quoteIcon from "../../assets/images/quoteicon.png";

const QuoteSection = () => {
  useEffect(() => {
    // Refresh AOS when component mounts
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

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
              <img
                src={prabhakaranImage}
                alt="மேதகு. வே பிரபாகரன்"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Section - Text Content */}
          <div
            className="w-full md:w-3/5"
            data-aos="fade-left"
            data-aos-delay="200"
          >
            <div className="bg-[#F6F6F9] rounded-[20px] p-4 sm:p-6 md:p-8 h-auto md:h-[456px] flex flex-col">
              {/* Navigation Dots */}
              <div className="flex gap-2 mb-4 sm:mb-6 md:mb-8">
                <span className="w-3 h-3 rounded-full bg-[#FF0000]"></span>
                <span className="w-3 h-3 rounded-full bg-[#DEDEDE]"></span>
                <span className="w-3 h-3 rounded-full bg-[#DEDEDE]"></span>
                <span className="w-3 h-3 rounded-full bg-[#DEDEDE]"></span>
                <span className="w-3 h-3 rounded-full bg-[#DEDEDE]"></span>
              </div>

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

              {/* Quote Text */}
              <div className="text-xs sm:text-sm md:text-[14px] font-[400] text-black leading-relaxed mb-4 sm:mb-6 md:mb-8 space-y-1 sm:space-y-2 flex-grow">
                <p>
                  "நான் பெரிது நீ பெரிது என்று வாழாமல் நாடு பெரிதென்று
                  வாழுங்கள்.
                </p>
                <p>
                  நாடு நமக்குப் பெரிதானால் நாம் எல்லோரும் அதற்குச் சிறியவர்களே,
                </p>
                <p>
                  எமது நிலையற்ற வாழ்விலும் பார்க்க நாட்டின் வாழ்வே பெரியது."
                </p>
              </div>

              {/* Attribution */}
              <div className="mt-auto">
                <div className="text-xs sm:text-sm text-black mb-1">
                  தமிழீழத் தேசியத் தலைவர்
                </div>
                <div className="text-sm sm:text-base md:text-[16px] font-[600] text-red-600">
                  மேதகு. வே பிரபாகரன் அவர்கள்
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteSection;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import logoImage from "../../assets/images/logo.png";
import facebookIcon from "../../assets/images/facebook.svg";
import whatsappIcon from "../../assets/images/whatsapp.svg";
import instagramIcon from "../../assets/images/instagram.svg";
import { getPublicFooterBanner } from "../../utils/footerBannerService";
import { getImageUrl } from "../../utils/imageUtils";

const Footer = () => {
  const [footerBanner, setFooterBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch footer banner from API
  useEffect(() => {
    const loadFooterBanner = async () => {
      try {
        setIsLoading(true);
        const response = await getPublicFooterBanner();
        if (response.success && response.data && response.data.image) {
          setFooterBanner(response.data);
        } else {
          setFooterBanner(null);
        }
      } catch (error) {
        console.error("Error loading footer banner:", error);
        setFooterBanner(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadFooterBanner();
  }, []);

  useEffect(() => {
    // Refresh AOS when component mounts or footer banner loads
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 50);

    return () => clearTimeout(timer);
  }, [footerBanner]);

  return (
    <footer className="w-full bg-white">
      {/* Footer Banner */}
      {isLoading ? (
        <div
          className="w-full overflow-hidden bg-gray-100 min-h-[200px] flex items-center justify-center"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            <p className="mt-4 text-gray-500">Loading footer banner...</p>
          </div>
        </div>
      ) : footerBanner && footerBanner.image ? (
        <div
          className="w-full overflow-hidden"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <img
            src={getImageUrl(footerBanner.image)}
            alt="STCC Footer Banner"
            className="w-full h-auto"
            style={{ display: "block", maxWidth: "100%" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      ) : null}

      {/* Welcome Text Section */}
      <div
        className="w-full bg-[#FF0000] py-3 sm:py-4 md:py-6 lg:py-8"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center text-white text-xs sm:text-sm md:text-[14px] font-[600] leading-relaxed sm:leading-relaxed">
            <p className="mb-1.5 sm:mb-2">
              எமது இணையத்தளத்திற்கு உங்களை நாம் அன்புடன் வரவேற்கின்றோம். இங்கே,
              சுவிஸ் நாட்டில் எம்மால் முன்னெடுக்கப்படும்
            </p>
            <p className="mb-0">
              செயற்திட்டங்கள், நிகழ்வுகள், செய்திகள் உள்ளிட்ட பல விடயங்களை பற்றி
              அறிந்துகொள்ள முடியும்.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-white py-8 sm:py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            {/* Section 1: Logo and Organization Names */}
            <div
              className="flex flex-col"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              {/* Logo and Organization Names - Side by Side */}
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <Link
                    to="/"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    <img
                      src={logoImage}
                      alt="STCC Logo"
                      className="h-12 w-auto sm:h-16 md:h-14 object-contain cursor-pointer"
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* Section 2: Navigation Links */}
            <div
              className="flex flex-col"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <nav className="flex flex-col gap-2 sm:gap-3">
                <Link
                  to="/"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs sm:text-[14px] text-black font-[400] hover:text-[#FF0000] transition-colors"
                >
                  இல்லம்
                </Link>
                <Link
                  to="/news"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs sm:text-[14px] text-black font-[400] hover:text-[#FF0000] transition-colors"
                >
                  செய்திகள்
                </Link>
                <Link
                  to="/events"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs sm:text-[14px] text-black font-[400] hover:text-[#FF0000] transition-colors"
                >
                  நிகழ்வுகள்
                </Link>
                <Link
                  to="/help"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs sm:text-[14px] text-black font-[400] hover:text-[#FF0000] transition-colors"
                >
                  உறவுக்கு கைகொடுப்போம்
                </Link>
              </nav>
            </div>

            {/* Section 3: Social Media */}
            <div
              className="flex flex-col"
              data-aos="fade-up"
              data-aos-delay="500"
            >
              <h3 className="text-xs sm:text-[14px] text-black font-[600] mb-2 sm:mb-3">
                இணைந்திருங்கள்
              </h3>
              <div className="flex gap-2 sm:gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61585608749142"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <img
                    src={facebookIcon}
                    alt="Facebook"
                    className="w-7 h-7 sm:w-8 sm:h-8"
                  />
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <img
                    src={whatsappIcon}
                    alt="WhatsApp"
                    className="w-7 h-7 sm:w-8 sm:h-8"
                  />
                </a>
                <a href="#" className="hover:opacity-80 transition-opacity">
                  <img
                    src={instagramIcon}
                    alt="Instagram"
                    className="w-7 h-7 sm:w-8 sm:h-8"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div
        className="bg-gray-200 py-3 sm:py-4"
        data-aos="fade-up"
        data-aos-delay="600"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center text-xs sm:text-[14px] text-gray-700 font-[400]">
            Copyright © 2009 - 2025 | STCC
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import moment from "moment";
import { Menu, X } from "lucide-react";
import logoImage from "../../assets/images/logo.png";
import calendarIcon from "../../assets/images/calendericon.png";
import clockIcon from "../../assets/images/clockicon.png";
import mailIcon from "../../assets/images/mailicon.png";

const Header = () => {
  const location = useLocation();
  const [currentDateTime, setCurrentDateTime] = useState({
    date: "",
    time: "",
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const updateDateTime = () => {
      // Get current GMT/UTC time and add Switzerland timezone offset
      // Switzerland is GMT+1 (CET) or GMT+2 (CEST during daylight saving)
      // This automatically handles daylight saving time based on the current date
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      // Switzerland timezone offset: +1 hour (3600000 ms) or +2 hours during DST
      // Check if DST is active (roughly March-October)
      const currentMonth = now.getUTCMonth(); // 0-11
      const isDST = currentMonth >= 2 && currentMonth <= 9; // March (2) to October (9)
      const swissOffset = isDST ? 7200000 : 3600000; // +2 hours or +1 hour
      const swissTime = new Date(utcTime + swissOffset);
      const swissMoment = moment(swissTime);

      // Tamil day names
      const tamilDays = [
        "ஞாயிறு",
        "திங்கள்",
        "செவ்வாய்",
        "புதன்",
        "வியாழன்",
        "வெள்ளி",
        "சனி",
      ];
      const tamilMonths = [
        "ஜனவரி",
        "பிப்ரவரி",
        "மார்ச்",
        "ஏப்ரல்",
        "மே",
        "ஜூன்",
        "ஜூலை",
        "ஆகஸ்ட்",
        "செப்டம்பர்",
        "அக்டோபர்",
        "நவம்பர்",
        "டிசம்பர்",
      ];

      const dayIndex = swissMoment.day();
      const day = tamilDays[dayIndex];
      const date = swissMoment.date();
      const month = swissMoment.month() + 1; // 1-12
      const year = swissMoment.year();

      // Format date: "27.12.2025 சனி" (DD.MM.YYYY with Tamil day)
      const formattedDate = `${String(date).padStart(2, "0")}.${String(
        month
      ).padStart(2, "0")}.${year} ${day}`;

      // Format time in 12-hour format with AM/PM
      const formattedTime = swissMoment.format("hh:mm:ss A");

      setCurrentDateTime({
        date: formattedDate,
        time: formattedTime,
      });
    };

    // Update immediately
    updateDateTime();

    // Update every second
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="w-full bg-white">
        {/* Dark Gray Bar */}
        {/* <div className="bg-gray-800 h-1 w-full"></div> */}

        {/* Top Red Bar */}
        <div className="bg-[#FF0000] text-white py-2 px-3 sm:py-2.5 sm:px-4 md:px-6 lg:px-8 flex flex-row justify-between items-center gap-2 sm:gap-3 text-sm overflow-x-auto">
          {/* Date and Time Group */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
            {/* Date Section */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              <img
                src={calendarIcon}
                alt="Calendar"
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 brightness-0 invert flex-shrink-0"
              />
              <span className="text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                {currentDateTime.date}
              </span>
            </div>

            {/* Time Section - Black Oval */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 bg-black rounded-full px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 flex-shrink-0">
              <img
                src={clockIcon}
                alt="Clock"
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 brightness-0 invert flex-shrink-0"
              />
              <span className="text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
                {currentDateTime.time}
              </span>
            </div>
          </div>

          {/* Email Section */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 ml-auto">
            <img
              src={mailIcon}
              alt="Mail"
              className="w-4 h-4 sm:w-5 sm:h-5 brightness-0 invert flex-shrink-0 object-contain"
            />
            <span className="text-[10px] sm:text-xs md:text-[14px] font-[400] whitespace-nowrap">
              email: info@tccswiss.org
            </span>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="flex flex-row justify-between items-center py-3 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <Link
              to="/"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <img
                src={logoImage}
                alt="STCC Logo"
                className="h-12 w-auto sm:h-16 md:h-14 md:w-auto object-contain cursor-pointer"
              />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 md:gap-6">
            <Link
              to="/"
              className={`text-sm py-2 relative transition-colors whitespace-nowrap ${
                isActive("/")
                  ? 'text-[#FF0000] font-[600] after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-8 after:h-0.5 after:bg-[#FFBF00]'
                  : "text-[#000000] font-[400] hover:text-[#FF0000]"
              }`}
            >
              இல்லம்
            </Link>
            <Link
              to="/news"
              className={`text-sm py-2 relative transition-colors whitespace-nowrap ${
                isActive("/news")
                  ? 'text-[#FF0000] font-[600] after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-8 after:h-0.5 after:bg-[#FFBF00]'
                  : "text-[#000000] font-[400] hover:text-[#FF0000]"
              }`}
            >
              செய்திகள்
            </Link>
            <Link
              to="/events"
              className={`text-sm py-2 relative transition-colors whitespace-nowrap ${
                isActive("/events")
                  ? 'text-[#FF0000] font-[600] after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-8 after:h-0.5 after:bg-[#FFBF00]'
                  : "text-[#000000] font-[400] hover:text-[#FF0000]"
              }`}
            >
              நிகழ்வுகள்
            </Link>
            <Link
              to="/help"
              className={`text-sm py-2 relative transition-colors whitespace-nowrap ${
                isActive("/help")
                  ? 'text-[#FF0000] font-[600] after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:transform after:-translate-x-1/2 after:w-8 after:h-0.5 after:bg-[#FFBF00]'
                  : "text-[#000000] font-[400] hover:text-[#FF0000]"
              }`}
            >
              உறவுக்கு கைகொடுப்போம்
            </Link>
            <Link
              to="/contact"
              className="bg-[#FF0000] text-white px-4 md:px-6 py-2.5 rounded-full text-sm font-[400] transition-colors hover:bg-red-700 ml-2 whitespace-nowrap"
            >
              தொடர்புகளுக்கு
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-[#FF0000] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <nav className="flex flex-col px-4 py-4 space-y-3">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm py-2 px-4 rounded-lg transition-colors ${
                  isActive("/")
                    ? "text-[#FF0000] font-[600] bg-red-50"
                    : "text-[#000000] font-[400] hover:text-[#FF0000] hover:bg-gray-50"
                }`}
              >
                இல்லம்
              </Link>
              <Link
                to="/news"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm py-2 px-4 rounded-lg transition-colors ${
                  isActive("/news")
                    ? "text-[#FF0000] font-[600] bg-red-50"
                    : "text-[#000000] font-[400] hover:text-[#FF0000] hover:bg-gray-50"
                }`}
              >
                செய்திகள்
              </Link>
              <Link
                to="/events"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm py-2 px-4 rounded-lg transition-colors ${
                  isActive("/events")
                    ? "text-[#FF0000] font-[600] bg-red-50"
                    : "text-[#000000] font-[400] hover:text-[#FF0000] hover:bg-gray-50"
                }`}
              >
                நிகழ்வுகள்
              </Link>
              <Link
                to="/help"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm py-2 px-4 rounded-lg transition-colors ${
                  isActive("/help")
                    ? "text-[#FF0000] font-[600] bg-red-50"
                    : "text-[#000000] font-[400] hover:text-[#FF0000] hover:bg-gray-50"
                }`}
              >
                உறவுக்கு கைகொடுப்போம்
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#FF0000] text-white px-4 py-2.5 rounded-full text-sm font-[400] transition-colors hover:bg-red-700 text-center mt-2"
              >
                தொடர்புகளுக்கு
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;

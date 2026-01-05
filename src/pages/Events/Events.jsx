import { useState, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Clock,
  Home,
  Calendar,
  ChevronDown,
  Download,
} from "lucide-react";
import navigationIcon from "../../assets/images/navigatepng.png";
import { getPublicUpcomingEvents } from "../../utils/upcomingEventsService";
import { getCoverImageUrl } from "../../utils/imageUtils";

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 3,
  });
  const [showCalendarDropdown, setShowCalendarDropdown] = useState({});
  const buttonRefs = useRef({});
  const dropdownRefs = useRef({});

  // Scroll to top when component mounts or page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Get page from URL params or default to 1
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

  // Load events from API
  useEffect(() => {
    loadEvents();
  }, [currentPage]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await getPublicUpcomingEvents(currentPage, 3);

      // Handle API response structure: response.data.upcomingEvents
      let eventsArray = [];
      if (
        response &&
        response.data &&
        response.data.upcomingEvents &&
        Array.isArray(response.data.upcomingEvents)
      ) {
        // Map API fields - handle both camelCase and snake_case
        eventsArray = response.data.upcomingEvents.map((event) => ({
          ...event,
          locationUrl: event.locationUrl || event.location_url || "",
          image:
            event.coverimage || event.cover_image
              ? getCoverImageUrl(event.coverimage || event.cover_image)
              : event.image || "",
          category: event.category || "நிகழ்வுகள்",
        }));
      } else if (response && response.data && Array.isArray(response.data)) {
        eventsArray = response.data.map((event) => ({
          ...event,
          locationUrl: event.locationUrl || event.location_url || "",
          image:
            event.coverimage || event.cover_image
              ? getCoverImageUrl(event.coverimage || event.cover_image)
              : event.image || "",
          category: event.category || "நிகழ்வுகள்",
        }));
      } else if (response && Array.isArray(response)) {
        eventsArray = response.map((event) => ({
          ...event,
          locationUrl: event.locationUrl || event.location_url || "",
          image:
            event.coverimage || event.cover_image
              ? getCoverImageUrl(event.coverimage || event.cover_image)
              : event.image || "",
          category: event.category || "நிகழ்வுகள்",
        }));
      }

      setEvents(eventsArray);

      // Handle pagination
      if (response && response.data && response.data.pagination) {
        setPagination({
          totalPages: response.data.pagination.totalPages || 1,
          totalItems: response.data.pagination.totalItems || 0,
          itemsPerPage: response.data.pagination.itemsPerPage || 3,
        });
      }
    } catch (error) {
      console.error("Error loading events:", error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    setSearchParams({ page: page.toString() });
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Get visible page numbers
  const getVisiblePages = () => {
    const maxVisible = 5;
    const totalPages = pagination.totalPages;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);
    const adjustedStart = Math.max(1, end - maxVisible + 1);

    const visible = [];
    for (let i = adjustedStart; i <= end; i++) {
      visible.push(i);
    }
    return visible;
  };

  // Handle add to calendar
  const handleAddToCalendar = (eventId) => {
    // Close all dropdowns first, then toggle the clicked one
    setShowCalendarDropdown((prev) => {
      // If the clicked dropdown is already open, close it
      if (prev[eventId]) {
        return {};
      }
      // Otherwise, close all and open only the clicked one
      return { [eventId]: true };
    });
  };

  // Update dropdown position
  const updateDropdownPosition = () => {
    Object.keys(showCalendarDropdown).forEach((eventId) => {
      if (
        showCalendarDropdown[eventId] &&
        buttonRefs.current[eventId] &&
        dropdownRefs.current[eventId]
      ) {
        const button = buttonRefs.current[eventId];
        const dropdown = dropdownRefs.current[eventId];
        const rect = button.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 4}px`;
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.width = `${rect.width}px`;
      }
    });
  };

  // Update dropdown position when it opens or window changes
  useEffect(() => {
    if (Object.keys(showCalendarDropdown).length > 0) {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        updateDropdownPosition();
      }, 0);
    }

    const handleScroll = () => updateDropdownPosition();
    const handleResize = () => updateDropdownPosition();

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [showCalendarDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the calendar dropdown
      const isClickInside = event.target.closest(".calendar-dropdown");
      if (!isClickInside && Object.keys(showCalendarDropdown).length > 0) {
        setShowCalendarDropdown({});
      }
    };

    // Use a small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendarDropdown]);

  // Handle navigate
  const handleNavigate = (locationUrl, location) => {
    if (locationUrl) {
      window.open(locationUrl, "_blank");
    } else if (location) {
      // Fallback to using location string if URL is not provided
      const encodedLocation = encodeURIComponent(location);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`,
        "_blank"
      );
    }
  };

  // Generate calendar URLs
  const generateCalendarUrls = (event) => {
    try {
      // Parse date and time from event
      const [day, month, year] = event.date.split("/");

      // Parse time - format: "15:30 மணி - 17:30 மணி" or "14:00 மணி - 18:00 மணி"
      const timeMatches = event.time
        ? event.time.match(/(\d{2}):(\d{2})/g)
        : null;
      let startHour = 15;
      let startMin = 30;
      let endHour = 17;
      let endMin = 30;

      if (timeMatches && timeMatches.length >= 1) {
        const [startH, startM] = timeMatches[0].split(":").map(Number);
        startHour = startH;
        startMin = startM;

        if (timeMatches.length >= 2) {
          const [endH, endM] = timeMatches[1].split(":").map(Number);
          endHour = endH;
          endMin = endM;
        } else {
          // Default 2 hour duration if end time not found
          endHour = (startHour + 2) % 24;
          endMin = startMin;
        }
      }

      // Create date objects (using UTC to avoid timezone issues)
      const startDate = new Date(
        Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          startHour,
          startMin,
          0
        )
      );
      const endDate = new Date(
        Date.UTC(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          endHour,
          endMin,
          0
        )
      );

      // Format for different calendar services
      const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      };

      const start = formatDate(startDate);
      const end = formatDate(endDate);

      return {
        google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          event.title || ""
        )}&dates=${start}/${end}&details=${encodeURIComponent(
          event.description || ""
        )}&location=${encodeURIComponent(event.location || "")}`,
        ics: `data:text/calendar;charset=utf8,${encodeURIComponent(
          `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//STCC//Events//EN\nBEGIN:VEVENT\nDTSTART:${start}\nDTEND:${end}\nSUMMARY:${
            event.title || ""
          }\nDESCRIPTION:${event.description || ""}\nLOCATION:${
            event.location || ""
          }\nEND:VEVENT\nEND:VCALENDAR`
        )}`,
        office365: `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
          event.title || ""
        )}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(
          event.description || ""
        )}&location=${encodeURIComponent(event.location || "")}`,
        outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
          event.title || ""
        )}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&body=${encodeURIComponent(
          event.description || ""
        )}&location=${encodeURIComponent(event.location || "")}`,
      };
    } catch (error) {
      console.error("Error generating calendar URLs:", error);
      // Return default URLs if parsing fails
      return {
        google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
          event.title || ""
        )}`,
        ics: `data:text/calendar;charset=utf8,${encodeURIComponent(
          `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//STCC//Events//EN\nBEGIN:VEVENT\nSUMMARY:${
            event.title || ""
          }\nEND:VEVENT\nEND:VCALENDAR`
        )}`,
        office365: `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
          event.title || ""
        )}`,
        outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
          event.title || ""
        )}`,
      };
    }
  };

  return (
    <div className="w-full bg-[#F6F6F9] py-8 md:py-12 px-4 md:px-8 overflow-visible">
      <div className="max-w-7xl mx-auto overflow-visible">
        {/* Breadcrumb Navigation */}
        <div className="px-4 py-3 mb-6">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              to="/"
              className="flex items-center gap-1 text-black hover:text-[#FF0000] transition-colors"
            >
              <Home className="w-4 h-4 text-[#FF0000] stroke-2 fill-none" />
              <span className="text-black">இல்லம்</span>
            </Link>
            <span className="text-black">{">"}</span>
            <span className="text-[#FF0000] font-[400]">நிகழ்வுகள்</span>
          </nav>
        </div>

        {/* Page Title */}
        <h1 className="text-[30px] font-[700] text-black mb-8">நிகழ்வுகள்</h1>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 overflow-visible">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
              <p className="ml-4 text-gray-500">நிகழ்வுகளை ஏற்றுகிறது...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                வரவிருக்கும் நிகழ்வுகள் எதுவும் கிடைக்கவில்லை
              </p>
            </div>
          ) : (
            events.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="bg-white rounded-2xl overflow-hidden transition hover:shadow-xl flex flex-col h-full relative cursor-pointer"
              >
                {/* Event Banner/Image */}
                <div className="relative w-full p-4">
                  <div className="relative w-full h-64 sm:h-72 md:h-80 bg-gray-200 rounded-2xl overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-contain bg-white"
                    />
                    {/* Date overlay on banner */}
                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm font-medium">
                      {event.date}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div
                  className="p-5 flex flex-col flex-grow relative"
                  style={{ overflow: "visible" }}
                >
                  {/* Category + Date */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-[#FF0000] text-white text-[12px] font-[400] px-4 py-2 rounded-lg">
                      {event.category}
                    </span>
                    <div className="flex items-center gap-2 text-[16px] text-gray-800">
                      <CalendarDays className="w-5 h-5" />
                      <span className="font-medium">{event.date}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-[18px] font-[600] text-gray-900 leading-tight mb-4 line-clamp-2 min-h-[3.5rem] decoration-blue-300 decoration-2">
                    {event.title}
                  </h3>

                  {/* Location with Navigate Button */}
                  <div className="mb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[18px] text-[#FF0000] mb-1">
                          <div className="flex-shrink-0">
                            <MapPin
                              className="w-5 h-5"
                              style={{ minWidth: "20px", minHeight: "20px" }}
                            />
                          </div>
                          {event.locationUrl ? (
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                window.open(
                                  event.locationUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }}
                              className="font-[400] underline break-words hover:text-red-700 transition-colors cursor-pointer min-w-0 flex-1"
                            >
                              {event.location.split(",")[0]}
                            </span>
                          ) : (
                            <span className="font-[400] underline break-words min-w-0 flex-1">
                              {event.location.split(",")[0]}
                            </span>
                          )}
                        </div>
                        {event.location
                          .split(",")
                          .slice(1)
                          .join(",")
                          .trim() && (
                          <div className="text-[16px] text-[#FF0000] font-[400] ml-7 break-words">
                            {event.locationUrl ? (
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  window.open(
                                    event.locationUrl,
                                    "_blank",
                                    "noopener,noreferrer"
                                  );
                                }}
                                className="hover:text-red-700 transition-colors cursor-pointer"
                              >
                                {event.location
                                  .split(",")
                                  .slice(1)
                                  .join(",")
                                  .trim()}
                              </span>
                            ) : (
                              <span>
                                {event.location
                                  .split(",")
                                  .slice(1)
                                  .join(",")
                                  .trim()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Navigate Button - Positioned to the right of address */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleNavigate(event.locationUrl, event.location);
                          }}
                          className="flex items-center justify-center w-12 h-12 bg-[#FF0000] hover:bg-red-700 text-white rounded-lg transition-colors shadow-md cursor-pointer"
                          title="Navigate"
                        >
                          <img
                            src={navigationIcon}
                            alt="Navigate"
                            style={{ width: "25px", height: "25px" }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-gray-900 mt-1">
                          Navigate
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-2 text-[18px] text-gray-900 mb-5">
                    <Clock className="w-5 h-5 text-[#FF0000]" />
                    <span className="font-[400]">{event.time}</span>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="flex items-center justify-between gap-3 mt-auto"
                    style={{ position: "relative", zIndex: 10 }}
                  >
                    {/* Add to Calendar Button */}
                    <div className="relative flex-1 calendar-dropdown">
                      <button
                        ref={(el) => (buttonRefs.current[event.id] = el)}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleAddToCalendar(event.id);
                        }}
                        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-colors outline-none focus:outline-none focus:ring-0 ${
                          showCalendarDropdown[event.id]
                            ? "border-[#FF0000] shadow-md bg-white hover:border-[#FF0000]"
                            : "hover:bg-gray-200 hover:border-[#FF0000]"
                        }`}
                        style={{
                          outline: "none",
                          boxShadow: showCalendarDropdown[event.id]
                            ? "0 0 0 2px rgba(255, 0, 0, 0.1)"
                            : "none",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Add to Calendar</span>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            showCalendarDropdown[event.id] ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {/* Dropdown Menu - Using fixed positioning to escape overflow */}
                      {showCalendarDropdown[event.id] &&
                        (() => {
                          const urls = generateCalendarUrls(event);
                          return (
                            <div
                              ref={(el) => {
                                if (el) {
                                  dropdownRefs.current[event.id] = el;
                                  // Set position immediately when element is mounted
                                  setTimeout(() => {
                                    const button = buttonRefs.current[event.id];
                                    if (button && el) {
                                      const rect =
                                        button.getBoundingClientRect();
                                      el.style.position = "fixed";
                                      el.style.top = `${rect.bottom + 4}px`;
                                      el.style.left = `${rect.left}px`;
                                      el.style.width = `${rect.width}px`;
                                      el.style.display = "block";
                                    }
                                  }, 10);
                                }
                              }}
                              className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl calendar-dropdown py-1 min-w-[200px]"
                              style={{
                                zIndex: 1001,
                                display: "block",
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Download ICS */}
                              <a
                                href={urls.ics}
                                download={`${event.title.replace(
                                  /\s+/g,
                                  "-"
                                )}.ics`}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setShowCalendarDropdown({})}
                              >
                                <Download className="w-4 h-4 text-gray-600" />
                                <span>Download ICS</span>
                              </a>

                              {/* Google Calendar */}
                              <a
                                href={urls.google}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setShowCalendarDropdown({})}
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                  <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                  />
                                  <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                  />
                                  <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                  />
                                  <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                  />
                                </svg>
                                <span>Google Calendar</span>
                              </a>

                              {/* iCalendar (Apple) */}
                              <a
                                href={urls.ics}
                                download={`${event.title.replace(
                                  /\s+/g,
                                  "-"
                                )}.ics`}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setShowCalendarDropdown({})}
                              >
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <span>iCalendar</span>
                              </a>

                              {/* Office 365 */}
                              <a
                                href={urls.office365}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setShowCalendarDropdown({})}
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                  <path
                                    fill="#F25022"
                                    d="M12 2L2 7v10l10 5 10-5V7L12 2z"
                                  />
                                  <path
                                    fill="#FFFFFF"
                                    d="M12 2v20l10-5V7L12 2zm0 0L2 7l10 5 10-5-10-5z"
                                  />
                                </svg>
                                <span>Office 365</span>
                              </a>

                              {/* Outlook Live */}
                              <a
                                href={urls.outlook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors rounded-b-lg"
                                onClick={() => setShowCalendarDropdown({})}
                              >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                  <path
                                    fill="#0078D4"
                                    d="M7.5 7.5h9v9h-9v-9z"
                                  />
                                  <path
                                    fill="#0078D4"
                                    d="M3 3h18v18H3V3zm2 2v14h14V5H5z"
                                  />
                                </svg>
                                <span>Outlook Live</span>
                              </a>
                            </div>
                          );
                        })()}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === 1 || isLoading
                  ? "opacity-50 cursor-not-allowed text-gray-400"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Back
            </button>

            {getVisiblePages().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-[#FF0000] text-white"
                    : "text-gray-700 hover:bg-gray-200"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages || isLoading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === pagination.totalPages || isLoading
                  ? "opacity-50 cursor-not-allowed text-gray-400"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;

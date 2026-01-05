import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  ArrowUpRight,
  Home,
  Clock,
  X,
  Check,
  Copy,
  Calendar,
  ChevronDown,
  Download,
} from "lucide-react";
import {
  getPublicNewsAndEventById,
  getPublicNewsAndEvents,
} from "../../utils/newsAndEventsService";
import {
  getPublicUpcomingEventById,
  getPublicUpcomingEvents,
} from "../../utils/upcomingEventsService";
import { getCoverImageUrl, getImagesUrls } from "../../utils/imageUtils";
import { toast } from "react-toastify";
import shareIcon from "../../assets/images/share.png";
import navigationIcon from "../../assets/images/navigatepng.png";
import AnnualEventsSection from "../../components/AnnualEventsSection/AnnualEventsSection";

const EventDetail = () => {
  const { id } = useParams();
  const [eventItem, setEventItem] = useState(null);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  // Format date from ISO string to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "";
    }
  };

  // Format time from ISO string
  const formatTime = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch (error) {
      return "";
    }
  };

  // Map API response to component format
  const mapApiDataToComponent = (apiItem) => {
    return {
      id: apiItem.id,
      title: apiItem.title,
      category: apiItem.category_name || "",
      date: formatDate(apiItem.date_time),
      time: formatTime(apiItem.date_time),
      location: apiItem.location || "",
      image: getCoverImageUrl(apiItem.cover_image),
      type:
        apiItem.category_slug ||
        (apiItem.category_id === 1 ? "news" : "events"),
      url: `/${
        apiItem.category_slug || (apiItem.category_id === 1 ? "news" : "events")
      }/${apiItem.id}`,
      description: apiItem.description || "",
      images: getImagesUrls(apiItem.images),
    };
  };

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Handle add to calendar
  const handleAddToCalendar = () => {
    setShowCalendarDropdown((prev) => !prev);
  };

  // Update dropdown position
  const updateDropdownPosition = () => {
    if (showCalendarDropdown && buttonRef.current && dropdownRef.current) {
      const button = buttonRef.current;
      const dropdown = dropdownRef.current;
      const rect = button.getBoundingClientRect();
      dropdown.style.top = `${rect.bottom + 4}px`;
      dropdown.style.left = `${rect.left}px`;
      dropdown.style.width = `${rect.width}px`;
    }
  };

  // Update dropdown position when it opens or window changes
  useEffect(() => {
    if (showCalendarDropdown) {
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
      if (!isClickInside && showCalendarDropdown) {
        setShowCalendarDropdown(false);
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

  // Map upcoming event API response to component format
  const mapUpcomingEventToComponent = (apiItem) => {
    return {
      id: apiItem.id,
      title: apiItem.title || "",
      category: apiItem.category || "நிகழ்வுகள்",
      date: apiItem.date || "", // Already in DD/MM/YYYY format
      time: apiItem.time || "", // Already formatted as "15:30 மணி - 17:30 மணி"
      location: apiItem.location || "",
      locationUrl: apiItem.locationUrl || apiItem.location_url || "",
      image:
        apiItem.coverimage || apiItem.cover_image
          ? getCoverImageUrl(apiItem.coverimage || apiItem.cover_image)
          : "",
      type: "events",
      url: `/events/${apiItem.id}`,
      description: apiItem.description || "",
      images: [],
    };
  };

  // Fetch event detail
  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch from upcoming events API first
        try {
          const response = await getPublicUpcomingEventById(id);
          if (
            response.success &&
            response.data &&
            response.data.upcomingEvent
          ) {
            const apiItem = response.data.upcomingEvent;
            const mappedItem = mapUpcomingEventToComponent(apiItem);
            setEventItem(mappedItem);

            // Fetch recommended upcoming events
            const relatedResponse = await getPublicUpcomingEvents(1, 10);
            if (relatedResponse.success && relatedResponse.data) {
              const allEvents = relatedResponse.data.upcomingEvents || [];
              const recommended = allEvents
                .filter((item) => item.id !== parseInt(id))
                .slice(0, 1)
                .map(mapUpcomingEventToComponent);
              setRecommendedEvents(recommended);
            }

            // Fetch related events from news-and-events API
            const newsResponse = await getPublicNewsAndEvents(1, 20);
            if (newsResponse.success && newsResponse.data) {
              const allItems = newsResponse.data.newsAndEvents || [];

              // Fetch related items (all items, exclude current item, limit 6)
              const related = allItems
                .filter((item) => item.id !== parseInt(id))
                .slice(0, 6)
                .map(mapApiDataToComponent);
              setRelatedEvents(related);
            }
            return;
          }
        } catch (upcomingErr) {
          console.log("Not an upcoming event, trying news-and-events API");
        }

        // Fallback to news-and-events API
        const response = await getPublicNewsAndEventById(id);
        if (response.success && response.data && response.data.newsAndEvents) {
          const apiItem = response.data.newsAndEvents;

          // Only allow event items on event detail page
          if (apiItem.category_slug !== "events") {
            setError("This is not an event item");
            return;
          }

          const mappedItem = mapApiDataToComponent(apiItem);
          setEventItem(mappedItem);

          // Fetch recommended upcoming events
          const relatedResponse = await getPublicUpcomingEvents(1, 10);
          if (relatedResponse.success && relatedResponse.data) {
            const allEvents = relatedResponse.data.upcomingEvents || [];
            const recommended = allEvents
              .filter((item) => item.id !== parseInt(id))
              .slice(0, 1)
              .map(mapUpcomingEventToComponent);
            setRecommendedEvents(recommended);
          }

          // Fetch related events from news-and-events API
          const newsResponse = await getPublicNewsAndEvents(1, 20);
          if (newsResponse.success && newsResponse.data) {
            const allItems = newsResponse.data.newsAndEvents || [];

            // Fetch related items (all items, exclude current item, limit 6)
            const related = allItems
              .filter((item) => item.id !== parseInt(id))
              .slice(0, 6)
              .map(mapApiDataToComponent);
            setRelatedEvents(related);
          }
        } else {
          setError("Event not found");
        }
      } catch (err) {
        console.error("Error fetching event detail:", err);
        setError("Failed to load event");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchEventDetail();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-12 px-8 min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-gray-600">ஏற்றுகிறது...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !eventItem) {
    return (
      <div className="py-12 px-8 min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl text-gray-800 mb-4">நிகழ்வு கிடைக்கவில்லை</h1>
          <Link to="/" className="text-blue-600 hover:underline">
            முகப்பு பக்கத்திற்கு திரும்பு
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-[#F6F6F9] py-8 md:py-12 px-4 md:px-8 bg-gray-100 ">
        <div className="max-w-7xl mx-auto">
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
              <Link
                to={`/${eventItem.type === "news" ? "news" : "events"}`}
                className="text-black hover:text-[#FF0000] transition-colors"
              >
                {eventItem.type === "news" ? "செய்திகள்" : "நிகழ்வுகள்"}
              </Link>
              <span className="text-black">{">"}</span>
              <span className="text-[#FF0000] font-[400] truncate">
                {eventItem.title}
              </span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Left Side */}
            <div className="lg:col-span-2">
              {/* Category Badge and Date Row */}
              <div className="flex items-center justify-between mb-4">
                {/* Category Badge */}
                <div className="bg-[#FF0000] text-white px-4 py-2 rounded-lg text-[14px] font-[400]">
                  {eventItem.category}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-[16px] text-gray-800">
                  <CalendarDays className="w-5 h-5" />
                  <span className="font-medium">{eventItem.date}</span>
                </div>
              </div>

              {/* Article Title with Share Button */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-[700] text-black flex-1">
                  {eventItem.title}
                </h1>
                {/* Share Button */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center justify-center w-10 h-10 p-0 bg-transparent rounded-lg flex-shrink-0 border border-[#FF0000] outline-none !outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 active:outline-none hover:outline-none ring-0 ring-offset-0"
                  style={{ outline: "none", boxShadow: "none" }}
                  title="Share"
                  aria-label="Share"
                >
                  <img
                    src={shareIcon}
                    alt="Share"
                    className="w-5 h-5 object-contain"
                  />
                </button>
              </div>

              <div className="bg-white rounded-xl p-6">
                {/* Main Image */}
                <div className="mb-4 relative">
                  <img
                    src={eventItem.image}
                    alt={eventItem.title}
                    className="w-full h-auto rounded-xl"
                  />
                </div>

                {/* Event Details and Map - Side by Side */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                  {/* Left Column - Event Details */}
                  <div>
                    {/* Event Date */}
                    {eventItem.date && (
                      <div className="flex items-center gap-2 text-[18px] text-[#000000] mb-6">
                        <CalendarDays className="w-5 h-5" />
                        <span className="font-[400]">{eventItem.date}</span>
                      </div>
                    )}

                    {/* Event Time */}
                    {eventItem.time && (
                      <div className="flex items-center gap-2 text-[18px] text-[#000000] mb-6">
                        <Clock className="w-5 h-5" />
                        <span className="font-[400]">{eventItem.time}</span>
                      </div>
                    )}

                    {/* Event Location with Navigate */}
                    {eventItem.location && (
                      <div className="mb-6">
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 pt-0.5">
                            <MapPin
                              className="w-5 h-5"
                              style={{
                                minWidth: "20px",
                                minHeight: "20px",
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            {eventItem.locationUrl ? (
                              <a
                                href={eventItem.locationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-[400] underline break-words hover:text-red-700 transition-colors cursor-pointer text-[18px] text-[#000000] block"
                              >
                                {eventItem.location.split(",")[0]}
                              </a>
                            ) : (
                              <span className="font-[400] underline break-words text-[18px] text-[#000000] block">
                                {eventItem.location.split(",")[0]}
                              </span>
                            )}
                            {eventItem.location
                              .split(",")
                              .slice(1)
                              .join(",")
                              .trim() && (
                              <div className="text-[16px] text-[#000000] font-[400] break-words mt-1">
                                {eventItem.locationUrl ? (
                                  <a
                                    href={eventItem.locationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-red-700 transition-colors cursor-pointer"
                                  >
                                    {eventItem.location
                                      .split(",")
                                      .slice(1)
                                      .join(",")
                                      .trim()}
                                  </a>
                                ) : (
                                  <span>
                                    {eventItem.location
                                      .split(",")
                                      .slice(1)
                                      .join(",")
                                      .trim()}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Navigate Button - Below Location, Left Aligned */}
                        {eventItem.locationUrl && (
                          <div className="flex items-center gap-3 mt-4">
                            <a
                              href={eventItem.locationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center bg-[#FF0000] hover:bg-red-700 text-white rounded-lg transition-colors shadow-md cursor-pointer flex-shrink-0"
                              style={{ width: "32px", height: "32px" }}
                              title="Navigate"
                            >
                              <img
                                src={navigationIcon}
                                alt="Navigate"
                                style={{ width: "20px", height: "20px" }}
                              />
                            </a>
                            <a
                              href={eventItem.locationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[18px] font-[400] text-[#FF0000] underline hover:text-red-700 transition-colors cursor-pointer"
                            >
                              Navigate
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Add to Calendar Button */}
                    <div
                      className="relative calendar-dropdown"
                      style={{ position: "relative", zIndex: 10 }}
                    >
                      <button
                        ref={buttonRef}
                        onClick={handleAddToCalendar}
                        className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 transition-colors outline-none focus:outline-none focus:ring-0 ${
                          showCalendarDropdown
                            ? "border-[#FF0000] shadow-md bg-white hover:border-[#FF0000]"
                            : "hover:bg-gray-200 hover:border-[#FF0000]"
                        }`}
                        style={{
                          outline: "none",
                          boxShadow: showCalendarDropdown
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
                            showCalendarDropdown ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {/* Dropdown Menu - Using fixed positioning to escape overflow */}
                      {showCalendarDropdown &&
                        (() => {
                          const urls = generateCalendarUrls(eventItem);
                          return (
                            <div
                              ref={(el) => {
                                if (el) {
                                  dropdownRef.current = el;
                                  // Set position immediately when element is mounted
                                  setTimeout(() => {
                                    const button = buttonRef.current;
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
                                download={`${eventItem.title.replace(
                                  /\s+/g,
                                  "-"
                                )}.ics`}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setShowCalendarDropdown(false)}
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
                                onClick={() => setShowCalendarDropdown(false)}
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
                                download={`${eventItem.title.replace(
                                  /\s+/g,
                                  "-"
                                )}.ics`}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                onClick={() => setShowCalendarDropdown(false)}
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
                                onClick={() => setShowCalendarDropdown(false)}
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
                                onClick={() => setShowCalendarDropdown(false)}
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

                  {/* Right Column - Map View */}
                  {eventItem.locationUrl || eventItem.location ? (
                    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-gray-200">
                      {(() => {
                        // Convert locationUrl to embed format if it's a search URL
                        let mapUrl = "";
                        if (eventItem.locationUrl) {
                          try {
                            // Check if it's a search URL and extract the query parameter
                            const url = new URL(eventItem.locationUrl);
                            const query = url.searchParams.get("query");
                            if (query) {
                              // Convert search URL to embed format
                              mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
                                query
                              )}&output=embed`;
                            } else {
                              // Try to use the URL directly (might be an embed URL)
                              mapUrl = eventItem.locationUrl;
                            }
                          } catch (e) {
                            // If URL parsing fails, use location string
                            mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
                              eventItem.location || ""
                            )}&output=embed`;
                          }
                        } else if (eventItem.location) {
                          mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(
                            eventItem.location
                          )}&output=embed`;
                        }

                        return (
                          <iframe
                            src={mapUrl}
                            width="100%"
                            height="90%"
                            style={{ border: 0, minHeight: "300px" }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Event Location Map"
                          ></iframe>
                        );
                      })()}
                    </div>
                  ) : null}
                </div>

                {/* Additional Images */}
                {eventItem.images && eventItem.images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-[20px] font-[700] text-black mb-4">
                      படங்கள்
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eventItem.images.map((image, index) => (
                        <div
                          key={index}
                          className="rounded-xl overflow-hidden aspect-square"
                        >
                          <img
                            src={image}
                            alt={`${eventItem.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar - Right Side */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <h2 className="text-[24px] font-[700] text-black mb-6">
                  பரிந்துரைக்கப்பட்ட நிகழ்வுகள்
                </h2>

                {recommendedEvents.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedEvents.map((event) => (
                      <Link
                        key={event.id}
                        to={event.url}
                        className="block bg-white rounded-2xl overflow-hidden transition hover:shadow-xl cursor-pointer"
                      >
                        {/* Image */}
                        <div className="p-4">
                          <div className="h-56 rounded-xl overflow-hidden">
                            <img
                              src={event.image}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="px-5 pb-6">
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
                          <h3 className="text-[18px] font-[600] text-gray-900 leading-tight mb-4 line-clamp-2 min-h-[3.5rem]">
                            {event.title}
                          </h3>

                          {/* Location */}
                          {event.location && (
                            <div className="flex items-center gap-2 text-[18px] text-[#FF0000] mb-4">
                              <div className="flex-shrink-0">
                                <MapPin
                                  className="w-5 h-5"
                                  style={{
                                    minWidth: "20px",
                                    minHeight: "20px",
                                  }}
                                />
                              </div>
                              <span className="font-[400] break-words min-w-0 flex-1">
                                {event.location}
                              </span>
                            </div>
                          )}

                          {/* Time */}
                          {event.time && (
                            <div className="flex items-center gap-2 text-[18px] text-[#FF0000] mb-5">
                              <Clock className="w-5 h-5" />
                              <span className="font-[400]">{event.time}</span>
                            </div>
                          )}

                          {/* Read More */}
                          <div className="inline-flex items-center gap-1 text-[14px] text-[#002E90] font-[400]">
                            மேலும் படிக்க
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    பரிந்துரைக்கப்பட்ட நிகழ்வுகள் இல்லை
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Related Events Section */}
          <div className="mt-12">
            <h2 className="text-[30px] font-[700] text-black mb-8">
              தொடர்புடைய செய்திகள்
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedEvents.length > 0 ? (
                relatedEvents.map((item) => (
                  <Link
                    key={item.id}
                    to={item.url}
                    className="bg-white rounded-2xl overflow-hidden transition hover:shadow-xl cursor-pointer block"
                  >
                    {/* Image */}
                    <div className="p-4">
                      <div className="h-56 rounded-xl overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-5 pb-6">
                      {/* Category + Date */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-[#FF0000] text-white text-[12px] font-[400] px-4 py-2 rounded-lg">
                          {item.category}
                        </span>
                        <div className="flex items-center gap-2 text-[16px] text-gray-800">
                          <CalendarDays className="w-5 h-5" />
                          <span className="font-medium">{item.date}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-[18px] font-[600] text-gray-900 leading-tight mb-4 line-clamp-2 min-h-[3.5rem]">
                        {item.title}
                      </h3>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-[18px] text-[#FF0000] mb-4">
                        <MapPin className="w-5 h-5" />
                        <span className="font-[400]">{item.location}</span>
                      </div>

                      {/* Snippet */}
                      {item.description && (
                        <div className="mb-4">
                          <div
                            className="text-[14px] text-gray-700 font-[400] leading-relaxed line-clamp-3"
                            dangerouslySetInnerHTML={{
                              __html:
                                item.description.substring(0, 200) + "...",
                            }}
                          />
                        </div>
                      )}

                      {/* Read More */}
                      <div className="inline-flex items-center gap-1 text-[14px] text-[#002E90] font-[400]">
                        மேலும் படிக்க
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-600">தொடர்புடைய நிகழ்வுகள் இல்லை</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowShareModal(false);
            setLinkCopied(false);
          }}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-[700] text-gray-900">Share Link</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setLinkCopied(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Link Display */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Copy this link to share
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={window.location.href}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
                />
                <button
                  onClick={async () => {
                    const url = window.location.href;

                    // Try modern clipboard API first
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      try {
                        await navigator.clipboard.writeText(url);
                        setLinkCopied(true);
                        toast.success("Link copied to clipboard!", {
                          position: "top-right",
                          autoClose: 2000,
                        });
                        setTimeout(() => setLinkCopied(false), 2000);
                        return;
                      } catch (err) {
                        console.error("Clipboard API failed:", err);
                      }
                    }

                    // Fallback: Use the old method
                    try {
                      const input = document.createElement("input");
                      input.value = url;
                      input.style.position = "fixed";
                      input.style.opacity = "0";
                      input.style.pointerEvents = "none";
                      document.body.appendChild(input);
                      input.select();
                      input.setSelectionRange(0, 99999); // For mobile devices

                      const successful = document.execCommand("copy");
                      document.body.removeChild(input);

                      if (successful) {
                        setLinkCopied(true);
                        toast.success("Link copied to clipboard!", {
                          position: "top-right",
                          autoClose: 2000,
                        });
                        setTimeout(() => setLinkCopied(false), 2000);
                      } else {
                        throw new Error("execCommand failed");
                      }
                    } catch (err) {
                      console.error("Fallback copy failed:", err);
                      toast.error(
                        "Failed to copy link. Please copy manually.",
                        {
                          position: "top-right",
                          autoClose: 3000,
                        }
                      );
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-medium flex-shrink-0 ${
                    linkCopied
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-[#FF0000] hover:bg-red-700 text-white"
                  }`}
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Annual Events Section */}
      <AnnualEventsSection />
    </>
  );
};

export default EventDetail;

import { useState, useEffect } from "react";
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
} from "lucide-react";
import {
  getPublicNewsAndEventById,
  getPublicNewsAndEvents,
} from "../../utils/newsAndEventsService";
import { getPublicUpcomingEvents } from "../../utils/upcomingEventsService";
import { getCoverImageUrl, getImagesUrls } from "../../utils/imageUtils";
import { toast } from "react-toastify";
import shareIcon from "../../assets/images/share.png";
import AnnualEventsSection from "../../components/AnnualEventsSection/AnnualEventsSection";

const NewsAndEventsDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [recommendedItems, setRecommendedItems] = useState([]);
  const [relatedItems, setRelatedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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

  // Map API response to component format
  const mapApiDataToComponent = (apiItem) => {
    return {
      id: apiItem.id,
      title: apiItem.title,
      category: apiItem.category_name || "",
      date: formatDate(apiItem.date_time),
      location: apiItem.location || "",
      image: getCoverImageUrl(apiItem.cover_image),
      type:
        apiItem.category_slug ||
        (apiItem.category_id === 1 ? "news" : "events"),
      url: `/news/${apiItem.id}`, // Unified URL for both news and events
      description: apiItem.description || "",
      images: getImagesUrls(apiItem.images),
    };
  };

  // Map upcoming events API response to component format
  const mapUpcomingEventToComponent = (apiItem) => {
    return {
      id: apiItem.id,
      title: apiItem.title || "",
      category: apiItem.category || "நிகழ்வுகள்",
      date: apiItem.date || "", // Already in DD/MM/YYYY format
      time: apiItem.time || "", // Already formatted as "15:30 மணி - 17:30 மணி"
      location: apiItem.location || "",
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

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Fetch news/event detail
  useEffect(() => {
    const fetchItemDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getPublicNewsAndEventById(id);
        if (response.success && response.data && response.data.newsAndEvents) {
          const apiItem = response.data.newsAndEvents;

          // Allow both news and events
          const mappedItem = mapApiDataToComponent(apiItem);
          setItem(mappedItem);

          // Fetch recommended items from upcoming events API (limit 1)
          const upcomingEventsResponse = await getPublicUpcomingEvents(1, 10);
          if (upcomingEventsResponse.success && upcomingEventsResponse.data) {
            const allUpcomingEvents =
              upcomingEventsResponse.data.upcomingEvents || [];
            const recommended = allUpcomingEvents
              .slice(0, 1)
              .map(mapUpcomingEventToComponent);
            setRecommendedItems(recommended);
          }

          // Fetch related items (all items, exclude current item, limit 6)
          // Fetch more items to ensure we have enough for related items
          const responseData = await getPublicNewsAndEvents(1, 20);
          if (responseData.success && responseData.data) {
            const allItems = responseData.data.newsAndEvents || [];
            const related = allItems
              .filter((item) => item.id !== parseInt(id))
              .slice(0, 6)
              .map(mapApiDataToComponent);
            setRelatedItems(related);
          }
        } else {
          setError("Item not found");
        }
      } catch (err) {
        console.error("Error fetching item detail:", err);
        setError("Failed to load item");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchItemDetail();
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

  if (error || !item) {
    return (
      <div className="py-12 px-8 min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl text-gray-800 mb-4">தகவல் கிடைக்கவில்லை</h1>
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
                to="/news"
                className="text-black hover:text-[#FF0000] transition-colors"
              >
                செய்திகள்
              </Link>
              <span className="text-black">{">"}</span>
              <span className="text-[#FF0000] font-[400] truncate">
                {item.title}
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
                  {item.category}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-[16px] text-gray-800">
                  <CalendarDays className="w-5 h-5" />
                  <span className="font-medium">{item.date}</span>
                </div>
              </div>

              {/* Article Title with Share Button */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-[700] text-black flex-1">
                  {item.title}
                </h1>
                {/* Share Button */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="
    flex items-center justify-center w-10 h-10 p-0
    bg-transparent rounded-lg flex-shrink-0
    border border-[#FF0000]
    outline-none ring-0
    focus:outline-none focus:ring-0
    focus-visible:outline-none focus-visible:ring-0
    active:outline-none
    hover:border-[#FF0000]
  "
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
                {/* Main Image with Location Overlay */}
                <div className="mb-8 relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-auto rounded-xl"
                  />
                  {/* Location Badge - Overlay on top right */}
                  {item.location && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 text-[14px] font-[400]">
                        <MapPin className="w-4 h-4 text-white" />
                        <span>{item.location}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description Content */}
                {item.description ? (
                  <div className="mb-8">
                    <div
                      className="text-[16px] text-gray-800 font-[400] leading-relaxed prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  </div>
                ) : (
                  <div className="mb-8">
                    <p className="text-[16px] text-gray-800 font-[400] leading-relaxed">
                      {item.title} பற்றிய விரிவான தகவல்கள்.
                    </p>
                  </div>
                )}

                {/* Additional Images */}
                {item.images && item.images.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-[20px] font-[700] text-black mb-4">
                      படங்கள்
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.images.map((image, index) => (
                        <div
                          key={index}
                          className="rounded-xl overflow-hidden aspect-square"
                        >
                          <img
                            src={image}
                            alt={`${item.title} - Image ${index + 1}`}
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
                  {item.type === "news"
                    ? "பரிந்துரைக்கப்பட்ட நிகழ்வுகள்"
                    : "பரிந்துரைக்கப்பட்ட செய்திகள்"}
                </h2>

                {recommendedItems.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedItems.map((recommendedItem) => (
                      <Link
                        key={recommendedItem.id}
                        to={recommendedItem.url}
                        className="block bg-white rounded-2xl overflow-hidden transition hover:shadow-xl cursor-pointer"
                      >
                        {/* Image */}
                        <div className="p-4">
                          <div className="h-56 rounded-xl overflow-hidden">
                            <img
                              src={recommendedItem.image}
                              alt={recommendedItem.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="px-5 pb-6">
                          {/* Category + Date */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="bg-[#FF0000] text-white text-[12px] font-[400] px-4 py-2 rounded-lg">
                              {recommendedItem.category}
                            </span>
                            <div className="flex items-center gap-2 text-[16px] text-gray-800">
                              <CalendarDays className="w-5 h-5" />
                              <span className="font-medium">
                                {recommendedItem.date}
                              </span>
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="text-[18px] font-[600] text-gray-900 leading-tight mb-4 line-clamp-2 min-h-[3.5rem]">
                            {recommendedItem.title}
                          </h3>

                          {/* Location */}
                          <div className="flex items-center gap-2 text-[18px] text-[#FF0000] mb-4">
                            <MapPin className="w-5 h-5" />
                            <span className="font-[400]">
                              {recommendedItem.location}
                            </span>
                          </div>

                          {/* Time */}
                          {recommendedItem.time && (
                            <div className="flex items-center gap-2 text-[18px] text-[#FF0000] mb-5">
                              <Clock className="w-5 h-5" />
                              <span className="font-[400]">
                                {recommendedItem.time}
                              </span>
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
                    {item.type === "news"
                      ? "பரிந்துரைக்கப்பட்ட நிகழ்வுகள் இல்லை"
                      : "பரிந்துரைக்கப்பட்ட செய்திகள் இல்லை"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Related Items Section */}
          <div className="mt-12">
            <h2 className="text-[30px] font-[700] text-black mb-8">
              தொடர்புடைய செய்திகள்
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedItems.length > 0 ? (
                relatedItems.map((relatedItem) => (
                  <Link
                    key={relatedItem.id}
                    to={relatedItem.url}
                    className="bg-white rounded-2xl overflow-hidden transition hover:shadow-xl cursor-pointer block"
                  >
                    {/* Image */}
                    <div className="p-4">
                      <div className="h-56 rounded-xl overflow-hidden">
                        <img
                          src={relatedItem.image}
                          alt={relatedItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-5 pb-6">
                      {/* Category + Date */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-[#FF0000] text-white text-[12px] font-[400] px-4 py-2 rounded-lg">
                          {relatedItem.category}
                        </span>
                        <div className="flex items-center gap-2 text-[16px] text-gray-800">
                          <CalendarDays className="w-5 h-5" />
                          <span className="font-medium">
                            {relatedItem.date}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-[18px] font-[600] text-gray-900 leading-tight mb-4 line-clamp-2 min-h-[3.5rem]">
                        {relatedItem.title}
                      </h3>

                      {/* Location */}
                      {relatedItem.location && (
                        <div className="flex items-center gap-2 text-[18px] text-[#FF0000] mb-4">
                          <MapPin className="w-5 h-5" />
                          <span className="font-[400]">
                            {relatedItem.location}
                          </span>
                        </div>
                      )}

                      {/* Snippet */}
                      {relatedItem.description && (
                        <div className="mb-4">
                          <div
                            className="text-[14px] text-gray-700 font-[400] leading-relaxed line-clamp-3"
                            dangerouslySetInnerHTML={{
                              __html:
                                relatedItem.description.substring(0, 200) +
                                "...",
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
                      // Last resort: Select the input field for manual copy
                      const inputElement = document.querySelector(
                        'input[readonly][value*="http"]'
                      );
                      if (inputElement) {
                        inputElement.select();
                        inputElement.setSelectionRange(0, 99999);
                        toast.info("Please press Ctrl+C (or Cmd+C) to copy", {
                          position: "top-right",
                          autoClose: 3000,
                        });
                      } else {
                        toast.error(
                          "Failed to copy link. Please copy manually.",
                          {
                            position: "top-right",
                            autoClose: 3000,
                          }
                        );
                      }
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-medium flex-shrink-0
    appearance-none
    outline-none ring-0
    focus:outline-none focus:ring-0
    focus-visible:outline-none focus-visible:ring-0
    active:outline-none
    ${
      linkCopied
        ? "bg-green-500 hover:bg-green-600 text-white"
        : "bg-[#FF0000] hover:bg-red-700 text-white"
    }
  `}
                  style={{ WebkitTapHighlightColor: "transparent" }}
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

export default NewsAndEventsDetail;

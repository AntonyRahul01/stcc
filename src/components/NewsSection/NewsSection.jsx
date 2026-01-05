import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Calendar,
  CalendarDays,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import AOS from "aos";
import { getPublicNewsAndEvents } from "../../utils/newsAndEventsService";
import { getCoverImageUrl } from "../../utils/imageUtils";

const NewsSection = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("cards");
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [pagination, setPagination] = useState(null);

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
  const mapApiDataToComponent = (apiData) => {
    return apiData.map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category_name || "",
      date: formatDate(item.date_time),
      location: item.location || "",
      image: getCoverImageUrl(item.cover_image),
      type: item.category_slug || (item.category_id === 1 ? "news" : "events"),
      url: `/news/${item.id}`, // Unified URL for both news and events
    }));
  };

  // Fetch news and events from API
  const fetchNewsAndEvents = async (page = 1, limit = 6, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await getPublicNewsAndEvents(page, limit);

      if (response.success && response.data) {
        const mappedData = mapApiDataToComponent(
          response.data.newsAndEvents || []
        );

        if (append) {
          setAllData((prev) => [...prev, ...mappedData]);
        } else {
          setAllData(mappedData);
        }

        setPagination(response.data.pagination);
        setHasMore(response.data.pagination?.hasNext || false);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching news and events:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchNewsAndEvents(1, 6, false);
  }, []);

  // Filter data based on active tab
  const filteredData =
    activeTab === "all"
      ? allData
      : allData.filter((item) => item.type === activeTab);

  useEffect(() => {
    // Refresh AOS when component mounts and when tab changes
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 50);

    return () => clearTimeout(timer);
  }, [activeTab, filteredData]);

  return (
    <div className="w-full bg-gray-100 py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="p-6 mb-8">
          {/* Title */}
          <h2
            className="text-[30px] font-[700] text-black mb-6"
            data-aos="fade-up"
          >
            புதிய தகவல்கள்
          </h2>

          {/* Navigation and View Options */}
          <div
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {/* Navigation Tabs - Left */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border flex-shrink-0 ${
                  activeTab === "all"
                    ? "bg-[#FF0000] text-white border-transparent hover:border-transparent"
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                அனைத்தும்
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border flex-shrink-0 ${
                  activeTab === "news"
                    ? "bg-[#FF0000] text-white border-transparent hover:border-transparent"
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                செய்திகள்
              </button>
              <button
                onClick={() => setActiveTab("events")}
                className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all border flex-shrink-0 ${
                  activeTab === "events"
                    ? "bg-[#FF0000] text-white border-transparent hover:border-transparent"
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                நிகழ்வுகள்
              </button>
            </div>

            {/* View Options - Right */}
            {/* <div className="bg-gray-200 rounded-md p-1 flex gap-1">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 border ${
                  viewMode === "cards"
                    ? "bg-white text-[#FF0000] border-transparent hover:border-transparent"
                    : "text-gray-700 border-transparent hover:bg-gray-100 hover:border-transparent"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-sm font-medium">Cards</span>
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`px-3 py-2 rounded-md transition-all flex items-center gap-2 border ${
                  viewMode === "calendar"
                    ? "bg-white text-[#FF0000] border-transparent hover:border-transparent"
                    : "text-gray-700 border-transparent hover:bg-gray-100 hover:border-transparent"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Calendar</span>
              </button>
            </div> */}
          </div>
        </div>

        {/* Cards Grid */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {isLoading ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">ஏற்றுகிறது...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600">தகவல்கள் எதுவும் கிடைக்கவில்லை</p>
              </div>
            ) : (
              filteredData.map((item, index) => (
                <Link
                  key={`${activeTab}-${item.id}`}
                  to={item.url}
                  className="bg-white rounded-2xl overflow-hidden transition hover:shadow-xl cursor-pointer block"
                  data-aos="fade-up"
                  data-aos-delay={100 + (index % 3) * 100}
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
                    {/* <div className="flex items-center gap-2 text-[18px] text-[#FF0000] mb-5">
                      <MapPin className="w-5 h-5" />
                      <span className="font-[400]">{item.location}</span>
                    </div> */}

                    {/* Read More */}
                    <div className="inline-flex items-center gap-1 text-[14px] text-[#002E90] font-[400]">
                      மேலும் படிக்க
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center" data-aos="fade-up" data-aos-delay="300">
          <Link
            to="/news"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-block bg-[#FF0000] text-white px-10 py-3.5 rounded-full text-base font-medium hover:bg-red-700 transition-colors border-0 focus:outline-none focus:ring-0"
          >
            அனைத்தையும் காண்க
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsSection;

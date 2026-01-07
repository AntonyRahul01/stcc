import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, MapPin, ArrowUpRight, Home } from "lucide-react";
import { getPublicNewsAndEvents } from "../../utils/newsAndEventsService";
import { getCoverImageUrl } from "../../utils/imageUtils";

const News = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allData, setAllData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Get page from URL params or default to 1
  useEffect(() => {
    const page = parseInt(searchParams.get("page")) || 1;
    setCurrentPage(page);
  }, [searchParams]);

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
      description: item.description || "",
    }));
  };

  // Fetch news and events from API
  const fetchNewsAndEvents = async (page = 1, limit = 18) => {
    try {
      setIsLoading(true);
      const response = await getPublicNewsAndEvents(page, limit);

      if (response.success && response.data) {
        const allItems = response.data.newsAndEvents || [];
        // Show both news and events
        const mappedData = mapApiDataToComponent(allItems);
        setAllData(mappedData);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching news and events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch news and events when page changes
  useEffect(() => {
    fetchNewsAndEvents(currentPage, 18);
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate pagination
  const totalPages = pagination?.totalPages || 1;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  // Show max 5 page numbers around current page
  const getVisiblePages = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return pages;
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

  return (
    <div className="w-full bg-[#F6F6F9] py-8 md:py-12 px-4 md:px-8">
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
            <span className="text-[#FF0000] font-[400]">செய்திகள்</span>
          </nav>
        </div>

        {/* Page Title */}
        <h1 className="text-[30px] font-[700] text-black mb-8">செய்திகள்</h1>

        {/* News and Events Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">ஏற்றுகிறது...</p>
          </div>
        ) : allData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">தகவல்கள் எதுவும் கிடைக்கவில்லை</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {allData.map((item) => (
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
                        {item.type === "community-fund"
                          ? "செய்திகள்"
                          : item.category}
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
                    {item.location && (
                      <div className="flex items-center gap-2 text-[18px] text-[#FF0000] mb-4">
                        <MapPin className="w-5 h-5" />
                        <span className="font-[400]">{item.location}</span>
                      </div>
                    )}

                    {/* Snippet */}
                    {item.description && (
                      <div className="mb-4">
                        <div
                          className="text-[14px] text-gray-700 font-[400] leading-relaxed line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html: item.description.substring(0, 200) + "...",
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
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed text-gray-400"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  &lt; Back
                </button>

                {getVisiblePages().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? "bg-[#FF0000] text-white"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed text-gray-400"
                      : "text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Next &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default News;

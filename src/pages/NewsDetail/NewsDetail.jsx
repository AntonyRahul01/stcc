import { useParams, Link } from "react-router-dom";
import { CalendarDays, MapPin, ArrowUpRight, Home, Clock } from "lucide-react";
import { getAllData } from "../../utils/dataService";
import AnnualEventsSection from "../../components/AnnualEventsSection/AnnualEventsSection";

const NewsDetail = () => {
  const { id } = useParams();
  const allData = getAllData();
  const newsItem = allData.find((item) => item.id === parseInt(id));

  if (!newsItem) {
    return (
      <div className="py-12 px-8 min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl text-gray-800 mb-4">செய்தி கிடைக்கவில்லை</h1>
          <Link to="/" className="text-blue-600 hover:underline">
            முகப்பு பக்கத்திற்கு திரும்பு
          </Link>
        </div>
      </div>
    );
  }

  // Recommended events (for sidebar)
  const recommendedEvents = allData
    .filter((item) => item.type === "events")
    .slice(0, 3);

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
                {newsItem.title}
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
                  {newsItem.category}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-[16px] text-gray-800">
                  <CalendarDays className="w-5 h-5" />
                  <span className="font-medium">{newsItem.date}</span>
                </div>
              </div>

              {/* Article Title */}
              <h1 className="text-2xl md:text-3xl font-[700] text-black mb-6">
                {newsItem.title}
              </h1>

              <div className="bg-white rounded-xl p-6">
                {/* Main Image with Location Overlay */}
                <div className="mb-8 relative">
                  <img
                    src={newsItem.image}
                    alt={newsItem.title}
                    className="w-full h-auto rounded-xl"
                  />
                  {/* Location Badge - Overlay on top right */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-black text-white px-4 py-2 rounded-full flex items-center gap-2 text-[14px] font-[400]">
                      <MapPin className="w-4 h-4 text-white" />
                      <span>{newsItem.location}</span>
                    </div>
                  </div>
                </div>

                {/* News/Update Blocks - Timeline Style */}
                {newsItem.content && newsItem.content.length > 0 ? (
                  <div className="relative mb-8">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-400"></div>

                    <div className="space-y-8 pl-12">
                      {newsItem.content.map((block, index) => (
                        <div key={index} className="relative">
                          {/* Timeline Node - Centered on line at 16px (left-4) */}
                          <div
                            className="absolute top-2 w-4 h-4 rounded-full bg-gray-500 border-2 border-white z-10"
                            style={{ left: "-40px" }}
                          ></div>

                          {/* Date Box */}
                          <div className="mb-4">
                            <div className="bg-[#FF0000] text-white px-5 py-2 rounded-lg inline-block text-[14px] font-[400]">
                              {block.date}
                            </div>
                          </div>

                          {/* Title */}
                          <h3 className="text-[18px] text-[#002E90] font-[700] mb-3">
                            {block.title}
                          </h3>

                          {/* Description */}
                          <p className="text-[14px] text-black font-[400] leading-relaxed mb-3">
                            {block.description}
                          </p>

                          {/* Locations */}
                          {block.locations && (
                            <div className="mt-3">
                              <div className="text-[14px] text-black font-[600] mb-2">
                                வழங்கப்பெற்ற இடங்கள்:
                              </div>
                              <div className="text-[14px] text-black font-[400]">
                                {block.locations}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <p className="text-[16px] text-gray-800 font-[400] leading-relaxed">
                      {newsItem.title} பற்றிய விரிவான தகவல்கள்.
                    </p>
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
                          <div className="flex items-center gap-2 text-[18px] text-[#FF0000] mb-4">
                            <MapPin className="w-5 h-5" />
                            <span className="font-[400]">{event.location}</span>
                          </div>

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

          {/* Related News Section */}
          <div className="mt-12">
            <h2 className="text-[30px] font-[700] text-black mb-8">
              தொடர்புடைய செய்திகள்
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsData
                .filter(
                  (item) => item.id !== newsItem.id && item.type === "news"
                )
                .slice(0, 6)
                .map((item) => (
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
                      {item.content && item.content.length > 0 && (
                        <p className="text-[14px] text-gray-700 font-[400] leading-relaxed mb-4 line-clamp-3">
                          {item.content[0].date} {item.content[0].title}{" "}
                          {item.content[0].description.substring(0, 100)}...
                        </p>
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
          </div>
        </div>
      </div>
      {/* Annual Events Section */}
      <AnnualEventsSection />
    </>
  );
};

export default NewsDetail;

import { useEffect, useState } from "react";
import AOS from "aos";
import { getPublicAnnualEvents } from "../../utils/annualEventsService";
import { getImageUrl } from "../../utils/imageUtils";

const AnnualEventsSection = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnnualEvents();
  }, []);

  const loadAnnualEvents = async () => {
    try {
      const response = await getPublicAnnualEvents();
      if (
        response.success &&
        response.data &&
        response.data.annualEventSchedules &&
        Array.isArray(response.data.annualEventSchedules)
      ) {
        // response.data.annualEventSchedules is an array of annual event schedules
        setData(response.data.annualEventSchedules);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error loading annual events:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Refresh AOS when component mounts or data changes
    if (data) {
      const timer = setTimeout(() => {
        AOS.refresh();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [data]);

  if (isLoading || !data || !Array.isArray(data)) {
    return (
      <div className="w-full bg-[#ECE5D9] py-12 md:py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter only active annual events with images
  const activeEventsWithImages = data.filter(
    (event) => event.status === "active" && event.image
  );

  // Get first two events with images
  const event1 = activeEventsWithImages[0];
  const event2 = activeEventsWithImages[1];

  return (
    <div className="w-full bg-[#ECE5D9] py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2
          className="text-black text-2xl md:text-3xl font-[700] mb-8 md:mb-12 "
          data-aos="fade-up"
          data-aos-delay="100"
        >
          வருடாந்த நிகழ்வுகள்
        </h2>

        {/* Images Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* First Box */}
          <div className="w-full" data-aos="fade-up" data-aos-delay="200">
            {event1 && event1.image ? (
              <img
                src={getImageUrl(event1.image)}
                alt="வருடாந்த நிகழ்வுகள்"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full flex items-center justify-center bg-white rounded-lg shadow-lg min-h-[950px]">
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-[700] text-gray-800 mb-2">
                    விரைவில்...
                  </h3>
                </div>
              </div>
            )}
          </div>

          {/* Second Box */}
          <div className="w-full" data-aos="fade-up" data-aos-delay="300">
            {event2 && event2.image ? (
              <img
                src={getImageUrl(event2.image)}
                alt="வருடாந்த நிகழ்வுகள்"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full flex items-center justify-center bg-white rounded-lg shadow-lg min-h-[950px]">
                <div className="text-center">
                  <h3 className="text-2xl md:text-3xl font-[700] text-gray-800 mb-2">
                    விரைவில்...
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualEventsSection;

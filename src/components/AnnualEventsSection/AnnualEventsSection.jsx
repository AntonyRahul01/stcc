import { useEffect } from "react";
import AOS from "aos";
import annualEvent01 from "../../assets/images/annualevent01.png";
import annualEvent02 from "../../assets/images/annualevent02.png";

const AnnualEventsSection = () => {
  useEffect(() => {
    // Refresh AOS when component mounts
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

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
          {/* First Calendar Image */}
          <div
            className="w-full"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <img
              src={annualEvent01}
              alt="வருடாந்த நிகழ்வுகள் 2025"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>

          {/* Second Calendar Image */}
          <div
            className="w-full"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <img
              src={annualEvent02}
              alt="வருடாந்த நிகழ்வுகள் 2025"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualEventsSection;

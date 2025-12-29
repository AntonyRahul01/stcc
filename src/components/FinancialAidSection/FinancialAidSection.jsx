import { useEffect } from "react";
import { Handshake } from "lucide-react";
import AOS from "aos";

const FinancialAidSection = () => {
  useEffect(() => {
    // Refresh AOS when component mounts
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      AOS.refresh();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full bg-[#FF0000] py-8 sm:py-12 md:py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        {/* Title */}
        <h2
          className="text-white text-xl sm:text-2xl md:text-3xl font-[700] mb-6 sm:mb-8 md:mb-12"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          நிதி உதவி 2025
        </h2>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Left Card - CHF */}
          <div
            className="rounded-lg border border-white p-4 sm:p-6 md:p-8"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <Handshake className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white stroke-2" />
            </div>

            {/* Amount */}
            <div className="text-center mb-4">
              <div
                className="text-3xl sm:text-4xl md:text-5xl text-white mb-2"
                style={{ fontFamily: "MuktaVaani-ExtraLight", fontWeight: 200 }}
              >
                9201.60
              </div>
              <div className="text-sm sm:text-base md:text-lg text-white font-[400]">
                நிதி உதவி CHF
              </div>
            </div>
          </div>

          {/* Right Card - SLR */}
          <div
            className="rounded-lg border border-white p-4 sm:p-6 md:p-8"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            {/* Icon */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <Handshake className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white stroke-2" />
            </div>

            {/* Amount */}
            <div className="text-center mb-4">
              <div
                className="text-3xl sm:text-4xl md:text-5xl text-white mb-2"
                style={{ fontFamily: "MuktaVaani-ExtraLight", fontWeight: 200 }}
              >
                3100000
              </div>
              <div className="text-sm sm:text-base md:text-lg text-white font-[400]">
                நிதி உதவி SLR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialAidSection;

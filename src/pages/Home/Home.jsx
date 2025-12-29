import Banner from "../../components/Banner/Banner";
import QuoteSection from "../../components/QuoteSection/QuoteSection";
import NewsSection from "../../components/NewsSection/NewsSection";
import FinancialAidSection from "../../components/FinancialAidSection/FinancialAidSection";
import AnnualEventsSection from "../../components/AnnualEventsSection/AnnualEventsSection";

const Home = () => {
  return (
    <div className="w-full">
      <Banner />
      <QuoteSection />
      <NewsSection />
      <FinancialAidSection />
      <AnnualEventsSection />
    </div>
  );
};

export default Home;

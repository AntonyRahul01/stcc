import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Newspaper,
  Tag,
  Menu,
  X,
  LayoutDashboard,
  User,
  Calendar,
  Home,
  Mail,
} from "lucide-react";
import NewsAndEventsManagement from "../NewsAndEventsManagement/NewsAndEventsManagement";
import CategoriesManagement from "../CategoriesManagement/CategoriesManagement";
import UpcomingEventsManagement from "../UpcomingEventsManagement/UpcomingEventsManagement";
import TopBannerManagement from "../TopBannerManagement/TopBannerManagement";
import FooterBannerManagement from "../FooterBannerManagement/FooterBannerManagement";
import LeaderBannerManagement from "../LeaderBannerManagement/LeaderBannerManagement";
import BannerManagement from "../BannerManagement/BannerManagement";
import QuotesManagement from "../QuotesManagement/QuotesManagement";
import FinancialAidManagement from "../FinancialAidManagement/FinancialAidManagement";
import AnnualEventsManagement from "../AnnualEventsManagement/AnnualEventsManagement";
import ContactManagement from "../ContactManagement/ContactManagement";

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "news-and-events", label: "News & Events", icon: Newspaper },
    { id: "upcoming-events", label: "Upcoming Events", icon: Calendar },
    { id: "contacts", label: "Contacts", icon: Mail },
    // { id: "categories", label: "Categories", icon: Tag },
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-40 h-16">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="hidden sm:block text-xs text-gray-500">
                  Content Management System
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 h-full ${
            sidebarOpen ? "w-64" : "w-0"
          } ${sidebarOpen ? "block" : "hidden"} lg:block lg:w-64 shadow-sm`}
        >
          <nav className="p-4 space-y-1 h-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                    isActive
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />
                  <span className="text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full">
            {activeSection === "home" && (
              <div className="space-y-8">
                <TopBannerManagement />
                <FooterBannerManagement />
                <LeaderBannerManagement />
                <BannerManagement />
                <QuotesManagement />
                <FinancialAidManagement />
                <AnnualEventsManagement />
              </div>
            )}
            {activeSection === "news-and-events" && <NewsAndEventsManagement />}
            {activeSection === "upcoming-events" && (
              <UpcomingEventsManagement />
            )}
            {activeSection === "contacts" && <ContactManagement />}
            {activeSection === "categories" && <CategoriesManagement />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

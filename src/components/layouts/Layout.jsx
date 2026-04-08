import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import SearchBar from "./SearchBar";
import { useSelector } from "react-redux";

const Layout = ({ children }) => {
  const role = useSelector((state) => state.auth.user?.role);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <Navbar />

      {/* Mobile Search Bar - Only visible on mobile, below navbar */}
      <div className="md:hidden bg-slate-800 border-b border-slate-700 px-3 py-2.5">
        {role === 'INTERVIEWER' ? (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search pending feedbacks..."
              className="w-full pl-9 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              onChange={(e) => {
                const event = new CustomEvent('interviewSearch', { detail: e.target.value });
                window.dispatchEvent(event);
              }}
            />
          </div>
        ) : (
          <SearchBar />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Hidden on mobile */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 flex flex-col pb-16 md:pb-0">
          <div className="p-4 md:p-6 flex-1">
            {children}
          </div>
          {/* Footer - Hidden on mobile */}
          <div className="hidden md:block">
            <Footer />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only visible on mobile */}
      <MobileBottomNav />
    </div>
  );
};

export default Layout;